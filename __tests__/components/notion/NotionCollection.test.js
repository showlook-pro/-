import { render, screen } from '@testing-library/react'
import NotionCollection from '@/components/notion/NotionCollection'

jest.mock('react-notion-x', () => ({
  useNotionContext: jest.fn()
}))

jest.mock('react-notion-x/build/third-party/collection', () => ({
  Collection: ({ ctx }) => {
    const Component = ctx?.isLinkCollectionToUrlProperty
      ? ctx?.components?.Link || 'a'
      : ctx?.components?.PageLink || 'a'

    return (
      <Component
        className='notion-collection-card notion-page-link'
        href={
          ctx?.isLinkCollectionToUrlProperty ? 'https://example.com' : '/row1'
        }>
        <span>意向留言</span>
      </Component>
    )
  },
  Property: ({ data }) => <span>{data?.[0]?.[0] || ''}</span>
}))

const { useNotionContext } = require('react-notion-x')

const createRecordMap = ({ useUrlProperty = false } = {}) => ({
  block: {
    parentPage: {
      value: {
        id: 'parentPage',
        type: 'page'
      }
    },
    collectionBlock: {
      value: {
        id: 'collectionBlock',
        type: 'collection_view',
        parent_id: 'parentPage',
        parent_table: 'block',
        collection_id: 'collection1',
        view_ids: ['galleryView']
      }
    },
    row1: {
      value: {
        id: 'row1',
        type: 'page',
        parent_id: 'collection1',
        parent_table: 'collection',
        properties: {
          title: [['意向留言']],
          ...(useUrlProperty
            ? {
                externalUrl: [['https://example.com']]
              }
            : {})
        }
      }
    }
  },
  collection: {
    collection1: {
      value: {
        id: 'collection1',
        name: [['答复']],
        schema: {
          title: {
            name: '标题',
            type: 'title'
          },
          ...(useUrlProperty
            ? {
                externalUrl: {
                  name: '外链',
                  type: 'url'
                }
              }
            : {})
        }
      }
    }
  },
  collection_view: {
    galleryView: {
      value: {
        id: 'galleryView',
        type: 'gallery',
        name: '答复',
        format: {
          collection_pointer: {
            id: 'collection1'
          },
          gallery_cover: {
            type: 'none'
          },
          gallery_properties: [{ property: 'title', visible: true }]
        }
      }
    }
  },
  collection_query: {
    collection1: {
      galleryView: {
        collection_group_results: {
          type: 'results',
          blockIds: ['row1'],
          hasMore: false
        }
      }
    }
  }
})

const renderCollection = ({
  pagePropertiesMode = '',
  useUrlProperty = false
} = {}) => {
  useNotionContext.mockReturnValue({
    recordMap: createRecordMap({ useUrlProperty }),
    isLinkCollectionToUrlProperty: useUrlProperty
  })

  return render(
    <NotionCollection
      block={{
        id: 'collectionBlock',
        type: 'collection_view',
        parent_id: 'parentPage',
        parent_table: 'block',
        collection_id: 'collection1',
        view_ids: ['galleryView']
      }}
      pagePropertiesMode={pagePropertiesMode}
    />
  )
}

describe('NotionCollection', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders gallery cards as non-links when pagePropertiesMode is showclose', () => {
    renderCollection({ pagePropertiesMode: 'showclose' })

    const card = screen.getByText('意向留言').closest('.notion-collection-card')

    expect(card).toBeInTheDocument()
    expect(card.tagName).toBe('DIV')
    expect(card).not.toHaveAttribute('href')
    expect(card).toHaveAttribute('data-notion-collection-link', 'disabled')
  })

  it('keeps gallery cards linkable when pagePropertiesMode is showopen', () => {
    renderCollection({ pagePropertiesMode: 'showopen' })

    const card = screen.getByText('意向留言').closest('.notion-collection-card')

    expect(card).toBeInTheDocument()
    expect(card.tagName).toBe('A')
  })

  it('does not alter url-property card links because they are a separate notion-x feature', () => {
    renderCollection({
      pagePropertiesMode: 'showclose',
      useUrlProperty: true
    })

    const card = screen.getByText('意向留言').closest('.notion-collection-card')

    expect(card).toBeInTheDocument()
    expect(card.tagName).toBe('A')
    expect(card).toHaveAttribute('href', 'https://example.com')
  })
})
