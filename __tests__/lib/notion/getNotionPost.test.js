import { getPost } from '@/lib/notion/getNotionPost'
import { getPage } from '@/lib/notion/getPostBlocks'
import notionAPI from '@/lib/notion/getNotionAPI'

jest.mock('notion-utils', () => ({
  getTextContent: value => {
    if (!Array.isArray(value)) return ''
    return value
      .map(item => {
        if (Array.isArray(item)) return item[0]
        return item
      })
      .join('')
  },
  idToUuid: id =>
    id?.includes('-')
      ? id
      : `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
}))

jest.mock('react-notion-x', () => ({
  defaultMapImageUrl: url => url
}))

jest.mock('@/lib/notion/getPostBlocks', () => ({
  getPage: jest.fn()
}))

jest.mock('@/lib/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getPage: jest.fn()
  }
}))

describe('getPost', () => {
  const pageId = '34a869f62058800ea433e7e0e60afe09'
  const uuid = '34a869f6-2058-800e-a433-e7e0e60afe09'
  const collectionId = 'collection1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('normalizes raw Notion records before reading direct UUID page properties', async () => {
    getPage.mockResolvedValue({
      block: {
        [uuid]: {
          value: {
            id: uuid,
            type: 'page',
            parent_id: collectionId,
            created_time: 1770000000000,
            last_edited_time: 1770000000000,
            format: {}
          }
        }
      },
      collection: {
        [collectionId]: {
          value: {
            schema: {
              title: {
                name: '您的姓名',
                type: 'title'
              },
              show: {
                name: 'show_page_properties',
                type: 'select'
              }
            }
          }
        }
      }
    })

    notionAPI.getPage.mockResolvedValue({
      block: {
        [uuid]: {
          value: {
            value: {
              id: uuid,
              type: 'page',
              parent_id: collectionId,
              properties: {
                title: [['商务留言']],
                show: [['showclose']]
              },
              created_time: 1770000000000,
              last_edited_time: 1770000000000,
              format: {}
            },
            role: 'reader'
          }
        }
      },
      collection: {
        [collectionId]: {
          value: {
            schema: {
              title: {
                name: '您的姓名',
                type: 'title'
              },
              show: {
                name: 'show_page_properties',
                type: 'select'
              }
            }
          }
        }
      }
    })

    const post = await getPost(pageId, [])

    expect(post.title).toBe('商务留言')
    expect(post.show_page_properties_mode).toBe('showclose')
    expect(post.blockMap.block[uuid].value.type).toBe('page')
  })

  it('does not throw when direct UUID page properties are unavailable', async () => {
    getPage.mockResolvedValue({
      block: {
        [uuid]: {
          value: {
            id: uuid,
            type: 'page',
            parent_id: collectionId,
            created_time: 1770000000000,
            last_edited_time: 1770000000000,
            format: {}
          }
        }
      }
    })
    notionAPI.getPage.mockRejectedValue(new Error('notion unavailable'))

    await expect(getPost(pageId, [])).resolves.toMatchObject({
      id: uuid,
      title: null,
      status: 'Published'
    })
  })
})
