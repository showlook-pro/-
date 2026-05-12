import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'
import { isBuildLifecycle } from '@/lib/utils/buildMode'
import { generateRss } from '@/lib/rss'
import { generateSitemapXml } from '@/lib/sitemap.xml'
import { optimizeStaticPageProps } from '@/lib/pageProps'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'
import { hydratePostPreviews } from '@/lib/postPreview'

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据
 * @returns
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  const props = await getGlobalData({ from, locale })
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // 处理分页
  if (siteConfig('POST_LIST_STYLE') === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  await hydratePostPreviews(props.posts, props?.NOTION_CONFIG, 'index-preview')

  if (isBuildLifecycle()) {
    // 运行时由 ISR/CDN 服务页面；这些文件生成只在构建期执行，避免首页访问额外回源 Notion。
    await generateRss(props)
    generateSitemapXml(props)
    await checkDataFromAlgolia(props)
    if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
      generateRedirectJson(props)
    }
  }

  // 生成全文索引 - 仅在 yarn build 时执行 && process.env.npm_lifecycle_event === 'build'

  delete props.allPages

  return {
    props: optimizeStaticPageProps(props, 'LayoutIndex'),
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Index
