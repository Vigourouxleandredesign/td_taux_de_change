const BASE_URL = 'https://v6.exchangerate-api.com/v6'
const LOCAL_RATES_PATH = 'data/latest-xpf.json'
const PROXY_PATH = '/.netlify/functions/rates'

const ERROR_MESSAGES = {
  'unsupported-code': 'Code devise non supporté.',
  'malformed-request': 'Requête invalide.',
  'invalid-key': 'Service de taux temporairement indisponible.',
  'inactive-account': 'Compte fournisseur inactif.',
  'quota-reached': 'Quota de requêtes atteint.',
  'missing-key': 'Configuration serveur incomplète.',
  'proxy-error': 'Impossible de récupérer les taux de change.'
}

export function shouldUseLocalRates () {
  const override = process.env.VUE_APP_USE_LOCAL_RATES
  if (override === 'true') return true
  if (override === 'false') return false
  return process.env.NODE_ENV === 'development'
}

function getApiKey () {
  const key = process.env.VUE_APP_EXCHANGE_RATE_API_KEY
  if (!key) {
    throw new Error('Clé API manquante pour les tests en local.')
  }
  return key
}

function useServerProxy () {
  return process.env.NODE_ENV === 'production'
}

async function requestApi (path) {
  const base = path.replace(/^\/latest\//, '').toUpperCase()

  const url = useServerProxy()
    ? `${PROXY_PATH}?base=${encodeURIComponent(base)}`
    : `${BASE_URL}/${getApiKey()}${path}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.result === 'error') {
    const type = data['error-type']
    const message = data.message
    throw new Error(
      ERROR_MESSAGES[type] ?? message ?? `Erreur : ${type}`
    )
  }

  return data
}

async function requestLocal (baseCode) {
  const code = baseCode.toUpperCase()
  if (code !== 'XPF') {
    throw new Error(`Fichier local disponible uniquement pour ${BASE_CURRENCY}.`)
  }

  const url = `${process.env.BASE_URL}${LOCAL_RATES_PATH}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Impossible de charger les taux (${LOCAL_RATES_PATH}).`)
  }

  const data = await response.json()

  if (data.result === 'error') {
    const type = data['error-type']
    throw new Error(ERROR_MESSAGES[type] ?? `Erreur : ${type}`)
  }

  return data
}

export function fetchLatestRates (baseCode) {
  const code = baseCode.toUpperCase()

  if (shouldUseLocalRates()) {
    return requestLocal(code)
  }

  return requestApi(`/latest/${code}`)
}
