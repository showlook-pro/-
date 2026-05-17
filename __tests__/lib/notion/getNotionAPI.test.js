const mockGetPage = jest.fn()
const mockGetCollectionData = jest.fn()
const mockGetBlocks = jest.fn()
const mockSyncRecordValues = jest.fn()

jest.mock('notion-client', () => ({
  NotionAPI: jest.fn(() => ({
    getPage: mockGetPage,
    getCollectionData: mockGetCollectionData,
    getBlocks: mockGetBlocks,
    getUsers: jest.fn()
  }))
}))

jest.mock('notion-utils', () => ({
  getBlockCollectionId: block =>
    block?.collection_id || block?.format?.collection_pointer?.id || null
}))

jest.mock('@/lib/notion/requestNotion', () => ({
  buildSyncRecordRequest: (id, table) => ({ id, table }),
  syncRecordValues: mockSyncRecordValues,
  submitTransaction: jest.fn()
}))

const createRecordMap = () => ({
  block: {
    collectionBlock: {
      value: {
        id: 'collectionBlock',
        type: 'collection_view',
        collection_id: 'collection1',
        view_ids: ['view1'],
        space_id: 'space1'
      }
    }
  },
  collection_view: {
    view1: {
      value: {
        id: 'view1',
        type: 'table',
        format: {}
      }
    },
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
  }
})

describe('notionAPI upstream request policy', () => {
  beforeEach(() => {
    jest.resetModules()
    mockGetPage.mockReset()
    mockGetCollectionData.mockReset()
    mockGetBlocks.mockReset()
    mockSyncRecordValues.mockReset()
  })

  it('keeps getPage lightweight by default', async () => {
    mockGetPage.mockResolvedValue(createRecordMap())

    const notionAPI = require('@/lib/notion/getNotionAPI').default
    await notionAPI.getPage('page1')

    expect(mockGetPage).toHaveBeenCalledTimes(1)
    expect(mockGetCollectionData).not.toHaveBeenCalled()
    expect(mockGetBlocks).not.toHaveBeenCalled()
    expect(mockSyncRecordValues).not.toHaveBeenCalled()
  })

  it('ignores custom hydration options instead of calling getCollectionData', async () => {
    mockGetPage.mockResolvedValue(createRecordMap())

    const notionAPI = require('@/lib/notion/getNotionAPI').default
    await notionAPI.getPage('page1', { hydrateCollections: true })

    expect(mockGetPage).toHaveBeenCalledTimes(1)
    expect(mockGetCollectionData).not.toHaveBeenCalled()
  })

  it('does not surface collection hydration rate limits because hydration is not part of browsing', async () => {
    mockGetPage.mockResolvedValue(createRecordMap())
    mockGetCollectionData.mockRejectedValue(
      new Error('Too many requests. Try again in a moment.')
    )

    const notionAPI = require('@/lib/notion/getNotionAPI').default
    await notionAPI.getPage('page1', { hydrateCollections: true })

    expect(mockGetCollectionData).not.toHaveBeenCalled()
  })

  it('ignores form hydration options instead of calling getBlocks or syncRecordValues', async () => {
    mockGetPage.mockResolvedValue(createRecordMap())

    const notionAPI = require('@/lib/notion/getNotionAPI').default
    await notionAPI.getPage('page1', { hydrateForms: true })

    expect(mockGetPage).toHaveBeenCalledTimes(1)
    expect(mockGetBlocks).not.toHaveBeenCalled()
    expect(mockSyncRecordValues).not.toHaveBeenCalled()
  })
})
