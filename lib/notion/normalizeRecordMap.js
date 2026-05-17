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

const getPropertyFilterValue = filter => {
  const value = filter?.value

  if (value && typeof value === 'object') {
    if (value.value !== undefined) return value.value
    if (value.range !== undefined) return value.range
  }

  return value
}

const collectTextValues = value => {
  const result = []

  const visit = item => {
    if (item === undefined || item === null) return

    if (
      typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean'
    ) {
      result.push(String(item))
      return
    }

    if (Array.isArray(item)) {
      for (const child of item) {
        visit(child)
      }
      return
    }

    if (typeof item === 'object') {
      if (item.start_date) result.push(String(item.start_date))
      if (item.end_date) result.push(String(item.end_date))
    }
  }

  visit(value)
  return result.filter(Boolean)
}

const getPropertyValueState = (propertyValue, field) => {
  const text = collectTextValues(propertyValue).join('')
  const values =
    field?.type === 'multi_select'
      ? text
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
      : [text].filter(Boolean)

  return { text, values }
}

const matchesPropertyFilter = (block, collection, propertyId, filter) => {
  if (!propertyId || !filter) {
    return true
  }

  const field = collection?.schema?.[propertyId]
  const { text, values } = getPropertyValueState(
    block?.properties?.[propertyId],
    field
  )
  const expectedValue = getPropertyFilterValue(filter)
  const expected = String(expectedValue ?? '').trim()
  const operator = filter.operator

  switch (operator) {
    case 'enum_is':
      return values.includes(expected)
    case 'enum_is_not':
      return !values.includes(expected)
    case 'enum_contains':
      return values.includes(expected) || text.includes(expected)
    case 'enum_does_not_contain':
      return !values.includes(expected) && !text.includes(expected)
    case 'string_contains':
      return text.includes(expected)
    case 'string_does_not_contain':
      return !text.includes(expected)
    case 'string_is':
      return text === expected
    case 'string_is_not':
      return text !== expected
    case 'string_starts_with':
      return text.startsWith(expected)
    case 'string_ends_with':
      return text.endsWith(expected)
    case 'is_empty':
      return !text
    case 'is_not_empty':
      return Boolean(text)
    case 'checkbox_is':
      return (
        ['true', 'yes', '1'].includes(text.toLowerCase()) ===
        Boolean(expectedValue)
      )
    default:
      // Keep unsupported filters non-destructive; Notion may add new operators.
      return true
  }
}

const normalizePropertyFilter = propertyFilter => {
  const filter = propertyFilter?.filter || propertyFilter
  const innerFilter = filter?.filter || filter
  const property = filter?.property || propertyFilter?.property

  if (!property || !innerFilter) {
    return null
  }

  return { property, filter: innerFilter }
}

const normalizeFilterItem = filterItem => {
  if (Array.isArray(filterItem?.filters)) {
    const filters = filterItem.filters.map(normalizeFilterItem).filter(Boolean)

    if (filters.length === 0) {
      return null
    }

    return {
      operator: filterItem.operator === 'or' ? 'or' : 'and',
      filters
    }
  }

  return normalizePropertyFilter(filterItem)
}

const getViewFilterGroup = collectionView => {
  const filters = []

  if (Array.isArray(collectionView?.format?.property_filters)) {
    for (const propertyFilter of collectionView.format.property_filters) {
      const normalized = normalizePropertyFilter(propertyFilter)
      if (normalized) filters.push(normalized)
    }
  }

  const queryFilter = collectionView?.query2?.filter
  if (Array.isArray(queryFilter?.filters)) {
    for (const filter of queryFilter.filters) {
      const normalized = normalizeFilterItem(filter)
      if (normalized) filters.push(normalized)
    }
  }

  if (filters.length === 0) {
    return null
  }

  return {
    operator: queryFilter?.operator === 'or' ? 'or' : 'and',
    filters
  }
}

const matchesFilterGroup = (block, collection, filterGroup) => {
  if (!filterGroup?.filters?.length) {
    return true
  }

  const matcher = filterItem => {
    if (Array.isArray(filterItem?.filters)) {
      return matchesFilterGroup(block, collection, filterItem)
    }

    return matchesPropertyFilter(
      block,
      collection,
      filterItem.property,
      filterItem.filter
    )
  }

  if (filterGroup.operator === 'or') {
    return filterGroup.filters.some(matcher)
  }

  return filterGroup.filters.every(matcher)
}

const filterQueryBlockIds = (queryResult, predicate) => {
  if (!queryResult || typeof queryResult !== 'object') {
    return
  }

  if (Array.isArray(queryResult.blockIds)) {
    queryResult.blockIds = queryResult.blockIds.filter(predicate)
  }

  for (const child of Object.values(queryResult)) {
    filterQueryBlockIds(child, predicate)
  }
}

const applyCollectionViewFilters = recordMap => {
  if (!recordMap?.collection_query || !recordMap?.collection_view) {
    return
  }

  for (const [collectionId, viewsQuery] of Object.entries(recordMap.collection_query)) {
    const collection = recordMap.collection?.[collectionId]?.value
    if (!collection || !viewsQuery) {
      continue
    }

    for (const [viewId, queryResult] of Object.entries(viewsQuery)) {
      const collectionView = recordMap.collection_view?.[viewId]?.value
      const filterGroup = getViewFilterGroup(collectionView)

      if (!filterGroup) {
        continue
      }

      filterQueryBlockIds(queryResult, blockId => {
        const block = recordMap.block?.[blockId]?.value
        return matchesFilterGroup(block, collection, filterGroup)
      })
    }
  }
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
  applyCollectionViewFilters(recordMap)

  return recordMap
}

export default normalizeRecordMap
