/**
 * 开发人员可能需要关注的配置
 */
const lifecycleEvent = process.env.npm_lifecycle_event
const isBuildLifecycle =
  lifecycleEvent === 'build' || lifecycleEvent === 'export'
const isDevelopmentRuntime = process.env.NODE_ENV === 'development'
const isProductionRuntime =
  process.env.VERCEL_ENV === 'production' || process.env.EXPORT
const hasExplicitCacheSetting = typeof process.env.ENABLE_CACHE !== 'undefined'

module.exports = {
  SUB_PATH: '', // leave this empty unless you want to deploy in a folder
  DEBUG: process.env.NEXT_PUBLIC_DEBUG || false, // 是否显示调试按钮
  // TAILWINDCSS 配置的自定义颜色，作废
  BACKGROUND_LIGHT: '#eeeeee', // use hex value, don't forget '#' e.g #fffefc
  BACKGROUND_DARK: '#000000', // use hex value, don't forget '#'

  // Redis 缓存数据库地址
  REDIS_URL: process.env.REDIS_URL || '',

  ENABLE_CACHE: hasExplicitCacheSetting
    ? process.env.ENABLE_CACHE
    : isBuildLifecycle || isDevelopmentRuntime, // 与上游 NotionNext 保持一致：生产运行时默认依赖 ISR，不读本地缓存，避免延长 Notion 更新可见时间。
  isProd: isProductionRuntime, // 与上游 NotionNext 保持一致：Vercel Production / Export 才走生产路径。
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true' || false, // 是否展示编译依赖内容与大小
  VERSION: (() => {
    try {
      // 优先使用环境变量，否则从package.json中获取版本号
      return (
        process.env.NEXT_PUBLIC_VERSION || require('../package.json').version
      )
    } catch (error) {
      console.warn('Failed to load package.json version:', error)
      return '1.0.0' // 缺省版本号
    }
  })()
}
