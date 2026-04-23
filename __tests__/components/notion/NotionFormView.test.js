import { fireEvent, render, screen } from '@testing-library/react'
import NotionFormView from '@/components/notion/NotionFormView'
import { MAINLAND_PHONE_ERROR_MESSAGE } from '@/lib/notion/forms'

jest.mock('react-notion-x', () => ({
  useNotionContext: jest.fn()
}))

const { useNotionContext } = require('react-notion-x')

describe('NotionFormView', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  beforeEach(() => {
    useNotionContext.mockReturnValue({
      recordMap: {
        collection: {
          collection1: {
            value: {
              id: 'collection1',
              space_id: 'space1',
              name: [['商务合作']],
              schema: {
                extraText: {
                  name: '人员',
                  type: 'text'
                },
                genericText: {
                  name: '文本',
                  type: 'text'
                },
                phone: {
                  name: '您的电话号码',
                  type: 'phone_number'
                },
                place: {
                  name: '您的地址',
                  type: 'place'
                },
                createdBy: {
                  name: '回复者',
                  type: 'created_by'
                },
                selectText: {
                  name: '合作方式及意向',
                  type: 'text',
                  options: [{ id: 'a', value: '选项 1' }]
                },
                title: {
                  name: '您的姓名',
                  type: 'title'
                }
              }
            }
          }
        },
        collection_view: {
          formView: {
            value: {
              id: 'formView',
              type: 'form_editor',
              name: '表单生成器',
              format: {
                collection_pointer: {
                  id: 'collection1'
                },
                form_block_pointer: {
                  id: 'formBlock1'
                }
              }
            }
          }
        },
        block: {
          formBlock1: {
            value: {
              id: 'formBlock1',
              type: 'form',
              properties: {
                title: [['市场合作意向表']]
              },
              format: {
                form_config: {
                  description: [['请认真填写此表']]
                }
              }
            }
          }
        }
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders a native notion form using the form_editor view data', () => {
    render(
      <NotionFormView
        block={{
          id: 'collectionBlock1',
          collection_id: 'collection1',
          view_ids: ['formView']
        }}
      />
    )

    expect(screen.getByText('市场合作意向表')).toBeInTheDocument()
    expect(screen.getByText('请认真填写此表')).toBeInTheDocument()
    expect(screen.getByLabelText('您的姓名')).toBeInTheDocument()
    expect(screen.queryByLabelText('人员')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('文本')).not.toBeInTheDocument()
    expect(screen.getByLabelText('您的电话号码')).toBeInTheDocument()
    expect(screen.getByLabelText('您的地址')).toBeInTheDocument()

    const intentField = screen.getByLabelText('合作方式及意向')
    expect(intentField.tagName).toBe('TEXTAREA')
    expect(screen.queryByRole('button', { name: '选项 1' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '提交'
      })
    ).toBeInTheDocument()
  })

  it('blocks invalid mainland China phone numbers before submitting', () => {
    render(
      <NotionFormView
        block={{
          id: 'collectionBlock1',
          collection_id: 'collection1',
          view_ids: ['formView']
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('您的电话号码'), {
      target: {
        value: '12345'
      }
    })
    fireEvent.click(screen.getByRole('button', { name: '提交' }))

    expect(screen.getByText(MAINLAND_PHONE_ERROR_MESSAGE)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('uses friendly city wording after resolving a place field', () => {
    const getCurrentPosition = jest.fn(success => {
      success({
        coords: {
          latitude: 0,
          longitude: 0
        }
      })
    })

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition
      }
    })

    render(
      <NotionFormView
        block={{
          id: 'collectionBlock1',
          collection_id: 'collection1',
          view_ids: ['formView']
        }}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: '一键获取您所在的城市' })
    )

    expect(getCurrentPosition).toHaveBeenCalled()
    expect(screen.getByText('已获取城市信息')).toBeInTheDocument()
    expect(screen.queryByText(/已锁定坐标/)).not.toBeInTheDocument()
    expect(screen.queryByText(/0\.000000/)).not.toBeInTheDocument()
  })
})
