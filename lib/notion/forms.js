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

const MULTILINE_FIELD_NAME_PATTERN =
  /备注|说明|描述|需求|介绍|反馈|意向|内容|留言|详细|答案/
const FALLBACK_TEXT_FIELD_NAME_PATTERN =
  /备注|说明|描述|需求|介绍|反馈|意向|内容|留言|合作|咨询|问题/
const TEXT_FIELD_TYPES = new Set(['title', 'text'])
const CHOICE_FIELD_TYPES = new Set(['select', 'multi_select'])
const MAINLAND_MOBILE_PHONE_PATTERN = /^1[3-9]\d{9}$/
const MAINLAND_LANDLINE_PHONE_PATTERN = /^0\d{2,3}\d{7,8}$/
const MAINLAND_SERVICE_PHONE_PATTERN = /^(?:400|800)\d{7}$/
export const MAINLAND_PHONE_ERROR_MESSAGE =
  '请输入有效的中国大陆手机号或固定电话。'

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

const shouldUseTextarea = schema => {
  if (!TEXT_FIELD_TYPES.has(schema?.type)) {
    return false
  }

  return MULTILINE_FIELD_NAME_PATTERN.test(schema?.name || '')
}

const isFallbackVisibleField = schema => {
  if (!schema || READ_ONLY_FIELD_TYPES.has(schema.type)) {
    return false
  }

  if (
    [
      'title',
      'phone_number',
      'email',
      'url',
      'place',
      'number',
      'checkbox',
      'select',
      'multi_select'
    ].includes(schema.type)
  ) {
    return true
  }

  return (
    schema.type === 'text' &&
    FALLBACK_TEXT_FIELD_NAME_PATTERN.test(schema.name || '')
  )
}

const sortTitleFirst = ([, leftSchema], [, rightSchema]) => {
  if (leftSchema.type === 'title') return -1
  if (rightSchema.type === 'title') return 1
  return 0
}

export const getEditableFormFields = (
  collection,
  { layoutPropertyIds = [] } = {}
) => {
  const schema = collection?.schema || {}
  const layoutIds = Array.isArray(layoutPropertyIds)
    ? layoutPropertyIds.filter(id => schema[id])
    : []

  if (layoutIds.length > 0) {
    return layoutIds
      .filter(id => !READ_ONLY_FIELD_TYPES.has(schema[id]?.type))
      .map(id => normalizeFormField(id, schema[id]))
  }

  return Object.entries(schema)
    .filter(([, fieldSchema]) => isFallbackVisibleField(fieldSchema))
    .sort(sortTitleFirst)
    .map(([id, fieldSchema]) => normalizeFormField(id, fieldSchema))
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
    suggestions: [],
    isMultiline: inputKind === 'textarea'
  }
}

const collectLayoutPropertyIds = (value, schema, result, seenObjects) => {
  if (!value) {
    return
  }

  if (typeof value === 'string') {
    if (schema[value] && !result.includes(value)) {
      result.push(value)
    }
    return
  }

  if (typeof value !== 'object') {
    return
  }

  if (seenObjects.has(value)) {
    return
  }
  seenObjects.add(value)

  if (Array.isArray(value)) {
    for (const item of value) {
      collectLayoutPropertyIds(item, schema, result, seenObjects)
    }
    return
  }

  for (const nestedValue of Object.values(value)) {
    collectLayoutPropertyIds(nestedValue, schema, result, seenObjects)
  }
}

export const getFormLayoutPropertyIds = ({ collection, formBlock, recordMap }) => {
  const layoutId = formBlock?.format?.form_layout_pointer?.id
  const layout = getRecordValue(recordMap?.layout, layoutId)

  if (!layout || !collection?.schema) {
    return []
  }

  const result = []
  collectLayoutPropertyIds(layout, collection.schema, result, new WeakSet())
  return result
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

  const layoutPropertyIds = getFormLayoutPropertyIds({
    collection,
    formBlock,
    recordMap
  })

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
    fields: getEditableFormFields(collection, { layoutPropertyIds }),
    layoutPropertyIds
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

export const normalizeMainlandPhoneNumber = value => {
  const valueText = String(value || '').trim()

  if (!valueText) {
    return ''
  }

  return valueText
    .replace(/^(\+?86|0086)[-\s]?/, '')
    .replace(/[\s()-]/g, '')
}

export const isMainlandPhoneNumber = value => {
  const normalizedValue = normalizeMainlandPhoneNumber(value)

  return (
    MAINLAND_MOBILE_PHONE_PATTERN.test(normalizedValue) ||
    MAINLAND_LANDLINE_PHONE_PATTERN.test(normalizedValue) ||
    MAINLAND_SERVICE_PHONE_PATTERN.test(normalizedValue)
  )
}

export const validateFormFieldValue = (field, value) => {
  const normalizedValue = normalizeSubmittedValue(value)

  if (
    normalizedValue === undefined ||
    normalizedValue === null ||
    normalizedValue === '' ||
    (Array.isArray(normalizedValue) && normalizedValue.length === 0)
  ) {
    return null
  }

  if (field?.type === 'phone_number' && !isMainlandPhoneNumber(normalizedValue)) {
    return MAINLAND_PHONE_ERROR_MESSAGE
  }

  if (field?.type === 'place' && !hasPlaceCoordinates(normalizedValue)) {
    return '请先点击按钮获取当前位置。'
  }

  return null
}

export const validateFormValues = (fields, values) => {
  const errors = {}

  for (const field of fields || []) {
    if (!Object.prototype.hasOwnProperty.call(values || {}, field.id)) {
      continue
    }

    const error = validateFormFieldValue(field, values[field.id])
    if (error) {
      errors[field.id] = error
    }
  }

  return errors
}

export const serializeFormValue = (schema, value) => {
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
    case 'url':
      return [[String(normalizedValue)]]
    case 'phone_number': {
      if (!isMainlandPhoneNumber(normalizedValue)) {
        throw new Error(
          `"${schema?.name || 'phone_number'}" ${MAINLAND_PHONE_ERROR_MESSAGE}`
        )
      }

      return [[normalizeMainlandPhoneNumber(normalizedValue)]]
    }
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
      const placeValue = normalizedValue

      if (!hasPlaceCoordinates(placeValue)) {
        throw new Error(
          `请先通过定位按钮获取“${schema?.name || '地址'}”的坐标。`
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

export const buildFormProperties = (collection, values, options = {}) => {
  const fields = getEditableFormFields(collection, {
    layoutPropertyIds: options.layoutPropertyIds
  })
  const properties = {}

  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(values || {}, field.id)) {
      continue
    }

    properties[field.id] = serializeFormValue(field, values[field.id], options)
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
