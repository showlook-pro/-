jest.mock('@/lib/config', () => ({
  siteConfig: (key, defaultVal, extendConfig = {}) =>
    extendConfig?.[key] ?? defaultVal
}))

import { optimizeStaticPageProps } from '@/lib/pageProps'

describe('optimizeStaticPageProps', () => {
  it('trims proxio slug props to functional minimum when theme switch is disabled', () => {
    const props = {
      NOTION_CONFIG: { THEME: 'proxio', THEME_SWITCH: false },
      siteInfo: { title: 'SHOWLOOK' },
      customMenu: [{ name: 'Menu' }],
      customNav: [{ name: 'Nav' }],
      post: { id: 'post-1' },
      allNavPages: [{ short_id: 'abc', href: '/article/a' }],
      notice: { blockMap: {} },
      latestPosts: [{ id: 'latest-1' }],
      tagOptions: [{ name: 'tag' }],
      categoryOptions: [{ name: 'category' }],
      prev: { id: 'prev-1' },
      next: { id: 'next-1' },
      recommendPosts: [{ id: 'r-1' }]
    }

    expect(optimizeStaticPageProps(props, 'LayoutSlug')).toEqual({
      NOTION_CONFIG: props.NOTION_CONFIG,
      siteInfo: props.siteInfo,
      customMenu: props.customMenu,
      customNav: props.customNav,
      post: props.post,
      allNavPages: props.allNavPages
    })
  })

  it('keeps notice on proxio home because the homepage renders a notion announcement', () => {
    const props = {
      NOTION_CONFIG: { THEME: 'proxio', THEME_SWITCH: false },
      siteInfo: { title: 'SHOWLOOK' },
      customMenu: [],
      customNav: [],
      posts: [{ id: '1' }],
      notice: { blockMap: { block: {} } },
      allNavPages: [{ short_id: 'abc', href: '/article/a' }],
      latestPosts: [{ id: '2' }]
    }

    expect(optimizeStaticPageProps(props, 'LayoutIndex')).toEqual({
      NOTION_CONFIG: props.NOTION_CONFIG,
      siteInfo: props.siteInfo,
      customMenu: props.customMenu,
      customNav: props.customNav,
      posts: props.posts,
      notice: props.notice,
      allNavPages: props.allNavPages
    })
  })

  it('skips pruning when theme switch is enabled to preserve multi-theme previews', () => {
    const props = {
      NOTION_CONFIG: { THEME: 'proxio', THEME_SWITCH: true },
      notice: { blockMap: {} },
      latestPosts: [{ id: 'latest-1' }]
    }

    expect(optimizeStaticPageProps(props, 'LayoutSearch')).toBe(props)
  })
})
