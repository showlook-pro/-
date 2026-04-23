import { render, screen } from '@testing-library/react'
import NotionProperty from '@/components/notion/NotionProperty'

jest.mock('react-notion-x/build/third-party/collection', () => ({
  Property: ({ data }) => (
    <span data-testid='default-property'>{data?.[0]?.[0] || ''}</span>
  )
}))

describe('NotionProperty', () => {
  it('renders inline fields with the Notion property name as label', () => {
    render(
      <NotionProperty
        data={[['13800138000']]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '电话号码',
          type: 'phone_number'
        }}
      />
    )

    const label = screen.getByText('电话号码：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('13800138000')
    expect(screen.getByTestId('default-property').parentElement).toHaveClass(
      'notion-property-inline-content'
    )
  })

  it('uses the same inline row layout for newly added fields', () => {
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

    const label = screen.getByText('其他字段：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('默认值')
  })

  it('uses the Notion property name for place fields', () => {
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
          name: '地址',
          type: 'place'
        }}
      />
    )

    const label = screen.getByText('地址：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('查看定位')
  })

  it('does not rewrite custom intent field names', () => {
    render(
      <NotionProperty
        data={[['希望合作']]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '合作意向方式',
          type: 'text'
        }}
      />
    )

    const label = screen.getByText('合作意向方式：')
    const row = label.closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('希望合作')
  })

  it('formats created time in Chinese Notion-style text', () => {
    render(
      <NotionProperty
        block={{
          created_time: 1776862736089
        }}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '提交时间',
          type: 'created_time'
        }}
      />
    )

    const row = screen
      .getByText('提交时间：')
      .closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('2026年4月22日 下午8:58')
  })

  it('formats Notion date values without English month names', () => {
    render(
      <NotionProperty
        data={[
          [
            '‣',
            [
              [
                'd',
                {
                  start_date: '2026-04-23'
                }
              ]
            ]
          ]
        ]}
        inline
        pagePropertiesMode='showclose'
        schema={{
          name: '日期',
          type: 'date'
        }}
      />
    )

    const row = screen.getByText('日期：').closest('.notion-property-inline-row')

    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('2026年4月23日')
  })
})
