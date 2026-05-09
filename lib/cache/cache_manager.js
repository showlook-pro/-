import BLOG from '@/blog.config'
import FileCache from './local_file_cache'
import MemoryCache from './memory_cache'
import RedisCache from './redis_cache'

const inflightCacheReads = new Map()

function isCacheEnabled(force = false) {
  if (force) {
    return true
  }

  const flag = BLOG.ENABLE_CACHE
  if (flag === true || flag === 'true') {
    return true
  }

  if (
    flag === false ||
    flag === 'false' ||
    flag === null ||
    flag === undefined
  ) {
    return false
  }

  try {
    return Boolean(JSON.parse(String(flag)))
  } catch {
    return Boolean(flag)
  }
}

function isFileCacheBackend() {
  return isFileCacheEnabled() && !BLOG.REDIS_URL
}

function isFileCacheEnabled() {
  return process.env.ENABLE_FILE_CACHE === 'true'
}

function canWriteCache() {
  if (BLOG.REDIS_URL) {
    return true
  }

  if (isFileCacheBackend()) {
    return !process.env.VERCEL && !BLOG.isProd
  }

  // Vercel 的内存缓存虽然不是持久化缓存，但对热实例和并发去重仍然有实际价值。
  return true
}

/**
 * 尝试从缓存中获取数据，如果没有则尝试获取数据并写入缓存，最终返回所需数据
 * @param key
 * @param getDataFunction
 * @param getDataArgs
 * @returns {Promise<*|null>}
 */
export async function getOrSetDataWithCache(
  key,
  getDataFunction,
  ...getDataArgs
) {
  return getOrSetDataWithCustomCache(key, null, getDataFunction, ...getDataArgs)
}

/**
 * 尝试从缓存中获取数据，如果没有则尝试获取数据并自定义写入缓存，最终返回所需数据
 * @param key
 * @param customCacheTime
 * @param getDataFunction
 * @param getDataArgs
 * @returns {Promise<*|null>}
 */
export async function getOrSetDataWithCustomCache(
  key,
  customCacheTime,
  getDataFunction,
  ...getDataArgs
) {
  if (inflightCacheReads.has(key)) {
    return inflightCacheReads.get(key)
  }

  const inflightPromise = (async () => {
    const dataFromCache = await getDataFromCache(key)
    if (dataFromCache) {
      // console.log('[缓存-->>API]:', key) // 避免过多的缓存日志输出
      return dataFromCache
    }

    const data = await getDataFunction(...getDataArgs)
    if (data) {
      // console.log('[API-->>缓存]:', key)
      await setDataToCache(key, data, customCacheTime)
    }
    return data || null
  })()

  inflightCacheReads.set(key, inflightPromise)

  try {
    return await inflightPromise
  } finally {
    inflightCacheReads.delete(key)
  }
}

/**
 * 为减少频繁接口请求，notion数据将被缓存
 * @param {*} key
 * @returns
 */
export async function getDataFromCache(key, force) {
  if (isCacheEnabled(force)) {
    const dataFromCache = await getApi().getCache(key)
    if (!dataFromCache || JSON.stringify(dataFromCache) === '[]') {
      return null
    }
    // console.trace('[API-->>缓存]:', key, dataFromCache)
    return dataFromCache
  } else {
    return null
  }
}

/**
 * 写入缓存
 * @param {*} key
 * @param {*} data
 * @param {*} customCacheTime
 * @returns
 */
export async function setDataToCache(key, data, customCacheTime) {
  if (!isCacheEnabled() || !canWriteCache() || !data) {
    return
  }
  //   console.trace('[API-->>缓存写入]:', key)
  await getApi().setCache(key, data, customCacheTime)
}

export async function delCacheData(key) {
  if (!isCacheEnabled()) {
    return
  }
  await getApi().delCache(key)
}

/**
 * 缓存实现类
 * @returns
 */
export function getApi() {
  if (BLOG.REDIS_URL) {
    return RedisCache
  } else if (isFileCacheEnabled()) {
    return FileCache
  } else {
    return MemoryCache
  }
}
