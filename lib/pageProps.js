import BLOG from '@/blog.config'
import { siteConfig } from './config'

const BASE_PROPS = ['NOTION_CONFIG', 'siteInfo', 'customMenu', 'customNav']

const PROXIO_LAYOUT_PROP_ALLOWLIST = {
  LayoutIndex: [...BASE_PROPS, 'posts', 'notice', 'allNavPages'],
  LayoutSlug: [...BASE_PROPS, 'post', 'allNavPages'],
  LayoutDashboard: [...BASE_PROPS, 'post', 'allNavPages'],
  LayoutSearch: [...BASE_PROPS, 'posts', 'postCount', 'keyword', 'page'],
  LayoutArchive: [...BASE_PROPS, 'posts', 'postCount', 'archivePosts'],
  LayoutPostList: [
    ...BASE_PROPS,
    'posts',
    'postCount',
    'page',
    'category',
    'tag'
  ],
  LayoutCategoryIndex: [...BASE_PROPS, 'categoryOptions'],
  LayoutTagIndex: [...BASE_PROPS, 'tagOptions'],
  Layout404: [...BASE_PROPS, 'isNotFoundPage', 'statusCode'],
  LayoutSignIn: [...BASE_PROPS],
  LayoutSignUp: [...BASE_PROPS]
}

function isEnabled(value) {
  return value === true || value === 'true'
}

function pickProps(source, keys) {
  const picked = {}

  for (const key of keys) {
    if (source[key] !== undefined) {
      picked[key] = source[key]
    }
  }

  return picked
}

/**
 * 基于当前主题和布局裁剪页面 props，避免把当前布局不会消费的全局重数据重复下发到每个页面。
 * 仅在主题切换功能关闭时对 proxio 启用，避免影响多主题预览能力。
 */
export function optimizeStaticPageProps(props, layoutName) {
  if (!props || typeof props !== 'object') {
    return props
  }

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const themeSwitchEnabled = isEnabled(
    siteConfig('THEME_SWITCH', false, props.NOTION_CONFIG)
  )

  if (theme !== 'proxio' || themeSwitchEnabled) {
    return props
  }

  const allowList = PROXIO_LAYOUT_PROP_ALLOWLIST[layoutName]
  if (!allowList) {
    return props
  }

  return pickProps(props, allowList)
}
