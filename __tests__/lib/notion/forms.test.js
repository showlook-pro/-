import {
  buildFormProperties,
  buildFormSubmissionOperation,
  getEditableFormFields,
  getFormDefinition
} from '@/lib/notion/forms'

describe('notion forms helpers', () => {
  const recordMap = {
    collection: {
      collection1: {
        value: {
          id: 'collection1',
          name: [['商务合作']],
          space_id: 'space1',
          schema: {
            extraText: {
              name: '人员',
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

  it('extracts a public notion form definition from recordMap', () => {
    const definition = getFormDefinition({
      block: {
        id: 'block1',
        collection_id: 'collection1',
        view_ids: ['formView']
      },
      recordMap
    })

    expect(definition.title).toBe('市场合作意向表')
    expect(definition.description).toBe('请认真填写此表')
    expect(definition.fields.map(field => field.id)).toEqual([
      'title',
      'extraText',
      'phone',
      'place',
      'selectText'
    ])
  })

  it('filters out readonly fields when building editable fields', () => {
    const fields = getEditableFormFields(recordMap.collection.collection1.value)
    expect(fields.some(field => field.id === 'createdBy')).toBe(false)
    expect(fields.find(field => field.id === 'selectText').inputKind).toBe(
      'select'
    )
  })

  it('serializes form values into notion properties', async () => {
    const properties = await buildFormProperties(
      recordMap.collection.collection1.value,
      {
        title: '小鹿',
        phone: '13800138000',
        place: '郑州临空生物医药园',
        selectText: '选项 1'
      },
      {
        resolvePlace: async () => ({ lat: 34.42, lon: 113.85 })
      }
    )

    expect(properties.title).toEqual([['小鹿']])
    expect(properties.phone).toEqual([['13800138000']])
    expect(properties.selectText).toEqual([['选项 1']])
    expect(properties.place).toEqual([
      ['‣', [['plc', { lat: 34.42, lon: 113.85 }]]]
    ])
  })

  it('builds a collection row submission operation', () => {
    const operation = buildFormSubmissionOperation({
      collectionId: 'collection1',
      spaceId: 'space1',
      formBlockId: 'formBlock1',
      actorId: 'user1',
      submissionId: 'submission1',
      timestamp: 123,
      properties: {
        title: [['小鹿']]
      }
    })

    expect(operation.command).toBe('set')
    expect(operation.table).toBe('block')
    expect(operation.args.parent_table).toBe('collection')
    expect(operation.args.parent_id).toBe('collection1')
    expect(operation.args.format.metadata.external_id).toBe('formBlock1')
  })
})
