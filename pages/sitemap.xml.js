// pages/sitemap.xml.js
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'
import { buildCanonicalUrl, normalizeSiteUrl, toDateOnly } from '@/lib/seo'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { getServerSideSitemap } from 'next-sitemap'

export const getServerSideProps = async ctx => {
  let fields = []
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)
    // 第一个id站点默认语言
    const siteData = await getGlobalData({
      pageId: id,
      from: 'sitemap.xml'
    })
    const link = siteConfig(
      'SEO_CANONICAL_LINK',
      siteConfig('LINK', siteData?.siteInfo?.link, siteData.NOTION_CONFIG),
      siteData.NOTION_CONFIG
    )
    const localeFields = generateLocalesSitemap(link, siteData.allPages, locale, {
      categoryOptions: siteData.categoryOptions,
      tagOptions: siteData.tagOptions,
      notionConfig: siteData.NOTION_CONFIG
    })
    fields = fields.concat(localeFields)
  }

  fields = getUniqueFields(fields)

  // 缓存
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  return getServerSideSitemap(ctx, fields)
}

export function generateLocalesSitemap(link, allPages, locale, options = {}) {
  const siteUrl = normalizeSiteUrl(link)
  const localePath = normalizeLocalePath(locale)
  const dateNow = new Date().toISOString().split('T')[0]
  const defaultFields = [
    {
      loc: buildLocalizedUrl(siteUrl, localePath),
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: buildLocalizedUrl(siteUrl, localePath, 'archive'),
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      loc: buildLocalizedUrl(siteUrl, localePath, 'category'),
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      loc: buildLocalizedUrl(siteUrl, localePath, 'tag'),
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.7'
    }
  ]

  const publishedPosts =
    allPages?.filter(post => isSitemapPage(post) && post.type === 'Post') ?? []

  const postsPerPage = Math.max(
    Number(
      siteConfig(
        'POSTS_PER_PAGE',
        BLOG.POSTS_PER_PAGE,
        options.notionConfig
      )
    ) || 12,
    1
  )
  const paginatedFields = Array.from(
    {
      length: Math.max(Math.ceil(publishedPosts.length / postsPerPage) - 1, 0)
    },
    (_, index) => ({
      loc: buildLocalizedUrl(siteUrl, localePath, `page/${index + 2}`),
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    })
  )

  const categoryFields = buildTaxonomyFields({
    siteUrl,
    localePath,
    taxonomyPath: 'category',
    options: options.categoryOptions,
    dateNow
  })

  const tagFields = buildTaxonomyFields({
    siteUrl,
    localePath,
    taxonomyPath: 'tag',
    options: options.tagOptions,
    dateNow
  })

  const postFields =
    allPages
      ?.filter(isSitemapPage)
      ?.map(post => {
        const slugWithoutLeadingSlash = normalizeSitemapPath(post.slug)
        return {
          loc: buildLocalizedUrl(siteUrl, localePath, slugWithoutLeadingSlash),
          lastmod: toDateOnly(
            post?.lastEditedDay,
            post?.lastEditedDate,
            post?.publishDay,
            post?.date?.start_date
          ),
          changefreq: post.type === 'Post' ? 'weekly' : 'monthly',
          priority: post.type === 'Post' ? '0.8' : '0.7'
        }
      }) ?? []

  return defaultFields.concat(
    paginatedFields,
    categoryFields,
    tagFields,
    postFields
  )
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map()

  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc)

    if (!existingField || new Date(field.lastmod) > new Date(existingField.lastmod)) {
      uniqueFieldsMap.set(field.loc, field)
    }
  })

  return Array.from(uniqueFieldsMap.values())
}

function normalizeLocalePath(locale) {
  return String(locale || '').replace(/^\/+|\/+$/g, '')
}

function normalizeSitemapPath(path) {
  return String(path || '').replace(/^\/+|\/+$/g, '')
}

function buildLocalizedUrl(siteUrl, localePath, path = '') {
  const normalizedPath = [localePath, normalizeSitemapPath(path)]
    .filter(Boolean)
    .join('/')

  return buildCanonicalUrl(siteUrl, normalizedPath)
}

function isSitemapPage(post) {
  const slug = normalizeSitemapPath(post?.slug)

  return (
    post?.status === BLOG.NOTION_PROPERTY_NAME.status_publish &&
    slug &&
    !/^https?:\/\//i.test(slug)
  )
}

function buildTaxonomyFields({
  siteUrl,
  localePath,
  taxonomyPath,
  options = [],
  dateNow
}) {
  return options
    .filter(option => option?.name)
    .map(option => ({
      loc: buildLocalizedUrl(
        siteUrl,
        localePath,
        `${taxonomyPath}/${encodeURIComponent(option.name)}`
      ),
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    }))
}

const SitemapXmlPage = () => {}

export default SitemapXmlPage
