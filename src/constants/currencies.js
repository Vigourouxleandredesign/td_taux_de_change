export const BASE_CURRENCY = 'XPF'
export const AMOUNT_DECIMALS = 3

export function roundAmount (value) {
  if (value == null || Number.isNaN(Number(value))) return null
  const factor = 10 ** AMOUNT_DECIMALS
  return Math.round(Number(value) * factor) / factor
}

export function formatAmountDisplay (value) {
  const rounded = roundAmount(value)
  if (rounded == null) return null
  return rounded.toLocaleString('fr-FR', {
    minimumFractionDigits: AMOUNT_DECIMALS,
    maximumFractionDigits: AMOUNT_DECIMALS
  })
}

/** Devises affichées ; flagCode = ISO 3166-1 alpha-2 pour flagcdn.com */
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

export const FLAG_SIZE = '56x42'
export const FLAG_CDN = 'https://flagcdn.com'

export function getFlagUrl (flagCode) {
  return `${FLAG_CDN}/${FLAG_SIZE}/${flagCode}.png`
}

export function getFlagSrcSet (flagCode) {
  return `${FLAG_CDN}/${FLAG_SIZE}/${flagCode}.png 1x, ${FLAG_CDN}/112x84/${flagCode}.png 2x`
}

export function pickCurrencyRates (conversionRates) {
  const codes = [BASE_CURRENCY, ...CURRENCIES.map((c) => c.code)]
  return codes.reduce((acc, code) => {
    const rate = conversionRates[code]
    if (rate != null) acc[code] = rate
    return acc
  }, {})
}

export function convertFromXpf (amount, targetCode, rates) {
  const value = Number(amount)
  if (!value || Number.isNaN(value)) return null
  if (targetCode === BASE_CURRENCY) return roundAmount(value)
  const rate = rates[targetCode]
  if (rate == null) return null
  return roundAmount(value * rate)
}

export function convertToXpf (amount, fromCode, rates) {
  return convertAmount(amount, fromCode, BASE_CURRENCY, rates)
}

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
  const result = to === BASE_CURRENCY ? amountInXpf : amountInXpf * rateTo
  return roundAmount(result)
}
