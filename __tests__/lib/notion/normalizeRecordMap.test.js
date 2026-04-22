import { normalizeRecordMap } from '@/lib/notion/normalizeRecordMap'

describe('normalizeRecordMap', () => {
  it('normalizes gallery cover aliases and unwraps nested record values', () => {
    const recordMap = {
      collection_view: {
        galleryView: {
          value: {
            value: {
              id: 'galleryView',
              format: {
                gallery_cover: {
                  type: 'page_content_first'
                }
              }
            },
            role: 'reader'
          }
        }
      },
      block: {
        page1: {
          value: {
            value: {
              id: 'page1',
              type: 'page'
            },
            role: 'editor'
          }
        }
      }
    }

    const normalized = normalizeRecordMap(recordMap)

    expect(normalized.collection_view.galleryView.role).toBe('reader')
    expect(normalized.collection_view.galleryView.value.format.gallery_cover.type).toBe(
      'page_content'
    )
    expect(normalized.block.page1.role).toBe('editor')
    expect(normalized.block.page1.value.type).toBe('page')
  })

  it('returns the original object when there is nothing to normalize', () => {
    const recordMap = {
      block: {
        page1: {
          value: {
            id: 'page1',
            type: 'page'
          }
        }
      }
    }

    expect(normalizeRecordMap(recordMap)).toBe(recordMap)
    expect(recordMap.block.page1.value.type).toBe('page')
  })
})
