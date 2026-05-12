import { siteConfig } from '@/lib/config'
import { getPostPreviewBlocks } from '@/lib/db/getSiteData'

function createLimit(concurrency) {
  const queue = []
  let activeCount = 0

  const next = () => {
    if (activeCount >= concurrency || queue.length === 0) {
      return
    }

    activeCount++
    const { fn, resolve, reject } = queue.shift()

    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        activeCount--
        next()
      })
  }

  return fn =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
}

export async function hydratePostPreviews(posts, notionConfig, from) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return posts
  }

  if (!siteConfig('POST_LIST_PREVIEW', false, notionConfig)) {
    return posts
  }

  const previewLines = siteConfig('POST_PREVIEW_LINES', 12, notionConfig)
  const maxCount = Math.max(
    0,
    Number(siteConfig('POST_PREVIEW_MAX_COUNT', 4, notionConfig)) || 0
  )
  const concurrency = Math.max(
    1,
    Number(siteConfig('POST_PREVIEW_CONCURRENCY', 5, notionConfig)) || 5
  )

  const limit = createLimit(concurrency)
  const targets = posts
    .filter(post => !post.password || post.password === '')
    .slice(0, maxCount)

  await Promise.all(
    targets.map(post =>
      limit(async () => {
        post.blockMap = await getPostPreviewBlocks(post.id, from, previewLines)
      })
    )
  )

  return posts
}
