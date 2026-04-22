import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'

export function createNotFoundStaticPropsResult(notionConfig) {
  return {
    notFound: true,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          notionConfig
        )
  }
}
