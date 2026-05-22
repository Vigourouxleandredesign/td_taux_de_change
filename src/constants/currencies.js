/** Devise de référence pour le TD (franc pacifique). */
export const BASE_CURRENCY = 'XPF'

/** Nombre de décimales affichées et utilisées pour les arrondis */
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

/**
 * Liste des devises affichées dans le panneau (ordre et colonnes = visuel de référence du TD).
 *
 * Chaque entrée contient un `flagCode` : code ISO 3166-1 alpha-2 utilisé pour charger le drapeau.
 * Exemples :
 *   - `eu` → drapeau de l'Union européenne (devise EUR)
 *   - `pf` → Polynésie française (devise XPF / franc pacifique)
 *   - `us` → États-Unis (devise USD)
 *
 * Les drapeaux ne sont pas stockés dans le dépôt : ils sont chargés à l'exécution via getFlagUrl().
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

/*
 * ---------------------------------------------------------------------------
 * DRAPEAUX — Flagpedia (documentation) + CDN flagcdn.com (implémentation)
 * ---------------------------------------------------------------------------
 *
 * Le TD demande d'utiliser l'API Flagpedia pour les drapeaux :
 *   https://flagpedia.net/download/api
 *
 * Cette page documente l'intégration des images via le CDN officiel flagcdn.com,
 * avec des URLs du type :
 *   https://flagcdn.com/{largeur}x{hauteur}/{code}.png
 *
 * Pourquoi flagcdn.com et pas flagpedia.net/data/flags/... ?
 * - Une première version utilisait des URLs du type
 *     https://flagpedia.net/data/flags/w580/{code}.png
 * - Cela fonctionnait pour la plupart des pays, mais le code `eu` (Union européenne,
 *   nécessaire pour l'euro EUR) renvoyait une erreur 404.
 * - La documentation Flagpedia oriente vers flagcdn.com, qui expose bien tous les codes
 *   dont `eu`, ce qui garantit l'affichage des 13 drapeaux du tableau sans exception.
 *
 * Fichiers concernés :
 *   - ce fichier (construction des URLs)
 *   - src/components/CurrencyRow.vue (balise <img> qui consomme getFlagUrl)
 */

/** Format 4:3 recommandé par Flagpedia pour les icônes de drapeaux dans le tableau */
export const FLAG_SIZE = '56x42'

/** CDN documenté par Flagpedia — seule source utilisée pour tous les drapeaux */
export const FLAG_CDN = 'https://flagcdn.com'

/**
 * URL PNG du drapeau pour une ligne du tableau.
 * @param {string} flagCode - Code ISO 3166-1 alpha-2 (ex. "eu", "au", "pf")
 * @returns {string} Ex. https://flagcdn.com/56x42/eu.png
 */
export function getFlagUrl (flagCode) {
  return `${FLAG_CDN}/${FLAG_SIZE}/${flagCode}.png`
}

/**
 * Srcset pour écrans haute densité (retina) : version 1x + 2x sur le même CDN.
 * @param {string} flagCode - Code ISO 3166-1 alpha-2
 */
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
  if (targetCode === BASE_CURRENCY) return roundAmount(value)
  const rate = rates[targetCode]
  if (rate == null) return null
  return roundAmount(value * rate)
}

/**
 * Montant en XPF équivalent à partir d'une devise étrangère (conversion inverse).
 */
export function convertToXpf (amount, fromCode, rates) {
  return convertAmount(amount, fromCode, BASE_CURRENCY, rates)
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
  const result = to === BASE_CURRENCY ? amountInXpf : amountInXpf * rateTo
  return roundAmount(result)
}
