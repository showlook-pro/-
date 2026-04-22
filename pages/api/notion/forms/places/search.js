import { searchPlaces } from '@/lib/notion/forms'

const clampLimit = value => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return undefined
  }

  return Math.min(Math.max(Math.trunc(numericValue), 1), 8)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const query = String(req.query?.q || '').trim()

  if (query.length < 2) {
    res.status(200).json({ results: [] })
    return
  }

  try {
    const results = await searchPlaces(query, {
      limit: clampLimit(req.query?.limit)
    })

    res.status(200).json({ results })
  } catch (error) {
    console.error('[NotionForm] place search failed', error)
    res.status(502).json({
      message: '地址搜索暂时不可用，请稍后重试。',
      results: []
    })
  }
}
