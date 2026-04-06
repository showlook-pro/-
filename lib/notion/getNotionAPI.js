import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'
import path from 'path'
import { RateLimiter } from './RateLimiter'

// 限流配置，打包编译阶段避免接口频繁，限制频率
const useRateLimiter = process.env.BUILD_MODE || process.env.EXPORT
const lockFilePath = path.resolve(process.cwd(), '.notion-api-lock')
const rateLimiter = new RateLimiter(200, lockFilePath)

const globalStore = { notion: null, inflight: new Map() }
const RECORD_MAP_KEYS = [
  'block',
  'collection',
  'collection_view',
  'notion_user',
  'space'
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRawNotion() {
  if (!globalStore.notion) {
    globalStore.notion = new NotionLibrary({
      apiBaseUrl: BLOG.API_BASE_URL || 'https://www.notion.so/api/v3',
      activeUser: BLOG.NOTION_ACTIVE_USER || null,
      authToken: BLOG.NOTION_TOKEN_V2 || null,
      userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      kyOptions: {
        mode: 'cors',
        hooks: {
          beforeRequest: [
            (request) => {
              const url = request.url.toString()
              if (url.includes('/api/v3/syncRecordValues')) {
                return new Request(
                  url.replace('/api/v3/syncRecordValues', '/api/v3/syncRecordValuesMain'),
                  request
                )
              }
              return request
            }
          ]
        }
      }
    })
  }
  return globalStore.notion
}

async function callNotion(methodName, ...args) {
  const notion = getRawNotion()
  const original = notion[methodName]
  if (typeof original !== 'function') throw new Error(`${methodName} is not a function`)

  const key = `${methodName}-${JSON.stringify(args)}`

  if (globalStore.inflight.has(key)) return globalStore.inflight.get(key)

  const execute = async () => original.apply(notion, args)
  const promise = useRateLimiter
    ? rateLimiter.enqueue(key, execute)
    : execute()

  globalStore.inflight.set(key, promise)
  promise.finally(() => globalStore.inflight.delete(key))
  return promise
}

async function callNotionWithRetry(
  methodName,
  args,
  retryAttempts = 3,
  retryDelay = 1000
) {
  try {
    return await callNotion(methodName, ...args)
  } catch (error) {
    if (retryAttempts <= 1) {
      throw error
    }

    console.warn(
      `[NotionAPI] ${methodName} failed, retrying...`,
      retryAttempts - 1,
      error?.message || error
    )
    await sleep(retryDelay)
    return callNotionWithRetry(
      methodName,
      args,
      retryAttempts - 1,
      retryDelay * 2
    )
  }
}

function normalizeRecordMap(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  const unwrap = records => {
    if (!records || typeof records !== 'object') return

    for (const item of Object.values(records)) {
      if (!item || typeof item !== 'object') continue
      const wrapped = item.value
      const nestedValue = wrapped?.value

      if (
        wrapped &&
        typeof wrapped === 'object' &&
        nestedValue &&
        typeof nestedValue === 'object' &&
        !Array.isArray(nestedValue)
      ) {
        if (item.role === undefined && wrapped.role !== undefined) {
          item.role = wrapped.role
        }
        item.value = nestedValue
      }
    }
  }

  for (const key of RECORD_MAP_KEYS) {
    unwrap(recordMap[key])
  }

  return recordMap
}

function mergeRecordMap(target, source) {
  if (!source) return target

  for (const key of RECORD_MAP_KEYS) {
    if (!source[key]) continue
    target[key] = {
      ...(target[key] || {}),
      ...source[key]
    }
  }

  return target
}

function getCollectionInstances(recordMap) {
  const instances = []

  for (const blockRecord of Object.values(recordMap?.block || {})) {
    const block = blockRecord?.value
    if (
      block?.type !== 'collection_view' &&
      block?.type !== 'collection_view_page'
    ) {
      continue
    }

    if (!block?.collection_id || !Array.isArray(block?.view_ids)) {
      continue
    }

    for (const collectionViewId of block.view_ids) {
      instances.push({
        collectionId: block.collection_id,
        collectionViewId,
        spaceId: block.space_id
      })
    }
  }

  return instances
}

async function hydrateCollections(recordMap, pageOptions = {}) {
  normalizeRecordMap(recordMap)

  if (!recordMap?.block) {
    return recordMap
  }

  recordMap.collection_query = recordMap.collection_query || {}

  const seen = new Set()
  const collectionReducerLimit = pageOptions?.collectionReducerLimit || 999
  const ofetchOptions = pageOptions?.ofetchOptions

  for (const instance of getCollectionInstances(recordMap)) {
    const { collectionId, collectionViewId, spaceId } = instance
    const cacheKey = `${collectionId}:${collectionViewId}`

    if (seen.has(cacheKey)) continue
    seen.add(cacheKey)

    const collectionView = recordMap.collection_view?.[collectionViewId]?.value
    if (!collectionView) continue

    try {
      const collectionData = await callNotionWithRetry(
        'getCollectionData',
        [
          collectionId,
          collectionViewId,
          collectionView,
          {
            limit: collectionReducerLimit,
            spaceId,
            ofetchOptions
          }
        ],
        3,
        1000
      )

      normalizeRecordMap(collectionData?.recordMap)
      mergeRecordMap(recordMap, collectionData?.recordMap)

      recordMap.collection_query[collectionId] = {
        ...(recordMap.collection_query[collectionId] || {}),
        [collectionViewId]: collectionData?.result?.reducerResults || {}
      }
    } catch (error) {
      console.warn(
        '[NotionAPI] hydrate collection failed',
        { collectionId, collectionViewId },
        error?.message || error
      )
    }
  }

  return recordMap
}

async function getPageNormalized(pageId, pageOptions = {}) {
  const recordMap = await callNotion('getPage', pageId, pageOptions)
  await hydrateCollections(recordMap, pageOptions)
  return normalizeRecordMap(recordMap)
}

async function getBlocksNormalized(blockIds, ofetchOptions) {
  const result = await callNotionWithRetry(
    'getBlocks',
    [blockIds, ofetchOptions],
    3,
    1000
  )
  normalizeRecordMap(result?.recordMap)
  return result
}

export const notionAPI = {
  getPage: (pageId, pageOptions) => getPageNormalized(pageId, pageOptions),
  getBlocks: (blockIds, ofetchOptions) =>
    getBlocksNormalized(blockIds, ofetchOptions),
  getUsers: (...args) => callNotion('getUsers', ...args),
  __call: callNotion
}

export default notionAPI
