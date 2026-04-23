import {
  buildAppleMapsUrl,
  extractPlaceCoordinates,
  isShowPagePropertiesField
} from '@/lib/notion/pageProperties'
import { Property as DefaultProperty } from 'react-notion-x/build/third-party/collection'

const getBlockTitle = block =>
  String(block?.properties?.title?.[0]?.[0] || '').trim()

const DATE_TIME_PROPERTY_TYPES = new Set(['created_time', 'last_edited_time'])
const DATE_PROPERTY_TYPES = new Set(['date', ...DATE_TIME_PROPERTY_TYPES])
const DEFAULT_TIME_ZONE = 'Asia/Shanghai'

const normalizePropertyName = name => String(name || '').trim()

const formatInlineLabel = schema => {
  const label = normalizePropertyName(schema?.name).replace(/[：:]+$/, '')
  return label ? `${label}：` : ''
}

const isDateProperty = schema => DATE_PROPERTY_TYPES.has(schema?.type)

const getInlineDateValue = value => {
  if (!Array.isArray(value)) {
    return null
  }

  if (value[0] === 'd') {
    return value[1]
  }

  for (const item of value) {
    const dateValue = getInlineDateValue(item)
    if (dateValue) {
      return dateValue
    }
  }

  return null
}

const formatChineseDateTime = value =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(value)

const formatChineseTime = time => {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})/)
  if (!match) {
    return ''
  }

  const hour = Number(match[1])
  const minute = match[2]
  const period = hour < 12 ? '上午' : '下午'
  const displayHour = hour % 12 || 12

  return `${period}${displayHour}:${minute}`
}

const formatDateParts = date => {
  const match = String(date || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) {
    return ''
  }

  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`
}

const formatNotionDateValue = dateValue => {
  const startDate = formatDateParts(dateValue?.start_date)
  if (!startDate) {
    return ''
  }

  const startTime = formatChineseTime(dateValue?.start_time)
  const start = startTime ? `${startDate} ${startTime}` : startDate

  const endDate = formatDateParts(dateValue?.end_date)
  if (!endDate) {
    return start
  }

  const endTime = formatChineseTime(dateValue?.end_time)
  const end = endTime ? `${endDate} ${endTime}` : endDate

  return `${start} - ${end}`
}

const formatInlineDateValue = ({ schema, data, block }) => {
  if (!isDateProperty(schema)) {
    return ''
  }

  if (schema?.type === 'created_time' && block?.created_time) {
    return formatChineseDateTime(new Date(block.created_time))
  }

  if (schema?.type === 'last_edited_time' && block?.last_edited_time) {
    return formatChineseDateTime(new Date(block.last_edited_time))
  }

  const dateValue = getInlineDateValue(data)
  if (!dateValue) {
    return ''
  }

  return formatNotionDateValue(dateValue)
}

const InlinePropertyRow = ({ children, className = '', schema }) => (
  <span
    className={`notion-property notion-property-inline-value notion-property-inline-row ${className}`.trim()}>
    <span className='notion-property-inline-name'>
      {formatInlineLabel(schema)}
    </span>
    <span className='notion-property-inline-content'>{children}</span>
  </span>
)

export default function NotionProperty(props) {
  const { block, inline, pagePropertiesMode, schema, data } = props
  const shouldUseInlineRow = pagePropertiesMode && inline && schema?.type !== 'title'

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
      if (shouldUseInlineRow) {
        return (
          <InlinePropertyRow
            className='notion-property-place'
            schema={schema}>
            {mapLink}
          </InlinePropertyRow>
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

  if (shouldUseInlineRow) {
    const inlineDateValue = formatInlineDateValue({ schema, data, block })

    return (
      <InlinePropertyRow schema={schema}>
        {inlineDateValue || <DefaultProperty {...props} />}
      </InlinePropertyRow>
    )
  }

  return <DefaultProperty {...props} />
}
