import {
  buildAppleMapsUrl,
  extractPlaceCoordinates,
  isShowPagePropertiesField
} from '@/lib/notion/pageProperties'
import { Property as DefaultProperty } from 'react-notion-x/build/third-party/collection'

const getBlockTitle = block =>
  String(block?.properties?.title?.[0]?.[0] || '').trim()

export default function NotionProperty(props) {
  const { block, inline, pagePropertiesMode, schema, data } = props

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
