/** Devise de référence pour le TD (franc pacifique). */
export const BASE_CURRENCY = 'XPF'

/**
 * Devises du tableau — ordre et colonnes comme l'image de référence.
 * Drapeaux : API Flagpedia / flagcdn.com (https://flagpedia.net/download/api)
 * Code ISO 3166-1 alpha-2 (ex. eu = Union européenne, pf = Polynésie française)
 */
export const CURRENCIES = [
  { code: 'AUD', nameEn: 'AUSTRALIAN DOLLAR', nameFr: 'DOLLAR AUSTRALIEN', flagCode: 'au', column: 'left' },
  { code: 'CAD', nameEn: 'CANADIAN DOLLAR', nameFr: 'DOLLAR CANADIEN', flagCode: 'ca', column: 'left' },
  { code: 'CHF', nameEn: 'SWISS FRANC', nameFr: 'FRANC SUISSE', flagCode: 'ch', column: 'left' },
  { code: 'EUR', nameEn: 'EURO', nameFr: 'EURO', flagCode: 'eu', column: 'left' },
  { code: 'FJD', nameEn: 'FIJI DOLLAR', nameFr: 'DOLLAR FIDJIEN', flagCode: 'fj', column: 'left' },
  { code: 'GBP', nameEn: 'POUND STERLING', nameFr: 'LIVRE STERLING', flagCode: 'gb', column: 'left' },
  { code: 'JPY', nameEn: 'YEN', nameFr: 'YEN', flagCode: 'jp', column: 'left' },
  { code: 'NZD', nameEn: 'NEW ZEALAND DOLLAR', nameFr: 'DOLLAR NÉO-ZÉLANDAIS', flagCode: 'nz', column: 'right' },
  { code: 'SGD', nameEn: 'SINGAPORE DOLLAR', nameFr: 'DOLLAR DE SINGAPOUR', flagCode: 'sg', column: 'right' },
  { code: 'THB', nameEn: 'THAI BAHT', nameFr: 'BAHT THAÏLANDAIS', flagCode: 'th', column: 'right' },
  { code: 'USD', nameEn: 'US DOLLAR', nameFr: 'DOLLAR US', flagCode: 'us', column: 'right' },
  { code: 'VUV', nameEn: 'VANUATU VATU', nameFr: 'VATU', flagCode: 'vu', column: 'right' },
  { code: 'XPF', nameEn: 'CFP FRANC', nameFr: 'FRANC PACIFIQUE', flagCode: 'pf', column: 'right' }
]

/** Taille 4:3 recommandée par Flagpedia pour les icônes de drapeaux */
export const FLAG_SIZE = '56x42'
export const FLAG_CDN = 'https://flagcdn.com'

export function getFlagUrl (flagCode) {
  return `${FLAG_CDN}/${FLAG_SIZE}/${flagCode}.png`
}

/** Srcset pour écrans retina (2x) */
export function getFlagSrcSet (flagCode) {
  return `${FLAG_CDN}/${FLAG_SIZE}/${flagCode}.png 1x, ${FLAG_CDN}/112x84/${flagCode}.png 2x`
}

/**
 * Extrait les taux utiles depuis conversion_rates (réponse Standard).
 */
export function pickCurrencyRates (conversionRates) {
  const codes = [BASE_CURRENCY, ...CURRENCIES.map((c) => c.code)]
  return codes.reduce((acc, code) => {
    const rate = conversionRates[code]
    if (rate != null) acc[code] = rate
    return acc
  }, {})
}

/**
 * Montant converti depuis XPF vers une devise cible.
 */
export function convertFromXpf (amount, targetCode, rates) {
  const value = Number(amount)
  if (!value || Number.isNaN(value)) return null
  if (targetCode === BASE_CURRENCY) return value
  const rate = rates[targetCode]
  if (rate == null) return null
  return value * rate
}

/**
 * Convertit un montant entre deux devises à partir des taux (base = XPF).
 */
export function convertAmount (amount, fromCode, toCode, rates) {
  const value = Number(amount)
  if (!value || Number.isNaN(value)) return null

  const from = fromCode.toUpperCase()
  const to = toCode.toUpperCase()
  if (from === to) return value

  const rateFrom = rates[from]
  const rateTo = rates[to]
  if (rateFrom == null || rateTo == null) return null

  const amountInXpf = from === BASE_CURRENCY ? value : value / rateFrom
  return to === BASE_CURRENCY ? amountInXpf : amountInXpf * rateTo
}
