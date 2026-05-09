import cache from 'memory-cache'
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'

const runtimeRevalidateWindow = Number(
  siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND)
)
const cacheTime = BLOG.isProd
  ? Math.max(90, Math.trunc(runtimeRevalidateWindow * 1.5) || 90)
  : 120 * 60 // 开发期保留更长缓存，生产期与 ISR 更接近，避免刷新频繁回源 Notion。

export async function getCache(key, options) {
  return await cache.get(key)
}

export async function setCache(key, data, customCacheTime) {
  await cache.put(key, data, (customCacheTime || cacheTime) * 1000)
}

export async function delCache(key) {
  await cache.del(key)
}

export default { getCache, setCache, delCache }
