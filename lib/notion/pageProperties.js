import BLOG from '@/blog.config'

const normalizePropertyName = value => String(value || '').trim().toLowerCase()

export const getShowPagePropertiesFieldName = () =>
  BLOG.NOTION_PROPERTY_NAME?.show_page_properties || 'show_page_properties'

export const isShowPagePropertiesField = schemaField =>
  normalizePropertyName(schemaField?.name) ===
  normalizePropertyName(getShowPagePropertiesFieldName())

export const hasShowPagePropertiesField = schema =>
  Object.values(schema || {}).some(isShowPagePropertiesField)
