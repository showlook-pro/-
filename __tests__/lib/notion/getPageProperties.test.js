import getPageProperties from '@/lib/notion/getPageProperties'
import notionAPI from '@/lib/notion/getNotionAPI'

jest.mock('notion-utils', () => ({
  getDateValue: () => ({ start_date: '2026-01-01' }),
  getTextContent: value => {
    if (!Array.isArray(value)) return ''
    return value
      .flat(Infinity)
      .filter(item => typeof item === 'string')
      .join('')
  }
}))

jest.mock('@/lib/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn()
  }
}))

describe('getPageProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deduplicates repeated Notion person lookups within one runtime', async () => {
    notionAPI.getUsers.mockResolvedValue({
      recordMapWithRoles: {
        notion_user: {
          user1: {
            value: {
              id: 'user1',
              given_name: 'Xiao',
              family_name: 'Lu',
              profile_photo: 'avatar.png'
            }
          }
        }
      }
    })

    const schema = {
      person: {
        name: '人员',
        type: 'person'
      }
    }
    const value = {
      properties: {
        person: [[[['‣', 'user1']]], [[['‣', 'user1']]]]
      },
      created_time: 1770000000000,
      last_edited_time: 1770000000000,
      format: {}
    }

    const properties = await getPageProperties('page1', value, schema, null, [])

    expect(notionAPI.getUsers).toHaveBeenCalledTimes(1)
    expect(properties['人员']).toEqual([
      {
        id: 'user1',
        first_name: 'Xiao',
        last_name: 'Lu',
        profile_photo: 'avatar.png'
      },
      {
        id: 'user1',
        first_name: 'Xiao',
        last_name: 'Lu',
        profile_photo: 'avatar.png'
      }
    ])
  })
})
