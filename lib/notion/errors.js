export function isNotionRateLimitError(error) {
  const status = error?.status || error?.response?.status
  const message = String(error?.message || error || '').toLowerCase()

  return (
    status === 429 ||
    message.includes('too many requests') ||
    message.includes('try again in a moment') ||
    message.includes('rate limit')
  )
}
