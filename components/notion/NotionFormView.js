import {
  getFormDefinition,
  validateFormValues
} from '@/lib/notion/forms'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { useNotionContext } from 'react-notion-x'

const EMPTY_VALUES = {}
const EMPTY_PLACE_VALUE = {
  query: '',
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

    if (typeof currentValue === 'string' && currentValue) {
      return {
        ...EMPTY_PLACE_VALUE,
        query: currentValue,
        label: currentValue
      }
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

const searchPlaces = async ({
  controller,
  normalizedQuery,
  setResults,
  setSearchState
}) => {
  try {
    const response = await fetch(
      `/api/notion/forms/places/search?q=${encodeURIComponent(normalizedQuery)}`,
      {
        method: 'GET',
        signal: controller.signal
      }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.message)
    }

    startTransition(() => {
      setResults(data?.results || [])
    })

    if (Array.isArray(data?.results) && data.results.length > 0) {
      setSearchState({ status: 'ready', message: '' })
    } else {
      setSearchState({
        status: 'empty',
        message: '未找到可识别的地址，请继续输入更完整的位置。'
      })
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      return
    }

    startTransition(() => {
      setResults([])
    })

    setSearchState({
      status: 'error',
      message: error?.message || '地址搜索暂时不可用，请稍后重试。'
    })
  }
}

function NotionPlaceInput({ disabled, field, onChange, value }) {
  const [results, setResults] = useState([])
  const [searchState, setSearchState] = useState({
    status: 'idle',
    message: ''
  })

  const query = value?.query || value?.label || ''
  const hasCoordinates = isResolvedPlaceValue(value)

  useEffect(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery || normalizedQuery.length < 2 || hasCoordinates) {
      startTransition(() => {
        setResults([])
      })

      setSearchState(currentState =>
        currentState.status === 'location-error'
          ? currentState
          : { status: 'idle', message: '' }
      )
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setSearchState({ status: 'searching', message: '' })

      void searchPlaces({
        controller,
        normalizedQuery,
        setResults,
        setSearchState
      })
    }, 260)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [hasCoordinates, query])

  const handlePlaceChange = event => {
    const nextQuery = event.target.value

    onChange(field.id, {
      ...EMPTY_PLACE_VALUE,
      query: nextQuery,
      label: nextQuery
    })
  }

  const handlePlaceSelect = place => {
    onChange(field.id, {
      query: place.label,
      label: place.label,
      lat: place.lat,
      lon: place.lon
    })

    startTransition(() => {
      setResults([])
    })
    setSearchState({ status: 'selected', message: '' })
  }

  const handleLocateCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setSearchState({
        status: 'location-error',
        message: '当前设备不支持定位。'
      })
      return
    }

    setSearchState({ status: 'locating', message: '' })

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = Number(position.coords.latitude)
        const lon = Number(position.coords.longitude)
        const label = `当前位置 (${lat.toFixed(6)}, ${lon.toFixed(6)})`

        onChange(field.id, {
          query: label,
          label,
          lat,
          lon
        })

        startTransition(() => {
          setResults([])
        })
        setSearchState({ status: 'selected', message: '' })
      },
      () => {
        setSearchState({
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
      <div className='notion-form-place-toolbar'>
        <input
          autoComplete='street-address'
          className='notion-form-input'
          disabled={disabled}
          id={`notion-form-field-${field.id}`}
          name={field.id}
          onChange={handlePlaceChange}
          placeholder='搜索地址、地标，或直接使用当前位置'
          type='text'
          value={query}
        />

        <button
          className='notion-form-place-action'
          disabled={disabled}
          onClick={handleLocateCurrentPosition}
          type='button'>
          获取当前位置
        </button>
      </div>

      {hasCoordinates && (
        <div className='notion-form-place-status notion-form-place-status-selected'>
          已锁定坐标 {Number(value.lat).toFixed(6)}, {Number(value.lon).toFixed(6)}
        </div>
      )}

      {!hasCoordinates && searchState.status === 'searching' && (
        <div className='notion-form-place-status' aria-live='polite'>
          正在搜索可识别地址...
        </div>
      )}

      {!hasCoordinates &&
        searchState.message &&
        searchState.status !== 'searching' && (
          <div
            aria-live='polite'
            className={`notion-form-place-status notion-form-place-status-${searchState.status}`}>
            {searchState.message}
          </div>
        )}

      {!hasCoordinates && results.length > 0 && (
        <ul className='notion-form-place-results'>
          {results.map(place => (
            <li key={`${place.label}-${place.lat}-${place.lon}`}>
              <button
                className='notion-form-place-option'
                disabled={disabled}
                onClick={() => handlePlaceSelect(place)}
                type='button'>
                <span className='notion-form-place-option-label'>{place.label}</span>
                <span className='notion-form-place-option-coordinates'>
                  {Number(place.lat).toFixed(6)}, {Number(place.lon).toFixed(6)}
                </span>
              </button>
            </li>
          ))}
        </ul>
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
