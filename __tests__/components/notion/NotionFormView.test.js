import { render, screen } from '@testing-library/react'
import NotionFormView from '@/components/notion/NotionFormView'

jest.mock('react-notion-x', () => ({
  useNotionContext: jest.fn()
}))

const { useNotionContext } = require('react-notion-x')

describe('NotionFormView', () => {
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
                phone: {
                  name: '您的电话号码',
                  type: 'phone_number'
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
    expect(screen.getByLabelText('人员')).toBeInTheDocument()
    expect(screen.getByLabelText('您的电话号码')).toBeInTheDocument()
    expect(screen.getByLabelText('合作方式及意向')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '提交'
      })
    ).toBeInTheDocument()
  })
})
