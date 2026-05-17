import BLOG from '@/blog.config'
import {
  getDataFromCache,
  getOrSetDataWithCache
} from '@/lib/cache/cache_manager'
import { optimizeRecordMapForClientRender } from './optimizeRecordMap'
import { normalizeRecordMap } from './normalizeRecordMap'
import { deepClone, delay } from '../utils'
import notionAPI from '@/lib/notion/getNotionAPI'

const limit = createLimit(15)
const REQUEST_INTERVAL = 50
export const DEFAULT_CONTENT_PAGE_OPTIONS = {}

function createLimit(concurrency) {
  const queue = []
  let activeCount = 0

  const next = () => {
    if (activeCount >= concurrency || queue.length === 0) {
      return
    }

    activeCount++
    const { fn, resolve, reject } = queue.shift()

    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        activeCount--
        next()
      })
  }

  return fn =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
}

/**
 * 与 NotionNext 保持一致：页面正文只读取 getPage 的原始 recordMap。
 * collection/form 补水不能放在普通浏览链路，否则一个页面访问会放大成多次 Notion 请求。
 */
export async function fetchNotionPageBlocks(id, from = null) {
  const cacheKey = getPageCacheKey(id)
  const pageBlock = await getOrSetDataWithCache(cacheKey, () =>
    limit(() => getPageWithRetry(id, from))
  )

  if (!pageBlock) {
    console.warn('[getPage] empty pageBlock:', id)
    return null
  }

  return normalizeRecordMap(pageBlock)
}

/**
 * 兼容项目内旧调用名。
 */
export async function getPage(id, from = null, slice) {
  const pageBlock = await fetchNotionPageBlocks(id, from)
  if (!pageBlock) {
    return null
  }
  return convertNotionBlocksToPost(id, pageBlock, slice)
}

export async function getContentPage(id, from = null, slice) {
  return getPage(id, from, slice)
}

export function getPageCacheKey(id) {
  return `page_block_${id}`
}

/**
 * 旧 hydration 检测 API 保留为兼容出口；请求策略已恢复为 NotionNext 轻量模式。
 */
export function getMissingContentHydrationOptions() {
  return null
}

/**
 * 调用接口，失败会重试。
 */
export async function getPageWithRetry(id, from, retryAttempts = 3) {
  if (!retryAttempts || retryAttempts <= 0) {
    console.error('[请求失败]:', `from:${from}`, `id:${id}`)
    return null
  }

  console.log(
    '[API-->>请求]',
    `from:${from}`,
    `id:${id}`,
    retryAttempts < 3 ? `剩余重试次数:${retryAttempts}` : ''
  )

  try {
    const start = Date.now()
    const pageData = await notionAPI.getPage(id)
    const end = Date.now()
    console.log('[API<<--响应]', `耗时:${end - start}ms - from:${from}`)
    return normalizeRecordMap(pageData)
  } catch (e) {
    console.warn('[API<<--异常]:', e)

    const pageBlock = await getDataFromCache(getPageCacheKey(id))
    if (pageBlock) {
      return normalizeRecordMap(pageBlock)
    }

    return getPageWithRetry(id, from, retryAttempts - 1)
  }
}

/**
 * Notion页面BLOCK格式化处理。
 */
function convertNotionBlocksToPost(id, blockMap, slice) {
  const clonePageBlock = deepClone(normalizeRecordMap(blockMap))
  let count = 0
  const blocksToProcess = Object.keys(clonePageBlock?.block || {})

  for (let i = 0; i < blocksToProcess.length; i++) {
    const blockId = blocksToProcess[i]
    const b = clonePageBlock?.block?.[blockId]

    if (slice && slice > 0 && count > slice) {
      if (clonePageBlock?.block) {
        delete clonePageBlock.block[blockId]
      }
      continue
    }

    if (b?.value?.id === id) {
      delete b?.value?.properties
      continue
    }

    count++
    sanitizeBlockUrls(b?.value)

    if (b?.value?.type === 'sync_block' && b?.value?.children) {
      const childBlocks = b.value.children
      delete clonePageBlock.block[blockId]
      childBlocks.forEach((childBlock, index) => {
        const newBlockId = `${blockId}_child_${index}`
        clonePageBlock.block[newBlockId] = childBlock
        blocksToProcess.splice(i + index + 1, 0, newBlockId)
      })
      i--
      continue
    }

    if (b?.value?.type === 'code') {
      if (b?.value?.properties?.language?.[0][0] === 'C++') {
        b.value.properties.language[0][0] = 'cpp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'C#') {
        b.value.properties.language[0][0] = 'csharp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'Assembly') {
        b.value.properties.language[0][0] = 'asm6502'
      }
    }

    if (
      ['file', 'pdf', 'video', 'audio'].includes(b?.value?.type) &&
      b?.value?.properties?.source?.[0][0] &&
      (b?.value?.properties?.source?.[0][0]?.startsWith('attachment') ||
        b?.value?.properties?.source?.[0][0].indexOf('amazonaws.com') > 0)
    ) {
      const oldUrl = b?.value?.properties?.source?.[0][0]
      const newUrl = `https://notion.so/signed/${encodeURIComponent(oldUrl)}?table=block&id=${b?.value?.id}`
      b.value.properties.source[0][0] = newUrl
    }
  }

  optimizeRecordMapForClientRender(clonePageBlock, id)

  if (id === BLOG.NOTION_PAGE_ID) {
    return clonePageBlock
  }
  return clonePageBlock
}

/**
 * 根据[]ids，批量抓取blocks。
 */
export const fetchInBatches = async (ids, batchSize = 30) => {
  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  let fetchedBlocks = {}
  if (ids.length === 0) {
    return fetchedBlocks
  }

  console.log('[Batch] START total ids:', ids.length)

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    console.log(`\n[Batch] processing ${i} ~ ${i + batch.length}`)

    try {
      const blocks = await limit(async () => {
        await delay(REQUEST_INTERVAL)

        console.log('[API-->>批量请求]', batch.length)
        const start = Date.now()
        const pageChunk = await notionAPI.getBlocks(batch)
        const end = Date.now()
        const result = pageChunk?.recordMap?.block || {}

        console.log(
          `[API<<--批量响应] size:${batch.length} 耗时:${end - start}ms blocks:${Object.keys(result).length}`
        )

        return result
      })

      fetchedBlocks = {
        ...fetchedBlocks,
        ...blocks
      }
    } catch (err) {
      console.warn('[Batch API异常]', err.message)
    }
  }
  return fetchedBlocks
}

/**
 * 强制修复 block 中所有可能的非法 URL 字段。
 */
function sanitizeBlockUrls(blockValue) {
  if (!blockValue || typeof blockValue !== 'object') return

  const fixUrl = url => {
    if (typeof url !== 'string') return url

    if (url.startsWith('/')) {
      return url
    }

    if (url.startsWith('http:') && !url.startsWith('http://')) {
      url = 'http://' + url.slice(5)
    } else if (url.startsWith('https:') && !url.startsWith('https://')) {
      url = 'https://' + url.slice(6)
    }

    try {
      new URL(url)
      return url
    } catch {
      console.warn('[Sanitize URL] Invalid URL replaced:', url)
      return 'https://via.placeholder.com/1x1?text=Invalid+Image'
    }
  }

  if (
    blockValue.properties?.source?.[0]?.[0] &&
    typeof blockValue.properties.source[0][0] === 'string'
  ) {
    blockValue.properties.source[0][0] = fixUrl(
      blockValue.properties.source[0][0]
    )
  }

  if (blockValue.file?.url && typeof blockValue.file.url === 'string') {
    blockValue.file.url = fixUrl(blockValue.file.url)
  }

  if (
    blockValue.format?.page_cover &&
    typeof blockValue.format.page_cover === 'string'
  ) {
    blockValue.format.page_cover = fixUrl(blockValue.format.page_cover)
  }
}
