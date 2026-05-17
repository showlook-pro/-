import { getMissingContentHydrationOptions } from '@/lib/notion/getPostBlocks'

jest.mock('@/lib/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getBlocks: jest.fn(),
    getPage: jest.fn()
  }
}))

jest.mock('notion-utils', () => ({
  getBlockCollectionId: block =>
    block?.collection_id || block?.format?.collection_pointer?.id || null
}))

const createCollectionRecordMap = overrides => ({
  block: {
    page1: {
      value: {
        id: 'page1',
        type: 'page',
        content: ['collectionBlock']
      }
    },
    collectionBlock: {
      value: {
        id: 'collectionBlock',
        type: 'collection_view',
        collection_id: 'collection1',
        view_ids: ['view1']
      }
    }
  },
  collection: {
    collection1: {
      value: {
        id: 'collection1',
        schema: {}
      }
    }
  },
  collection_view: {
    view1: {
      value: {
        id: 'view1',
        type: 'gallery',
        format: {}
      }
    }
  },
  collection_query: {
    collection1: {
      view1: {
        blockIds: []
      }
    }
  },
  ...overrides
})

describe('getMissingContentHydrationOptions', () => {
  it('keeps normal collection pages lightweight when collection query is already present', () => {
    expect(
      getMissingContentHydrationOptions(createCollectionRecordMap())
    ).toBeNull()
  })

  it('does not request collection hydration when collection query is missing', () => {
    expect(
      getMissingContentHydrationOptions(
        createCollectionRecordMap({
          collection_query: {}
        })
      )
    ).toBeNull()
  })

  it('does not request form hydration when a native form block is missing', () => {
    expect(
      getMissingContentHydrationOptions(
        createCollectionRecordMap({
          block: {
            collectionBlock: {
              value: {
                id: 'collectionBlock',
                type: 'collection_view',
                collection_id: 'collection1',
                view_ids: ['formView']
              }
            }
          },
          collection_view: {
            formView: {
              value: {
                id: 'formView',
                type: 'form_editor',
                format: {
                  form_block_pointer: {
                    id: 'formBlock1'
                  }
                }
              }
            }
          },
          collection_query: {}
        })
      )
    ).toBeNull()
  })
})
