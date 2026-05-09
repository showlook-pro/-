describe('cache_manager', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.ENABLE_FILE_CACHE
    delete process.env.VERCEL
  })

  afterAll(() => {
    process.env = originalEnv
  })

  function loadCacheManager({
    blogConfig = {
      ENABLE_CACHE: true,
      REDIS_URL: '',
      isProd: true
    },
    memoryCache = {},
    fileCache = {},
    redisCache = {}
  } = {}) {
    const memoryCacheMock = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
      delCache: jest.fn().mockResolvedValue(undefined),
      ...memoryCache
    }
    const fileCacheMock = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
      delCache: jest.fn().mockResolvedValue(undefined),
      ...fileCache
    }
    const redisCacheMock = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
      delCache: jest.fn().mockResolvedValue(undefined),
      ...redisCache
    }

    jest.doMock('@/blog.config', () => blogConfig)
    jest.doMock('@/lib/cache/memory_cache', () => memoryCacheMock)
    jest.doMock('@/lib/cache/local_file_cache', () => fileCacheMock)
    jest.doMock('@/lib/cache/redis_cache', () => redisCacheMock)

    const cacheManager = require('@/lib/cache/cache_manager')

    return {
      cacheManager,
      memoryCacheMock,
      fileCacheMock,
      redisCacheMock
    }
  }

  it('deduplicates concurrent cache misses for the same key', async () => {
    const { cacheManager, memoryCacheMock } = loadCacheManager()

    let resolveFetch
    const getDataFunction = jest.fn(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve
        })
    )

    const requestA = cacheManager.getOrSetDataWithCache(
      'site_data_test',
      getDataFunction
    )
    const requestB = cacheManager.getOrSetDataWithCache(
      'site_data_test',
      getDataFunction
    )

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(getDataFunction).toHaveBeenCalledTimes(1)

    resolveFetch({ value: 1 })

    await expect(Promise.all([requestA, requestB])).resolves.toEqual([
      { value: 1 },
      { value: 1 }
    ])
    expect(memoryCacheMock.setCache).toHaveBeenCalledTimes(1)
  })

  it('writes to memory cache on production runtimes when cache is enabled', async () => {
    const { cacheManager, memoryCacheMock } = loadCacheManager()

    await cacheManager.setDataToCache('page_key', { ok: true })

    expect(memoryCacheMock.setCache).toHaveBeenCalledWith(
      'page_key',
      {
        ok: true
      },
      undefined
    )
  })

  it('does not write file cache on Vercel production runtimes', async () => {
    process.env.ENABLE_FILE_CACHE = 'true'
    process.env.VERCEL = '1'

    const { cacheManager, fileCacheMock } = loadCacheManager()

    await cacheManager.setDataToCache('page_key', { ok: true })

    expect(fileCacheMock.setCache).not.toHaveBeenCalled()
  })

  it('does not treat ENABLE_FILE_CACHE=false as a file cache backend', async () => {
    process.env.ENABLE_FILE_CACHE = 'false'

    const { cacheManager, memoryCacheMock, fileCacheMock } = loadCacheManager()

    await cacheManager.setDataToCache('page_key', { ok: true })

    expect(fileCacheMock.setCache).not.toHaveBeenCalled()
    expect(memoryCacheMock.setCache).toHaveBeenCalledWith(
      'page_key',
      {
        ok: true
      },
      undefined
    )
  })
})
