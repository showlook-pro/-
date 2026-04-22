const RECORD_MAP_KEYS = [
  'block',
  'collection',
  'collection_view',
  'notion_user',
  'space'
]

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

export function normalizeRecordMap(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  for (const key of RECORD_MAP_KEYS) {
    unwrapRecordEntries(recordMap[key])
  }

  normalizeCollectionViewFormats(recordMap.collection_view)

  return recordMap
}

export default normalizeRecordMap
