import { isErrorPageRoute } from '@/lib/router/pageStatus'

describe('isErrorPageRoute', () => {
  it('detects the custom 404 page from page props', () => {
    expect(
      isErrorPageRoute({
        router: { route: '/404', pathname: '/404' },
        pageProps: { isNotFoundPage: true }
      })
    ).toBe(true)
  })

  it('detects framework error routes and status codes', () => {
    expect(
      isErrorPageRoute({
        router: { route: '/_error', pathname: '/_error' },
        pageProps: { statusCode: 500 }
      })
    ).toBe(true)
  })

  it('detects unresolved notion content pages', () => {
    expect(
      isErrorPageRoute({
        router: { route: '/[prefix]', pathname: '/[prefix]' },
        pageProps: { post: null }
      })
    ).toBe(true)
  })

  it('does not flag normal content pages', () => {
    expect(
      isErrorPageRoute({
        router: { route: '/[prefix]', pathname: '/[prefix]' },
        pageProps: { post: { id: 'post-id' } }
      })
    ).toBe(false)
  })
})
