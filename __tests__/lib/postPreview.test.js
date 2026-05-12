import { hydratePostPreviews } from '@/lib/postPreview'
import { getPostPreviewBlocks } from '@/lib/db/getSiteData'

jest.mock('@/lib/db/getSiteData', () => ({
  getPostPreviewBlocks: jest.fn()
}))

describe('hydratePostPreviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('limits preview hydration to configured count and skips locked posts', async () => {
    getPostPreviewBlocks.mockResolvedValue({ block: {} })

    const posts = [
      { id: 'post1' },
      { id: 'locked', password: 'secret' },
      { id: 'post2' },
      { id: 'post3' }
    ]

    await hydratePostPreviews(
      posts,
      {
        POST_LIST_PREVIEW: true,
        POST_PREVIEW_MAX_COUNT: 2,
        POST_PREVIEW_LINES: 8,
        POST_PREVIEW_CONCURRENCY: 1
      },
      'test-preview'
    )

    expect(getPostPreviewBlocks).toHaveBeenCalledTimes(2)
    expect(getPostPreviewBlocks).toHaveBeenNthCalledWith(
      1,
      'post1',
      'test-preview',
      8
    )
    expect(getPostPreviewBlocks).toHaveBeenNthCalledWith(
      2,
      'post2',
      'test-preview',
      8
    )
    expect(posts[0].blockMap).toEqual({ block: {} })
    expect(posts[2].blockMap).toEqual({ block: {} })
    expect(posts[3].blockMap).toBeUndefined()
  })

  it('does not hydrate previews when preview mode is disabled', async () => {
    await hydratePostPreviews(
      [{ id: 'post1' }],
      { POST_LIST_PREVIEW: false },
      'test-preview'
    )

    expect(getPostPreviewBlocks).not.toHaveBeenCalled()
  })
})
