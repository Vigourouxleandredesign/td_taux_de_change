const BASE_URL = 'https://v6.exchangerate-api.com/v6'
const LOCAL_RATES_PATH = 'data/latest-xpf.json'

const ERROR_MESSAGES = {
  'unsupported-code': 'Code devise non supporté.',
  'malformed-request': 'Requête API invalide.',
  'invalid-key': 'Clé API invalide. Vérifiez VUE_APP_EXCHANGE_RATE_API_KEY dans .env.',
  'inactive-account': 'Compte inactif : confirmez votre e-mail sur ExchangeRate-API.',
  'quota-reached': 'Quota API atteint pour ce mois.'
}

/**
 * En développement : JSON local par défaut (0 appel API).
 * En production (Netlify) : API live.
 * Surcharge via VUE_APP_USE_LOCAL_RATES=true|false dans .env
 */
export function shouldUseLocalRates () {
  const override = process.env.VUE_APP_USE_LOCAL_RATES
  if (override === 'true') return true
  if (override === 'false') return false
  return process.env.NODE_ENV === 'development'
}

function getApiKey () {
  const key = process.env.VUE_APP_EXCHANGE_RATE_API_KEY
  if (!key) {
    throw new Error(
      'Clé API manquante. Ajoutez VUE_APP_EXCHANGE_RATE_API_KEY dans .env (ou activez le JSON local en dev).'
    )
  }
  return key
}

async function requestApi (path) {
  const url = `${BASE_URL}/${getApiKey()}${path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.result === 'error') {
    const type = data['error-type']
    throw new Error(ERROR_MESSAGES[type] ?? `Erreur API : ${type}`)
  }

  return data
}

async function requestLocal (baseCode) {
  const code = baseCode.toUpperCase()
  if (code !== 'XPF') {
    throw new Error(
      `JSON local disponible uniquement pour XPF (fichier ${LOCAL_RATES_PATH}).`
    )
  }

  const url = `${process.env.BASE_URL}${LOCAL_RATES_PATH}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Impossible de charger ${LOCAL_RATES_PATH}. Vérifiez que le fichier existe dans public/data/.`
    )
  }

  const data = await response.json()

  if (data.result === 'error') {
    const type = data['error-type']
    throw new Error(ERROR_MESSAGES[type] ?? `Erreur dans le JSON local : ${type}`)
  }

  return data
}

/**
 * Tous les taux depuis une devise de base (endpoint Standard).
 * Dev → public/data/latest-xpf.json | Prod → API ExchangeRate
 * @see https://www.exchangerate-api.com/docs/standard-requests
 */
export function fetchLatestRates (baseCode) {
  const code = baseCode.toUpperCase()

  if (shouldUseLocalRates()) {
    return requestLocal(code)
  }

  return requestApi(`/latest/${code}`)
}

export function getRatesDataSource () {
  return shouldUseLocalRates() ? 'local' : 'api'
}
