import BLOG from '@/blog.config'

const NOTION_API_BASE_URL = BLOG.API_BASE_URL || 'https://www.notion.so/api/v3'

const parseNotionResponse = async response => {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Invalid Notion response: ${text.slice(0, 200)}`)
  }
}

const buildHeaders = ({ requireAuth = false, headers = {} } = {}) => {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (requireAuth && BLOG.NOTION_TOKEN_V2) {
    finalHeaders.cookie = `token_v2=${BLOG.NOTION_TOKEN_V2}`
  }

  if (requireAuth && BLOG.NOTION_ACTIVE_USER) {
    finalHeaders['x-notion-active-user-header'] = BLOG.NOTION_ACTIVE_USER
  }

  return finalHeaders
}

export const buildSyncRecordRequest = (id, table = 'block', version = -1) => ({
  table,
  id,
  version
})

export async function requestNotion(
  endpoint,
  { body = {}, headers = {}, requireAuth = false } = {}
) {
  const response = await fetch(`${NOTION_API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: buildHeaders({ requireAuth, headers }),
    body: JSON.stringify(body)
  })

  const data = await parseNotionResponse(response)

  if (!response.ok) {
    throw new Error(
      data?.debugMessage || data?.message || `Notion request failed: ${response.status}`
    )
  }

  return data
}

export async function syncRecordValues(
  requests,
  { requireAuth = false, headers = {} } = {}
) {
  return requestNotion('syncRecordValuesMain', {
    body: { requests },
    headers,
    requireAuth
  })
}

export async function submitTransaction(operations) {
  if (!BLOG.NOTION_TOKEN_V2) {
    throw new Error('NOTION_TOKEN_V2 is not configured')
  }

  return requestNotion('submitTransaction', {
    body: { operations },
    requireAuth: true
  })
}

export default requestNotion
