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

  it('hydrates missing sibling collection queries from known collection rows', () => {
    const recordMap = {
      block: {
        galleryBlock: {
          value: {
            id: 'galleryBlock',
            type: 'collection_view',
            parent_id: 'page1',
            view_ids: ['galleryView']
          }
        },
        formBlock: {
          value: {
            id: 'formBlock',
            type: 'collection_view',
            parent_id: 'page1',
            view_ids: ['formView']
          }
        },
        newestRow: {
          value: {
            id: 'newestRow',
            type: 'page',
            parent_id: 'collection1',
            parent_table: 'collection',
            created_time: 20
          }
        },
        olderRow: {
          value: {
            id: 'olderRow',
            type: 'page',
            parent_id: 'collection1',
            parent_table: 'collection',
            created_time: 10
          }
        }
      },
      collection_view: {
        galleryView: {
          value: {
            id: 'galleryView',
            type: 'gallery',
            format: {
              collection_pointer: {
                id: 'collection1'
              }
            }
          }
        },
        formView: {
          value: {
            id: 'formView',
            type: 'form_editor',
            format: {
              collection_pointer: {
                id: 'collection1'
              }
            }
          }
        }
      },
      collection_query: {
        collection1: {
          formView: {
            collection_group_results: {
              type: 'results',
              blockIds: ['newestRow', 'olderRow'],
              hasMore: false
            }
          }
        }
      }
    }

    const normalized = normalizeRecordMap(recordMap)

    expect(
      normalized.collection_query.collection1.galleryView.collection_group_results
        .blockIds
    ).toEqual(['newestRow', 'olderRow'])
  })

  it('derives collection query results from collection pages when no view query exists yet', () => {
    const recordMap = {
      block: {
        galleryBlock: {
          value: {
            id: 'galleryBlock',
            type: 'collection_view',
            parent_id: 'page1',
            view_ids: ['galleryView']
          }
        },
        olderRow: {
          value: {
            id: 'olderRow',
            type: 'page',
            parent_id: 'collection1',
            parent_table: 'collection',
            created_time: 10
          }
        },
        newestRow: {
          value: {
            id: 'newestRow',
            type: 'page',
            parent_id: 'collection1',
            parent_table: 'collection',
            created_time: 20
          }
        }
      },
      collection_view: {
        galleryView: {
          value: {
            id: 'galleryView',
            type: 'gallery',
            format: {
              collection_pointer: {
                id: 'collection1'
              }
            }
          }
        }
      }
    }

    const normalized = normalizeRecordMap(recordMap)

    expect(
      normalized.collection_query.collection1.galleryView.collection_group_results
        .blockIds
    ).toEqual(['newestRow', 'olderRow'])
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
