jest.mock('@/lib/config', () => ({
  siteConfig: (key, defaultVal, extendConfig = {}) =>
    extendConfig?.[key] ?? defaultVal
}))

jest.mock('@/lib/db/getSiteData', () => ({
  getGlobalData: jest.fn()
}))

import { generateLocalesSitemap } from '@/pages/sitemap.xml'

describe('generateLocalesSitemap', () => {
  it('only includes canonical html pages and taxonomy pages', () => {
    const fields = generateLocalesSitemap(
      'http://xiaolu.love',
      [
        {
          slug: '/article/test-post',
          status: 'Published',
          type: 'Post',
          publishDay: '2026-04-20',
          lastEditedDay: '2026-04-21'
        },
        {
          slug: '/article/test-post-2',
          status: 'Published',
          type: 'Post',
          publishDay: '2026-04-19'
        },
        {
          slug: '/about',
          status: 'Published',
          type: 'Page',
          publishDay: '2026-04-18'
        },
        {
          slug: 'https://external.example.com',
          status: 'Published',
          type: 'Page'
        }
      ],
      '',
      {
        notionConfig: {
          POSTS_PER_PAGE: 1
        },
        categoryOptions: [{ name: '关于SHOWLOOK' }],
        tagOptions: [{ name: '综合问题' }]
      }
    )

    const locations = fields.map(field => field.loc)

    expect(locations).toContain('https://xiaolu.love')
    expect(locations).toContain('https://xiaolu.love/page/2')
    expect(locations).toContain('https://xiaolu.love/category/%E5%85%B3%E4%BA%8ESHOWLOOK')
    expect(locations).toContain('https://xiaolu.love/tag/%E7%BB%BC%E5%90%88%E9%97%AE%E9%A2%98')
    expect(locations).toContain('https://xiaolu.love/article/test-post')
    expect(locations).toContain('https://xiaolu.love/about')
    expect(locations).not.toContain('https://xiaolu.love/search')
    expect(locations).not.toContain('https://xiaolu.love/rss/feed.xml')
    expect(locations).not.toContain('https://external.example.com')
  })
})
