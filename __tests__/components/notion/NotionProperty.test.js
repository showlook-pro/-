import { render, screen } from '@testing-library/react'
import NotionProperty from '@/components/notion/NotionProperty'

jest.mock('react-notion-x/build/third-party/collection', () => ({
  Property: ({ data }) => (
    <span data-testid='default-property'>{data?.[0]?.[0] || ''}</span>
  )
}))

describe('NotionProperty', () => {
  it('renders selected inline fields with a light label and bold inline value', () => {
    render(
      <NotionProperty
        data={[['13800138000']]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '您的电话号码',
          type: 'phone_number'
        }}
      />
    )

    const label = screen.getByText('您的电话号码：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('13800138000')
    expect(screen.getByTestId('default-property').parentElement).toHaveClass(
      'notion-property-inline-content'
    )
  })

  it('keeps non-selected inline fields in the default stacked layout', () => {
    render(
      <NotionProperty
        data={[['默认值']]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '其他字段',
          type: 'text'
        }}
      />
    )

    const label = screen.getByText('其他字段')

    expect(label.closest('.notion-property-inline-value')).toBeInTheDocument()
    expect(label.closest('.notion-property-inline-row')).not.toBeInTheDocument()
  })

  it('uses the same inline row treatment for the selected place field', () => {
    render(
      <NotionProperty
        block={{
          properties: {
            title: [['意向留言']]
          }
        }}
        data={[[null, [['plc', { lat: 39.9, lon: 116.4 }]]]]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '您的地址',
          type: 'place'
        }}
      />
    )

    const label = screen.getByText('您的地址：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('查看定位')
  })
})
