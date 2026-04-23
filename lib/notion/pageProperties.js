import BLOG from '@/blog.config'
import { normalizePlaceCoordinates } from '@/lib/notion/place'

const normalizePropertyName = value => String(value || '').trim().toLowerCase()
const normalizeModeValue = value => {
  if (Array.isArray(value)) {
    return normalizeModeValue(value[0])
  }

  return normalizePropertyName(value)
}

export const getShowPagePropertiesFieldName = () =>
  BLOG.NOTION_PROPERTY_NAME?.show_page_properties || 'show_page_properties'

export const isShowPagePropertiesField = schemaField =>
  normalizePropertyName(schemaField?.name) ===
  normalizePropertyName(getShowPagePropertiesFieldName())

export const normalizeShowPagePropertiesMode = value => {
  const normalized = normalizeModeValue(value)
  return normalized === 'showclose' || normalized === 'showopen'
    ? normalized
    : ''
}

export const extractPlaceCoordinates = data => {
  const placeData = data?.[0]?.[1]?.[0]
  if (!Array.isArray(placeData) || placeData[0] !== 'plc') {
    return null
  }

  const coordinates = normalizePlaceCoordinates(placeData?.[1])

  if (!coordinates) {
    return null
  }

  return coordinates
}

export const buildAppleMapsUrl = ({ lat, lon, label = '' } = {}) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return ''
  }

  const url = new URL('https://maps.apple.com/')
  url.searchParams.set('ll', `${lat},${lon}`)

  if (label) {
    url.searchParams.set('q', label)
  }

  return url.toString()
}
