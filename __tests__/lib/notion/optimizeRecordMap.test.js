import { optimizeRecordMapForClientRender } from '@/lib/notion/optimizeRecordMap'

describe('optimizeRecordMapForClientRender', () => {
  it('drops collection row descendants when the page only needs row properties', () => {
    const recordMap = {
      block: {
        collectionBlock: {
          value: {
            id: 'collectionBlock',
            type: 'collection_view',
            collection_id: 'collection1',
            view_ids: ['tableView']
          }
        },
        row1: {
          value: {
            id: 'row1',
            type: 'page',
            parent_id: 'collection1',
            parent_table: 'collection',
            properties: { title: [['Row 1']] },
            content: ['row1-text', 'row1-image']
          }
        },
        'row1-text': {
          value: {
            id: 'row1-text',
            type: 'text',
            parent_id: 'row1'
          }
        },
        'row1-image': {
          value: {
            id: 'row1-image',
            type: 'image',
            parent_id: 'row1'
          }
        }
      },
      collection_view: {
        tableView: {
          value: {
            id: 'tableView',
            type: 'table',
            format: {}
          }
        }
      }
    }

    const optimized = optimizeRecordMapForClientRender(recordMap)

    expect(optimized.block.row1.value.properties.title).toEqual([['Row 1']])
    expect(optimized.block.row1.value.content).toBeUndefined()
    expect(optimized.block['row1-text']).toBeUndefined()
    expect(optimized.block['row1-image']).toBeUndefined()
  })

  it('keeps the first direct image block when a collection view uses page content as cover', () => {
    const recordMap = {
      block: {
        collectionBlock: {
          value: {
            id: 'collectionBlock',
            type: 'collection_view',
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
            properties: { title: [['Row 1']] },
            content: ['row1-text', 'row1-image', 'row1-callout']
          }
        },
        'row1-text': {
          value: {
            id: 'row1-text',
            type: 'text',
            parent_id: 'row1'
          }
        },
        'row1-image': {
          value: {
            id: 'row1-image',
            type: 'image',
            parent_id: 'row1',
            properties: { source: [['https://example.com/image.png']] }
          }
        },
        'row1-callout': {
          value: {
            id: 'row1-callout',
            type: 'callout',
            parent_id: 'row1'
          }
        }
      },
      collection_view: {
        galleryView: {
          value: {
            id: 'galleryView',
            type: 'gallery',
            format: {
              gallery_cover: {
                type: 'page_content'
              }
            }
          }
        }
      }
    }

    const optimized = optimizeRecordMapForClientRender(recordMap)

    expect(optimized.block.row1.value.content).toEqual(['row1-image'])
    expect(optimized.block['row1-image']).toBeDefined()
    expect(optimized.block['row1-text']).toBeUndefined()
    expect(optimized.block['row1-callout']).toBeUndefined()
  })
})
