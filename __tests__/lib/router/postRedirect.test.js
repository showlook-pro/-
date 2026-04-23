import { resolvePostRedirectTarget } from '@/lib/router/postRedirect'

describe('resolvePostRedirectTarget', () => {
  it('returns null for self redirects on the current URL', () => {
    expect(
      resolvePostRedirectTarget({
        redirectBaseUrl: 'https://xiaolu.love',
        asPath: '/article/not-a-real-post',
        currentHref: 'https://xiaolu.love/article/not-a-real-post'
      })
    ).toBeNull()
  })

  it('strips the theme query and preserves cross-site redirects', () => {
    expect(
      resolvePostRedirectTarget({
        redirectBaseUrl: 'https://showlook.pro',
        asPath: '/article/fp01?theme=proxio',
        currentHref: 'https://xiaolu.love/article/fp01?theme=proxio'
      })
    ).toBe('https://showlook.pro/article/fp01')
  })
})
