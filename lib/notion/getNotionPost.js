import BLOG from '@/blog.config'
import { getTextContent, idToUuid } from 'notion-utils'
import { defaultMapImageUrl } from 'react-notion-x'
import formatDate from '../utils/formatDate'
import { getPage } from './getPostBlocks'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import md5 from 'js-md5'
import notionAPI from './getNotionAPI'
import { hasShowPagePropertiesField } from './pageProperties'

/**
 * 根据页面ID获取内容
 * @param {*} pageId
 * @param {Array} allPages
 * @returns
 */
export async function getPost(pageId, allPages = []) {
  const blockMap = await getPage(pageId, 'slug')
  if (!blockMap) {
    return null
  }
  if (checkStrIsNotionId(pageId)) {
    pageId = idToUuid(pageId)
  }
  if (!checkStrIsUuid(pageId)) {
    return null
  }
  const postInfo = blockMap?.block?.[pageId]?.value
  if (!postInfo) {
    return null
  }
  let sourcePostInfo = postInfo
  let sourceRecordMap = blockMap

  // getPage 会脱敏移除页面 properties；这里补抓一次原始数据用于读取 unlock_scope/password
  if (!postInfo?.properties) {
    try {
      const rawRecordMap = await notionAPI.getPage(pageId)
      const rawPostInfo = rawRecordMap?.block?.[pageId]?.value
      if (rawPostInfo) {
        sourcePostInfo = rawPostInfo
        sourceRecordMap = rawRecordMap
      }
    } catch (error) {
      console.warn('[getPost] read raw page properties failed:', pageId)
    }
  }

  const rawProperties = extractRawProperties(sourcePostInfo, sourceRecordMap)
  const mappedProperties = mapFieldNames(rawProperties)
  const sourceSchema =
    sourceRecordMap?.collection?.[sourcePostInfo?.parent_id]?.value?.schema || {}

  const slug = normalizeString(mappedProperties.slug) || pageId
  const unlockScope = normalizeString(mappedProperties.unlock_scope)
  const ownPassword = normalizeString(mappedProperties.password)

  const scopeParent = resolveScopeParent(allPages, unlockScope)
  const scopeParentSlug = normalizeString(scopeParent?.slug)
  const scopeParentSalt =
    normalizeString(scopeParent?.password_salt) || scopeParentSlug

  const isScopeChild =
    normalizeScopeValue(unlockScope) &&
    normalizeScopeValue(unlockScope) !== normalizeScopeValue(slug)

  let password = ''
  let passwordSalt = slug
  let scopeShareEnabled = false

  if (ownPassword) {
    password = md5(passwordSalt + ownPassword)
    scopeShareEnabled = Boolean(unlockScope) && !isScopeChild
  } else if (scopeParent?.password && scopeParentSalt) {
    // 子页未单独设置密码时，继承父页密码（沿用父页的加密盐）
    password = scopeParent.password
    passwordSalt = scopeParentSalt
    scopeShareEnabled = Boolean(unlockScope)
  }

  const fallbackTitle = normalizeString(getTextContent(sourcePostInfo?.properties?.title))
  const title =
    normalizeString(mappedProperties.title) || fallbackTitle || scopeParent?.title || null
  const summary = normalizeString(mappedProperties.summary) || scopeParent?.summary || ''
  const tags = parseTagList(mappedProperties.tags, scopeParent?.tags)

  return {
    id: pageId,
    slug,
    type: postInfo.type,
    category: '',
    tags,
    summary,
    title,
    status: 'Published',
    show_page_properties: hasShowPagePropertiesField(sourceSchema),
    password,
    password_salt: passwordSalt,
    unlock_scope: unlockScope,
    scope_share_enabled: scopeShareEnabled,
    createdTime: formatDate(
      new Date(sourcePostInfo.created_time).toString(),
      BLOG.LANG
    ),
    lastEditedDay: formatDate(
      new Date(sourcePostInfo?.last_edited_time).toString(),
      BLOG.LANG
    ),
    fullWidth: sourcePostInfo?.format?.page_full_width ?? false,
    page_cover: getPageCover(sourcePostInfo) || BLOG.HOME_BANNER_IMAGE || null,
    date: {
      start_date: formatDate(
        new Date(sourcePostInfo?.last_edited_time).toString(),
        BLOG.LANG
      )
    },
    blockMap
  }
}

function extractRawProperties(postInfo, blockMap) {
  const pageProperties = postInfo?.properties || {}
  const schema =
    blockMap?.collection?.[postInfo?.parent_id]?.value?.schema || {}
  const properties = {}
  Object.entries(pageProperties).forEach(([propertyId, value]) => {
    const propertyName = schema?.[propertyId]?.name || propertyId
    properties[propertyName] = getTextContent(value)
  })
  return properties
}

function mapFieldNames(rawProperties) {
  const properties = { ...rawProperties }
  const fieldNames = BLOG.NOTION_PROPERTY_NAME || {}
  Object.keys(fieldNames).forEach(key => {
    const fieldName = fieldNames[key]
    if (fieldName && rawProperties[fieldName] !== undefined) {
      properties[key] = rawProperties[fieldName]
    } else if (rawProperties[key] !== undefined) {
      properties[key] = rawProperties[key]
    }
  })
  return properties
}

function normalizeString(value) {
  if (Array.isArray(value)) {
    return normalizeString(value[0])
  }
  if (value === undefined || value === null) {
    return ''
  }
  return String(value).trim()
}

function normalizeScopeValue(value) {
  return normalizeString(value).replace(/^\/+/, '').replace(/\.html$/, '')
}

function normalizeIdValue(value) {
  return normalizeString(value).replace(/-/g, '').toLowerCase()
}

function parseTagList(value, fallback = []) {
  const normalized = normalizeString(value)
  if (normalized) {
    return normalized
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  }
  if (Array.isArray(fallback) && fallback.length > 0) {
    return fallback
  }
  return []
}

function resolveScopeParent(allPages, unlockScope) {
  if (!Array.isArray(allPages) || allPages.length === 0) {
    return null
  }
  const scope = normalizeScopeValue(unlockScope)
  const scopeId = normalizeIdValue(scope)
  if (!scope) {
    return null
  }
  return (
    allPages.find(page => {
      const pageSlug = normalizeScopeValue(page?.slug)
      const pageId = normalizeIdValue(page?.id)
      return (
        page?.password &&
        ((pageSlug && pageSlug === scope) || (pageId && pageId === scopeId))
      )
    }) || null
  )
}

function getPageCover(postInfo) {
  const pageCover = postInfo.format?.page_cover
  if (pageCover) {
    if (pageCover.startsWith('/')) return BLOG.NOTION_HOST + pageCover
    if (pageCover.startsWith('http'))
      return defaultMapImageUrl(pageCover, postInfo)
  }
}
