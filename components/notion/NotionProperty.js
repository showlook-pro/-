import {
  buildAppleMapsUrl,
  extractPlaceCoordinates,
  isShowPagePropertiesField
} from '@/lib/notion/pageProperties'
import { Property as DefaultProperty } from 'react-notion-x/build/third-party/collection'

const getBlockTitle = block =>
  String(block?.properties?.title?.[0]?.[0] || '').trim()

const INLINE_PROMINENT_PROPERTY_LABELS = {
  合作方式与意向: '合作方式与意向',
  合作方式及意向: '合作方式与意向',
  意向详情: '合作方式与意向',
  您的地址: '您的地址',
  地址: '您的地址',
  您的电话号码: '您的电话号码',
  电话号码: '您的电话号码'
}

const normalizePropertyName = name => String(name || '').trim()

const getProminentInlineLabel = schema =>
  INLINE_PROMINENT_PROPERTY_LABELS[normalizePropertyName(schema?.name)] || ''

const isProminentInlineProperty = schema =>
  Boolean(getProminentInlineLabel(schema))

const formatInlineLabel = schema => {
  const label = getProminentInlineLabel(schema).replace(/[：:]+$/, '')
  return label ? `${label}：` : ''
}

export default function NotionProperty(props) {
  const { block, inline, pagePropertiesMode, schema, data } = props
  const prominentInlineProperty =
    pagePropertiesMode &&
    inline &&
    schema?.type !== 'title' &&
    isProminentInlineProperty(schema)

  if (isShowPagePropertiesField(schema)) {
    return null
  }

  const place = extractPlaceCoordinates(data)
  const title = getBlockTitle(block)
  const appleMapsUrl = place
    ? buildAppleMapsUrl({
        lat: place.lat,
        lon: place.lon,
        label: title || schema?.name || 'Location'
      })
    : ''

  if (pagePropertiesMode && schema?.type === 'place' && appleMapsUrl) {
    const openMap = event => {
      event.preventDefault()
      event.stopPropagation()
      window.open(appleMapsUrl, '_blank', 'noopener,noreferrer')
    }

    const handleKeyDown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        openMap(event)
      }
    }

    const mapLink = (
      <span
        className='notion-property-map-link'
        onClick={openMap}
        onKeyDown={handleKeyDown}
        role='link'
        tabIndex={0}>
        查看定位
      </span>
    )

    if (inline) {
      if (prominentInlineProperty) {
        return (
          <span className='notion-property notion-property-inline-value notion-property-inline-row notion-property-place'>
            <span className='notion-property-inline-name'>
              {formatInlineLabel(schema)}
            </span>
            <span className='notion-property-inline-content'>{mapLink}</span>
          </span>
        )
      }

      return (
        <span className='notion-property notion-property-inline-value notion-property-place'>
          <span className='notion-property-inline-name'>{schema?.name}</span>
          {mapLink}
        </span>
      )
    }

    return <span className='notion-property notion-property-place'>{mapLink}</span>
  }

  if (pagePropertiesMode && inline && schema?.type !== 'title') {
    if (prominentInlineProperty) {
      return (
        <span className='notion-property notion-property-inline-value notion-property-inline-row'>
          <span className='notion-property-inline-name'>
            {formatInlineLabel(schema)}
          </span>
          <span className='notion-property-inline-content'>
            <DefaultProperty {...props} />
          </span>
        </span>
      )
    }

    return (
      <span className='notion-property notion-property-inline-value'>
        <span className='notion-property-inline-name'>{schema?.name}</span>
        <span className='notion-property-inline-content'>
          <DefaultProperty {...props} />
        </span>
      </span>
    )
  }

  return <DefaultProperty {...props} />
}
