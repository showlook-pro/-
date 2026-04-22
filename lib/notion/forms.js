export const NOTION_FORM_VIEW_TYPE = 'form_editor'
export const NOTION_EXTERNAL_FORM_USER_ID =
  '00000000-0000-0000-0000-00000000000a'
export const NOTION_PLACE_SEARCH_LIMIT = 5

const READ_ONLY_FIELD_TYPES = new Set([
  'created_time',
  'created_by',
  'last_edited_time',
  'last_edited_by',
  'auto_increment_id',
  'formula'
])

const MULTILINE_FIELD_NAME_PATTERN = /备注|说明|描述|需求|介绍|反馈/
const TEXT_FIELD_TYPES = new Set(['title', 'text'])
const CHOICE_FIELD_TYPES = new Set(['select', 'multi_select'])

export const getRecordValue = (records, id) => records?.[id]?.value || null

const getPlainText = value => {
  if (!Array.isArray(value)) return ''

  return value
    .map(item => {
      if (!Array.isArray(item)) return ''
      return typeof item[0] === 'string' ? item[0] : ''
    })
    .join('')
    .trim()
}

export const isFormCollectionView = view => view?.type === NOTION_FORM_VIEW_TYPE

const getFieldSuggestions = schema => {
  if (!TEXT_FIELD_TYPES.has(schema?.type)) {
    return []
  }

  return (schema?.options || [])
    .map(option => option?.value)
    .filter(Boolean)
}

const shouldUseTextarea = schema => {
  if (!TEXT_FIELD_TYPES.has(schema?.type)) {
    return false
  }

  if (MULTILINE_FIELD_NAME_PATTERN.test(schema?.name || '')) {
    return true
  }

  // Public form payloads do not expose the full layout record.
  // For textual fields, schema options behave like writing prompts instead of enum choices.
  return getFieldSuggestions(schema).length > 0
}

export const getEditableFormFields = collection => {
  const schemaEntries = Object.entries(collection?.schema || {})

  return schemaEntries
    .filter(([, schema]) => schema && !READ_ONLY_FIELD_TYPES.has(schema.type))
    .sort(([leftId, leftSchema], [rightId, rightSchema]) => {
      if (leftSchema.type === 'title') return -1
      if (rightSchema.type === 'title') return 1
      return 0
    })
    .map(([id, schema]) => normalizeFormField(id, schema))
}

export const getFormInputKind = schema => {
  if (!schema) return 'text'

  if (schema.inputKind) {
    return schema.inputKind
  }

  switch (schema.type) {
    case 'title':
    case 'text':
      return shouldUseTextarea(schema) ? 'textarea' : 'text'
    case 'number':
      return 'number'
    case 'email':
      return 'email'
    case 'phone_number':
      return 'tel'
    case 'url':
      return 'url'
    case 'checkbox':
      return 'checkbox'
    case 'multi_select':
      return 'multi_select'
    case 'select':
      return 'select'
    case 'place':
      return 'place'
    default:
      return 'text'
  }
}

export const normalizeFormField = (id, schema) => {
  const inputKind = getFormInputKind(schema)

  return {
    ...schema,
    id,
    inputKind,
    schemaType: schema?.type || 'text',
    options: CHOICE_FIELD_TYPES.has(schema?.type) ? schema?.options || [] : [],
    suggestions: getFieldSuggestions(schema),
    isMultiline: inputKind === 'textarea'
  }
}

export const getFormDefinition = ({ block, recordMap, viewId } = {}) => {
  if (!block || !recordMap) return null

  const resolvedViewId = viewId || block?.view_ids?.[0]
  const collectionView = getRecordValue(recordMap.collection_view, resolvedViewId)

  if (!isFormCollectionView(collectionView)) {
    return null
  }

  const collectionId =
    block?.collection_id || collectionView?.format?.collection_pointer?.id
  const collection = getRecordValue(recordMap.collection, collectionId)
  const formBlockId = collectionView?.format?.form_block_pointer?.id
  const formBlock = getRecordValue(recordMap.block, formBlockId)

  if (!collection || !formBlock) {
    return null
  }

  return {
    collection,
    collectionId,
    collectionView,
    formBlock,
    formBlockId,
    title:
      getPlainText(formBlock?.properties?.title) ||
      getPlainText(collection?.name) ||
      'Notion Form',
    description: getPlainText(formBlock?.format?.form_config?.description),
    fields: getEditableFormFields(collection)
  }
}

export const normalizeSubmittedValue = value => {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (value && typeof value === 'object') {
    return value
  }

  return value
}

const hasPlaceCoordinates = place =>
  Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lon))

export const serializeFormValue = async (
  schema,
  value,
  { resolvePlace = () => Promise.resolve(null) } = {}
) => {
  const normalizedValue = normalizeSubmittedValue(value)

  if (
    normalizedValue === undefined ||
    normalizedValue === null ||
    normalizedValue === '' ||
    (Array.isArray(normalizedValue) && normalizedValue.length === 0)
  ) {
    return []
  }

  switch (schema?.type) {
    case 'title':
    case 'text':
      return [[String(normalizedValue)]]
    case 'number':
      return [[String(normalizedValue)]]
    case 'email':
    case 'phone_number':
    case 'url':
      return [[String(normalizedValue)]]
    case 'checkbox':
      return [[normalizedValue ? 'Yes' : 'No']]
    case 'select':
      return [[String(normalizedValue)]]
    case 'multi_select':
      return [
        [
          Array.isArray(normalizedValue)
            ? normalizedValue.join(',')
            : String(normalizedValue)
        ]
      ]
    case 'place': {
      const placeValue =
        typeof normalizedValue === 'string'
          ? await resolvePlace(normalizedValue)
          : normalizedValue

      if (!hasPlaceCoordinates(placeValue)) {
        throw new Error(
          `Unable to resolve address for "${schema?.name || 'place'}"`
        )
      }

      return [
        [
          '‣',
          [
            [
              'plc',
              {
                lat: Number(placeValue.lat),
                lon: Number(placeValue.lon)
              }
            ]
          ]
        ]
      ]
    }
    default:
      return [[String(normalizedValue)]]
  }
}

export const buildFormProperties = async (
  collection,
  values,
  options = {}
) => {
  const fields = getEditableFormFields(collection)
  const properties = {}

  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(values || {}, field.id)) {
      continue
    }

    properties[field.id] = await serializeFormValue(
      field,
      values[field.id],
      options
    )
  }

  if (!properties.title?.length) {
    properties.title = [['New submission']]
  }

  return properties
}

export const buildFormSubmissionOperation = ({
  collectionId,
  spaceId,
  formBlockId,
  properties,
  actorId = NOTION_EXTERNAL_FORM_USER_ID,
  submissionId,
  timestamp = Date.now()
}) => ({
  id: submissionId,
  table: 'block',
  path: [],
  command: 'set',
  args: {
    id: submissionId,
    version: 1,
    type: 'page',
    alive: true,
    properties,
    format: {
      metadata: {
        created_at: timestamp,
        external_id: formBlockId,
        is_external: true,
        source_fetched_at: timestamp,
        from_external_form: true,
        source_connection_type: 'site-published-form',
        source_integration_type: 'form'
      }
    },
    created_time: timestamp,
    last_edited_time: timestamp,
    parent_id: collectionId,
    parent_table: 'collection',
    space_id: spaceId,
    created_by_table: 'notion_user',
    created_by_id: actorId,
    last_edited_by_table: 'notion_user',
    last_edited_by_id: actorId
  }
})

export async function searchPlaces(
  query,
  { limit = NOTION_PLACE_SEARCH_LIMIT } = {}
) {
  const normalizedQuery = String(query || '').trim()

  if (!normalizedQuery) {
    return []
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('q', normalizedQuery)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'User-Agent': 'xiaolu.love notion form bridge'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to resolve address')
  }

  const result = await response.json()

  return (Array.isArray(result) ? result : [])
    .filter(place => place?.lat && place?.lon)
    .map(place => ({
      label: place.display_name || normalizedQuery,
      lat: Number(place.lat),
      lon: Number(place.lon)
    }))
}

export async function geocodePlace(query) {
  const [place] = await searchPlaces(query, { limit: 1 })
  return place || null
}
