const ERROR_PAGE_ROUTES = new Set(['/404', '/_error'])

const NOTION_CONTENT_ROUTES = new Set([
  '/[prefix]',
  '/[prefix]/[slug]',
  '/[prefix]/[slug]/[...suffix]',
  '/dashboard/[[...index]]'
])

/**
 * Centralizes page-state detection for global plugins. Error and unresolved
 * content pages should not attach interaction overlays such as custom menus.
 */
export function isErrorPageRoute({ router = {}, pageProps = {} } = {}) {
  const route = router?.route || router?.pathname
  const pathname = router?.pathname
  const statusCode = Number(pageProps?.statusCode)

  if (pageProps?.isNotFoundPage || router?.isFallback) {
    return true
  }

  if (Number.isFinite(statusCode) && statusCode >= 400) {
    return true
  }

  if (ERROR_PAGE_ROUTES.has(route) || ERROR_PAGE_ROUTES.has(pathname)) {
    return true
  }

  return NOTION_CONTENT_ROUTES.has(route) && pageProps?.post === null
}
