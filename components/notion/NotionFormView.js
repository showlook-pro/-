import {
  getFormDefinition,
  getFormInputKind
} from '@/lib/notion/forms'
import { useMemo, useState } from 'react'
import { useNotionContext } from 'react-notion-x'

const EMPTY_VALUES = {}

const getFieldValue = (values, field) => {
  const currentValue = values[field.id]

  if (field.inputKind === 'checkbox') {
    return Boolean(currentValue)
  }

  if (field.inputKind === 'multi_select') {
    return Array.isArray(currentValue) ? currentValue : []
  }

  return currentValue ?? ''
}

const getErrorMessage = error =>
  error?.message || '提交失败，请稍后再试。'

const renderFieldControl = ({ field, value, onChange, disabled }) => {
  const commonProps = {
    id: `notion-form-field-${field.id}`,
    name: field.id,
    disabled
  }

  switch (getFormInputKind(field)) {
    case 'textarea':
      return (
        <textarea
          {...commonProps}
          value={value}
          rows={4}
          className='notion-form-input notion-form-textarea'
          onChange={event => onChange(field.id, event.target.value)}
        />
      )
    case 'select':
      return (
        <select
          {...commonProps}
          value={value}
          className='notion-form-input notion-form-select'
          onChange={event => onChange(field.id, event.target.value)}>
          <option value=''>请选择</option>
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
            type='checkbox'
            checked={value}
            onChange={event => onChange(field.id, event.target.checked)}
          />
          <span>{field.name}</span>
        </label>
      )
    case 'number':
      return (
        <input
          {...commonProps}
          type='number'
          value={value}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
        />
      )
    case 'email':
    case 'tel':
    case 'url':
      return (
        <input
          {...commonProps}
          type={field.inputKind}
          value={value}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
        />
      )
    case 'place':
      return (
        <input
          {...commonProps}
          type='text'
          value={value}
          className='notion-form-input'
          placeholder='请输入可识别的地址或地标'
          onChange={event => onChange(field.id, event.target.value)}
        />
      )
    default:
      return (
        <input
          {...commonProps}
          type='text'
          value={value}
          className='notion-form-input'
          onChange={event => onChange(field.id, event.target.value)}
        />
      )
  }
}

export default function NotionFormView({ block }) {
  const { recordMap } = useNotionContext()
  const [values, setValues] = useState(EMPTY_VALUES)
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
  }

  const submitForm = async () => {
    setIsSubmitting(true)
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
            const inputKind = getFormInputKind(field)

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
                  field,
                  value: fieldValue,
                  onChange: handleChange,
                  disabled: isSubmitting
                })}
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
