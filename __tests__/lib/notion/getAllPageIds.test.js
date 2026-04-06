import getAllPageIds from '@/lib/notion/getAllPageIds'

describe('getAllPageIds', () => {
  test('returns ids from the preferred collection query view', () => {
    const result = getAllPageIds(
      {
        collectionA: {
          viewA: {
            collection_group_results: {
              blockIds: ['page-1', 'page-2']
            }
          }
        }
      },
      'collectionA',
      {},
      ['viewA']
    )

    expect(result).toEqual(['page-1', 'page-2'])
  })

  test('falls back to collection view page_sort when collection query is empty', () => {
    const result = getAllPageIds(
      {
        collectionA: {}
      },
      'collectionA',
      {
        viewA: {
          value: {
            page_sort: ['page-3', 'page-4']
          }
        }
      },
      ['viewA']
    )

    expect(result).toEqual(['page-3', 'page-4'])
  })

  test('deduplicates ids collected from multiple views', () => {
    const result = getAllPageIds(
      {
        collectionA: {
          viewA: {
            blockIds: ['page-1', 'page-2']
          },
          viewB: {
            collection_group_results: {
              blockIds: ['page-2', 'page-3']
            }
          }
        }
      },
      'collectionA',
      {
        viewC: {
          value: {
            page_sort: ['page-3', 'page-4']
          }
        }
      },
      ['missing-view']
    )

    expect(result).toEqual(['page-1', 'page-2', 'page-3', 'page-4'])
  })

  test('supports nested wrapped collection view records', () => {
    const result = getAllPageIds(
      null,
      'collectionA',
      {
        viewA: {
          value: {
            value: {
              page_sort: ['page-5']
            }
          }
        }
      },
      ['viewA']
    )

    expect(result).toEqual(['page-5'])
  })
})
