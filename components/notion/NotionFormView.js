import {
  getFormDefinition,
  validateFormValues
} from '@/lib/notion/forms'
import { useMemo, useState } from 'react'
import { useNotionContext } from 'react-notion-x'

const EMPTY_VALUES = {}
const EMPTY_PLACE_VALUE = {
  label: '',
  lat: null,
  lon: null
}

const isResolvedPlaceValue = value =>
  Number.isFinite(Number(value?.lat)) && Number.isFinite(Number(value?.lon))

const getFieldValue = (values, field) => {
  const currentValue = values[field.id]

  if (field.inputKind === 'checkbox') {
    return Boolean(currentValue)
  }

  if (field.inputKind === 'multi_select') {
    return Array.isArray(currentValue) ? currentValue : []
  }

  if (field.inputKind === 'place') {
    if (currentValue && typeof currentValue === 'object') {
      return currentValue
    }

    return EMPTY_PLACE_VALUE
  }

  return currentValue ?? ''
}

const getErrorMessage = error =>
  error?.message || '提交失败，请稍后再试。'

const applySuggestionValue = (field, currentValue, suggestion) => {
  if (field.isMultiline) {
    return currentValue ? `${currentValue}\n${suggestion}` : suggestion
  }

  return suggestion
}

function NotionTextSuggestions({ disabled, field, onChange, value }) {
  if (!field.suggestions?.length) {
    return null
  }

  return (
    <div className='notion-form-suggestions'>
      {field.suggestions.map(suggestion => (
        <button
          className='notion-form-suggestion'
          disabled={disabled}
          key={suggestion}
          onClick={() =>
            onChange(field.id, applySuggestionValue(field, value, suggestion))
          }
          type='button'>
          {suggestion}
        </button>
      ))}
    </div>
  )
}

function NotionPlaceInput({ disabled, field, onChange, value }) {
  const [locationState, setLocationState] = useState({
    status: 'idle',
    message: ''
  })

  const hasCoordinates = isResolvedPlaceValue(value)

  const handleLocateCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationState({
        status: 'location-error',
        message: '当前设备不支持定位。'
      })
      return
    }

    setLocationState({ status: 'locating', message: '' })

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = Number(position.coords.latitude)
        const lon = Number(position.coords.longitude)
        const label = `当前位置 (${lat.toFixed(6)}, ${lon.toFixed(6)})`

        onChange(field.id, {
          label,
          lat,
          lon
        })

        setLocationState({ status: 'selected', message: '' })
      },
      () => {
        setLocationState({
          status: 'location-error',
          message: '无法获取当前位置，请检查浏览器定位权限。'
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className='notion-form-place'>
      <button
        className='notion-form-place-action'
        disabled={disabled}
        onClick={handleLocateCurrentPosition}
        type='button'>
        {hasCoordinates ? '重新获取当前位置' : '获取当前位置'}
      </button>

      {hasCoordinates && (
        <div className='notion-form-place-status notion-form-place-status-selected'>
          位置已锁定。
          已锁定坐标 {Number(value.lat).toFixed(6)}, {Number(value.lon).toFixed(6)}
        </div>
      )}

      {!hasCoordinates && locationState.status === 'idle' && (
        <div className='notion-form-place-status' aria-live='polite'>
          该字段仅接受当前坐标，请点击按钮授权浏览器定位。
        </div>
      )}

      {!hasCoordinates && locationState.status === 'locating' && (
        <div className='notion-form-place-status' aria-live='polite'>
          正在获取当前位置...
        </div>
      )}

      {!hasCoordinates &&
        locationState.message &&
        locationState.status !== 'locating' && (
          <div
            aria-live='polite'
            className={`notion-form-place-status notion-form-place-status-${locationState.status}`}>
            {locationState.message}
          </div>
        )}
    </div>
  )
}

const renderFieldControl = ({ disabled, field, onChange, value }) => {
  const commonProps = {
    disabled,
    id: `notion-form-field-${field.id}`,
    name: field.id
  }

  switch (field.inputKind) {
    case 'textarea':
      return (
        <textarea
          {...commonProps}
          className='notion-form-input notion-form-textarea'
          onChange={event => onChange(field.id, event.target.value)}
          rows={6}
          value={value}
        />
      )
    case 'select':
      return (
        <select
          {...commonProps}
          className='notion-form-input notion-form-select'
          onChange={event => onChange(field.id, event.target.value)}
          value={value}>
          <option value=''>请选择</option>
          {field.options?.map(option => (
            <option key={option.id || option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      )
    case 'multi_select':
      return (
        <select
          {...commonProps}
          className='notion-form-input notion-form-select'
          multiple
          onChange={event =>
            onChange(
              field.id,
              Array.from(event.target.selectedOptions, option => option.value)
            )
          }
          value={value}>
          {field.options?.map(option => (
            <option key={option.id || option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      )
    case 'checkbox':
      return (
        <label className='notion-form-checkbox'>
          <input
            {...commonProps}
            checked={value}
            onChange={event => onChange(field.id, event.target.checked)}
            type='checkbox'
          />
          <span>{field.name}</span>
        </label>
      )
    case 'number':
      return (
        <input
          {...commonProps}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
          type='number'
          value={value}
        />
      )
    case 'email':
    case 'url':
      return (
        <input
          {...commonProps}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
          type={field.inputKind}
          value={value}
        />
      )
    case 'tel':
      return (
        <input
          {...commonProps}
          autoComplete='tel'
          className='notion-form-input'
          inputMode='tel'
          onChange={event => onChange(field.id, event.target.value)}
          placeholder='请输入中国大陆手机号或固定电话'
          type='tel'
          value={value}
        />
      )
    case 'place':
      return (
        <NotionPlaceInput
          disabled={disabled}
          field={field}
          onChange={onChange}
          value={value}
        />
      )
    default:
      return (
        <input
          {...commonProps}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
          type='text'
          value={value}
        />
      )
  }
}

export default function NotionFormView({ block }) {
  const { recordMap } = useNotionContext()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [fieldErrors, setFieldErrors] = useState(EMPTY_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState({ type: 'idle', message: '' })

  const form = useMemo(
    () =>
      getFormDefinition({
        block,
        recordMap,
        viewId: block?.view_ids?.[0]
      }),
    [block, recordMap]
  )

  if (!form) {
    return (
      <div className='notion-form-view notion-form-view-empty'>
        表单数据暂时不可用，请稍后刷新重试。
      </div>
    )
  }

  const handleChange = (fieldId, nextValue) => {
    setValues(currentValues => ({
      ...currentValues,
      [fieldId]: nextValue
    }))

    setFieldErrors(currentErrors => {
      if (!currentErrors[fieldId]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[fieldId]
      return nextErrors
    })
  }

  const submitForm = async () => {
    const validationErrors = validateFormValues(form.fields, values)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setResult({
        type: 'error',
        message: '请先修正表单中的错误后再提交。'
      })
      return
    }

    setIsSubmitting(true)
    setFieldErrors(EMPTY_VALUES)
    setResult({ type: 'idle', message: '' })

    try {
      const response = await fetch('/api/notion/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectionId: form.collectionId,
          formBlockId: form.formBlockId,
          spaceId: form.collection?.space_id,
          values
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message)
      }

      setValues(EMPTY_VALUES)
      setResult({
        type: 'success',
        message: data?.message || '提交成功，我们会尽快联系您。'
      })
    } catch (error) {
      setResult({
        type: 'error',
        message: getErrorMessage(error)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    void submitForm()
  }

  return (
    <div className='notion-form-view'>
      <div className='notion-collection-header'>
        <div className='notion-collection-header-title'>{form.title}</div>
      </div>

      <div className='notion-collection notion-form-collection'>
        <form className='notion-form-card' onSubmit={handleSubmit}>
          {form.description && (
            <p className='notion-form-description'>{form.description}</p>
          )}

          {form.fields.map(field => {
            const fieldValue = getFieldValue(values, field)
            const inputKind = field.inputKind

            return (
              <div className='notion-form-field' key={field.id}>
                {inputKind !== 'checkbox' && (
                  <label
                    className='notion-form-label'
                    htmlFor={`notion-form-field-${field.id}`}>
                    {field.name}
                  </label>
                )}

                {renderFieldControl({
                  disabled: isSubmitting,
                  field,
                  onChange: handleChange,
                  value: fieldValue
                })}

                {fieldErrors[field.id] && (
                  <div className='notion-form-field-error' role='alert'>
                    {fieldErrors[field.id]}
                  </div>
                )}

                {(inputKind === 'text' || inputKind === 'textarea') && (
                  <NotionTextSuggestions
                    disabled={isSubmitting}
                    field={field}
                    onChange={handleChange}
                    value={fieldValue}
                  />
                )}
              </div>
            )
          })}

          {result.message && (
            <div
              className={`notion-form-message notion-form-message-${result.type}`}>
              {result.message}
            </div>
          )}

          <button
            className='notion-form-submit'
            disabled={isSubmitting}
            type='submit'>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </form>
      </div>
    </div>
  )
}
