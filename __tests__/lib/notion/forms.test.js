import {
  buildFormProperties,
  buildFormSubmissionOperation,
  getEditableFormFields,
  getFormDefinition,
  getFormLayoutPropertyIds,
  isMainlandPhoneNumber,
  normalizeMainlandPhoneNumber,
  validateFormValues
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
            select: {
              name: '合作类型',
              type: 'select',
              options: [{ id: 'b', value: '渠道合作' }]
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
            },
            form_layout_pointer: {
              id: 'layout1'
            }
          }
        }
      }
    },
    layout: {
      layout1: {
        value: {
          id: 'layout1',
          format: {
            fields: [
              { property: 'title' },
              { property: 'phone' },
              { property: 'place' },
              { property: 'selectText' }
            ]
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
      'phone',
      'place',
      'selectText'
    ])
  })

  it('filters out readonly and generic schema-only fields in fallback mode', () => {
    const fields = getEditableFormFields(recordMap.collection.collection1.value)
    expect(fields.some(field => field.id === 'createdBy')).toBe(false)
    expect(fields.some(field => field.id === 'extraText')).toBe(false)
    expect(fields.some(field => field.id === 'genericText')).toBe(false)
    expect(fields.find(field => field.id === 'selectText').inputKind).toBe(
      'textarea'
    )
    expect(fields.find(field => field.id === 'selectText').suggestions).toEqual(
      []
    )
    expect(fields.find(field => field.id === 'select').inputKind).toBe(
      'select'
    )
  })

  it('honors layout property ids when a form layout record is available', () => {
    const layoutPropertyIds = getFormLayoutPropertyIds({
      collection: recordMap.collection.collection1.value,
      formBlock: recordMap.block.formBlock1.value,
      recordMap
    })

    expect(layoutPropertyIds).toEqual(['title', 'phone', 'place', 'selectText'])
  })

  it('serializes form values into notion properties', async () => {
    const properties = await buildFormProperties(
      recordMap.collection.collection1.value,
      {
        title: '小鹿',
        phone: '+86 138 0013 8000',
        place: '郑州临空生物医药园',
        selectText: '选项 1',
        select: '渠道合作'
      },
      {
        resolvePlace: async () => ({ lat: 34.42, lon: 113.85 })
      }
    )

    expect(properties.title).toEqual([['小鹿']])
    expect(properties.phone).toEqual([['13800138000']])
    expect(properties.selectText).toEqual([['选项 1']])
    expect(properties.select).toEqual([['渠道合作']])
    expect(properties.place).toEqual([
      ['‣', [['plc', { lat: 34.42, lon: 113.85 }]]]
    ])
  })

  it('validates mainland China phone numbers consistently', () => {
    const fields = getEditableFormFields(recordMap.collection.collection1.value)

    expect(normalizeMainlandPhoneNumber('+86 138 0013 8000')).toBe(
      '13800138000'
    )
    expect(isMainlandPhoneNumber('13800138000')).toBe(true)
    expect(isMainlandPhoneNumber('010-12345678')).toBe(true)
    expect(validateFormValues(fields, { phone: '12345' })).toEqual({
      phone: '请输入有效的中国大陆手机号或固定电话。'
    })
  })

  it('rejects invalid mainland China phone numbers before serialization', async () => {
    await expect(
      buildFormProperties(recordMap.collection.collection1.value, {
        phone: '12345'
      })
    ).rejects.toThrow('请输入有效的中国大陆手机号或固定电话。')
  })

  it('serializes selected place coordinates without geocoding again', async () => {
    const properties = await buildFormProperties(
      recordMap.collection.collection1.value,
      {
        place: {
          label: '当前位置',
          lat: 34.1,
          lon: 113.2
        }
      },
      {
        resolvePlace: async () => {
          throw new Error('should not geocode resolved coordinates')
        }
      }
    )

    expect(properties.place).toEqual([
      ['‣', [['plc', { lat: 34.1, lon: 113.2 }]]]
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
