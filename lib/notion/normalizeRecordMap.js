const RECORD_MAP_KEYS = [
  'block',
  'collection',
  'collection_view',
  'layout',
  'notion_user',
  'space'
]

const COLLECTION_VIEW_BLOCK_TYPES = new Set([
  'collection_view',
  'collection_view_page'
])

const UNSUPPORTED_FALLBACK_VIEW_TYPES = new Set(['board'])

const GALLERY_COVER_TYPE_ALIASES = {
  page_content_first: 'page_content'
}

const unwrapRecordEntries = records => {
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

const normalizeCollectionViewFormats = collectionViews => {
  if (!collectionViews || typeof collectionViews !== 'object') return

  for (const entry of Object.values(collectionViews)) {
    const format = entry?.value?.format
    const galleryCover = format?.gallery_cover
    const coverType = galleryCover?.type
    const normalizedType = GALLERY_COVER_TYPE_ALIASES[coverType]

    if (normalizedType) {
      galleryCover.type = normalizedType
    }
  }
}

const getViewCollectionId = (view, block) =>
  block?.collection_id ||
  block?.format?.collection_pointer?.id ||
  view?.format?.collection_pointer?.id ||
  block?.parent_id

const getCollectionIdFromBlockViews = (recordMap, block) => {
  if (!block) {
    return null
  }

  const directCollectionId =
    block?.collection_id || block?.format?.collection_pointer?.id
  if (directCollectionId) {
    return directCollectionId
  }

  if (!Array.isArray(block.view_ids)) {
    return null
  }

  for (const viewId of block.view_ids) {
    const view = recordMap?.collection_view?.[viewId]?.value
    const collectionId = view?.format?.collection_pointer?.id
    if (collectionId) {
      return collectionId
    }
  }

  return null
}

const getQueryBlockIds = queryResult => {
  if (!queryResult || typeof queryResult !== 'object') {
    return []
  }

  if (Array.isArray(queryResult.blockIds) && queryResult.blockIds.length > 0) {
    return queryResult.blockIds
  }

  const groupedBlockIds = queryResult?.collection_group_results?.blockIds
  if (Array.isArray(groupedBlockIds) && groupedBlockIds.length > 0) {
    return groupedBlockIds
  }

  return []
}

const sortCollectionBlocks = (left, right) => {
  const leftCreated = Number(left?.created_time || 0)
  const rightCreated = Number(right?.created_time || 0)
  if (leftCreated !== rightCreated) {
    return rightCreated - leftCreated
  }

  const leftEdited = Number(left?.last_edited_time || 0)
  const rightEdited = Number(right?.last_edited_time || 0)
  if (leftEdited !== rightEdited) {
    return rightEdited - leftEdited
  }

  return String(left?.id || '').localeCompare(String(right?.id || ''))
}

const getCollectionPageBlockIds = (recordMap, collectionId) => {
  if (!recordMap?.block || !collectionId) {
    return []
  }

  return Object.values(recordMap.block)
    .map(entry => entry?.value)
    .filter(block => {
      return (
        block?.type === 'page' &&
        block?.parent_table === 'collection' &&
        block?.parent_id === collectionId &&
        block?.alive !== false
      )
    })
    .sort(sortCollectionBlocks)
    .map(block => block.id)
}

const getFallbackCollectionBlockIds = (recordMap, collectionId) => {
  const queryResults = Object.values(recordMap?.collection_query?.[collectionId] || {})
  const orderedBlockIds = []
  const seenBlockIds = new Set()

  for (const queryResult of queryResults) {
    for (const blockId of getQueryBlockIds(queryResult)) {
      if (!seenBlockIds.has(blockId)) {
        seenBlockIds.add(blockId)
        orderedBlockIds.push(blockId)
      }
    }
  }

  if (orderedBlockIds.length > 0) {
    return orderedBlockIds
  }

  return getCollectionPageBlockIds(recordMap, collectionId)
}

const normalizeCollectionViewBlocks = recordMap => {
  if (!recordMap?.block) {
    return
  }

  for (const entry of Object.values(recordMap.block)) {
    const block = entry?.value
    if (
      !block ||
      block.collection_id ||
      !COLLECTION_VIEW_BLOCK_TYPES.has(block.type)
    ) {
      continue
    }

    const collectionId = getCollectionIdFromBlockViews(recordMap, block)
    if (collectionId) {
      block.collection_id = collectionId
    }
  }
}

const normalizeCollectionQueries = recordMap => {
  if (!recordMap?.block || !recordMap?.collection_view) {
    return
  }

  recordMap.collection_query = recordMap.collection_query || {}

  for (const entry of Object.values(recordMap.block)) {
    const block = entry?.value
    if (
      !block ||
      !COLLECTION_VIEW_BLOCK_TYPES.has(block.type) ||
      !Array.isArray(block.view_ids)
    ) {
      continue
    }

    for (const viewId of block.view_ids) {
      const view = recordMap.collection_view?.[viewId]?.value
      if (!view || UNSUPPORTED_FALLBACK_VIEW_TYPES.has(view.type)) {
        continue
      }

      const collectionId = getViewCollectionId(view, block)
      if (!collectionId) {
        continue
      }

      const collectionQuery =
        recordMap.collection_query[collectionId] ||
        (recordMap.collection_query[collectionId] = {})

      if (getQueryBlockIds(collectionQuery[viewId]).length > 0) {
        continue
      }

      const fallbackBlockIds = getFallbackCollectionBlockIds(
        recordMap,
        collectionId
      )

      if (fallbackBlockIds.length === 0) {
        continue
      }

      collectionQuery[viewId] = {
        ...(collectionQuery[viewId] || {}),
        collection_group_results: {
          type: 'results',
          blockIds: [...fallbackBlockIds],
          hasMore: false
        }
      }
    }
  }
}

export function normalizeRecordMap(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  for (const key of RECORD_MAP_KEYS) {
    unwrapRecordEntries(recordMap[key])
  }

  normalizeCollectionViewFormats(recordMap.collection_view)
  normalizeCollectionViewBlocks(recordMap)
  normalizeCollectionQueries(recordMap)

  return recordMap
}

export default normalizeRecordMap
