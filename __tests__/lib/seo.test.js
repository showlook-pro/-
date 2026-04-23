import {
  buildCanonicalUrl,
  normalizeCanonicalPath,
  normalizeSiteUrl,
  toAbsoluteUrl,
  toDateOnly
} from '@/lib/seo'

describe('seo utilities', () => {
  it('normalizes site URLs and canonical paths', () => {
    expect(normalizeSiteUrl('xiaolu.love/')).toBe('https://xiaolu.love')
    expect(normalizeSiteUrl('https://www.xiaolu.love/')).toBe(
      'https://www.xiaolu.love'
    )
    expect(normalizeSiteUrl('http://xiaolu.love')).toBe('https://xiaolu.love')
    expect(normalizeSiteUrl('http://localhost:3000')).toBe(
      'http://localhost:3000'
    )
    expect(normalizeCanonicalPath('/article/test/?utm=1#top')).toBe(
      'article/test'
    )
  })

  it('builds stable canonical URLs', () => {
    expect(buildCanonicalUrl('https://www.xiaolu.love/', '/OA/')).toBe(
      'https://www.xiaolu.love/OA'
    )
    expect(
      buildCanonicalUrl('https://www.xiaolu.love', 'https://other.test/a?x=1')
    ).toBe('https://other.test/a')
  })

  it('converts relative assets to absolute URLs', () => {
    expect(toAbsoluteUrl('/images/hero-image.png', 'https://www.xiaolu.love/')).toBe(
      'https://www.xiaolu.love/images/hero-image.png'
    )
    expect(toAbsoluteUrl('//cdn.example.com/a.jpg', 'https://xiaolu.love')).toBe(
      'https://cdn.example.com/a.jpg'
    )
  })

  it('normalizes sitemap dates safely', () => {
    expect(toDateOnly('2026-04-23T03:00:00.000Z')).toBe('2026-04-23')
    expect(toDateOnly(null, '2026-04-22')).toBe('2026-04-22')
  })
})
