describe('conf/dev.config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.ENABLE_CACHE
    delete process.env.VERCEL_ENV
    delete process.env.BUILD_MODE
    delete process.env.EXPORT
    delete process.env.npm_lifecycle_event
    delete process.env.NODE_ENV
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('enables cache by default in production runtime', () => {
    process.env.NODE_ENV = 'production'

    const config = require('../../conf/dev.config')

    expect(config.isProd).toBe(true)
    expect(config.ENABLE_CACHE).toBe(true)
  })

  it('keeps an explicit cache override when provided', () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_CACHE = 'false'

    const config = require('../../conf/dev.config')

    expect(config.ENABLE_CACHE).toBe('false')
  })
})
