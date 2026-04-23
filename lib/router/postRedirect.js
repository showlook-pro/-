/**
 * Resolve a post redirect target while preventing client-side self-redirect
 * loops on the current page.
 */
export function resolvePostRedirectTarget({
  redirectBaseUrl,
  asPath,
  currentHref
} = {}) {
  if (!redirectBaseUrl || !asPath || !currentHref) {
    return null
  }

  try {
    const currentUrl = new URL(asPath, currentHref)
    currentUrl.searchParams.delete('theme')

    const targetPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    const targetUrl = new URL(targetPath, redirectBaseUrl)

    if (targetUrl.href === currentUrl.href) {
      return null
    }

    return targetUrl.toString()
  } catch (error) {
    return null
  }
}
