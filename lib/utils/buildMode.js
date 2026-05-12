/**
 * 是否静态导出；或ISR动态站点
 */
function isExport() {
  return process.env.EXPORT === 'true'
}

function isBuildLifecycle() {
  return (
    process.env.npm_lifecycle_event === 'build' ||
    process.env.npm_lifecycle_event === 'export' ||
    process.env.EXPORT === 'true'
  )
}

module.exports = { isBuildLifecycle, isExport }
