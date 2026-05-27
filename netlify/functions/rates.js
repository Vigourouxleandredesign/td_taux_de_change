const CACHE_TTL_MS = 3_600_000

/** @type {{ base: string, data: object, expiresAt: number } | null} */
let cache = null

exports.handler = async (event) => {
  const base = (event.queryStringParameters?.base || 'XPF').toUpperCase()
  const apiKey = process.env.EXCHANGE_RATE_API_KEY

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: 'error',
        'error-type': 'missing-key'
      })
    }
  }

  const now = Date.now()
  if (cache && cache.base === base && now < cache.expiresAt) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'HIT'
      },
      body: JSON.stringify(cache.data)
    }
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok || data.result === 'error') {
      return {
        statusCode: response.ok ? 400 : response.status,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
        body: JSON.stringify(data)
      }
    }

    cache = { base, data, expiresAt: now + CACHE_TTL_MS }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS'
      },
      body: JSON.stringify(data)
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: 'error',
        'error-type': 'proxy-error',
        message: err.message
      })
    }
  }
}
