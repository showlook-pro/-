const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i

export const normalizeSiteUrl = siteUrl => {
  const rawUrl = String(siteUrl || 'https://xiaolu.love').trim()
  const urlWithProtocol = ABSOLUTE_URL_PATTERN.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`

  try {
    const parsedUrl = new URL(urlWithProtocol)
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(
      parsedUrl.hostname
    )

    if (parsedUrl.protocol === 'http:' && !isLocalHost) {
      parsedUrl.protocol = 'https:'
    }

    return parsedUrl.toString().replace(/\/+$/, '')
  } catch {
    return urlWithProtocol.replace(/\/+$/, '')
  }
}

export const normalizeCanonicalPath = path => {
  if (path === undefined || path === null) {
    return ''
  }

  const rawPath = String(path).trim()
  if (!rawPath || rawPath === '/') {
    return ''
  }

  if (ABSOLUTE_URL_PATTERN.test(rawPath)) {
    return rawPath.split('#')[0].split('?')[0].replace(/\/+$/, '')
  }

  return rawPath
    .split('#')[0]
    .split('?')[0]
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

export const buildCanonicalUrl = (siteUrl, path = '') => {
  const normalizedPath = normalizeCanonicalPath(path)

  if (ABSOLUTE_URL_PATTERN.test(normalizedPath)) {
    return normalizedPath
  }

  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  return normalizedPath ? `${normalizedSiteUrl}/${normalizedPath}` : normalizedSiteUrl
}

export const toAbsoluteUrl = (url, siteUrl) => {
  if (!url) {
    return ''
  }

  const rawUrl = String(url).trim()
  if (rawUrl.startsWith('//')) {
    return `https:${rawUrl}`
  }

  if (ABSOLUTE_URL_PATTERN.test(rawUrl)) {
    return rawUrl
  }

  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return ''
  }

  return `${normalizeSiteUrl(siteUrl)}/${rawUrl.replace(/^\/+/, '')}`
}

export const toIsoDate = (...dates) => {
  for (const date of dates) {
    if (!date) {
      continue
    }

    const parsedDate = new Date(date)
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString()
    }
  }

  return new Date().toISOString()
}

export const toDateOnly = (...dates) => toIsoDate(...dates).split('T')[0]
