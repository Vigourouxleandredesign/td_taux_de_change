import { ref } from 'vue'
import { fetchLatestRates } from '@/services/exchangeRateApi'
import {
  BASE_CURRENCY,
  CURRENCIES,
  pickCurrencyRates
} from '@/constants/currencies'

export const REFRESH_INTERVAL_MS = 3_600_000

export function formatLastUpdate (utcString) {
  if (!utcString) return null
  const date = new Date(utcString)
  if (Number.isNaN(date.getTime())) return utcString
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function useExchangeRates () {
  const rates = ref({})
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)
  const nextRefreshAt = ref(null)

  let refreshIntervalId = null

  function updateNextRefreshTime () {
    nextRefreshAt.value = new Date(Date.now() + REFRESH_INTERVAL_MS)
  }

  async function loadRates () {
    loading.value = true
    error.value = null
    try {
      const data = await fetchLatestRates(BASE_CURRENCY)
      rates.value = pickCurrencyRates(data.conversion_rates)
      lastUpdate.value = data.time_last_update_utc ?? null
      updateNextRefreshTime()
    } catch (e) {
      error.value = e.message
      rates.value = {}
      lastUpdate.value = null
    } finally {
      loading.value = false
    }
  }

  function startAutoRefresh () {
    stopAutoRefresh()
    loadRates()
    refreshIntervalId = setInterval(loadRates, REFRESH_INTERVAL_MS)
  }

  function stopAutoRefresh () {
    if (refreshIntervalId != null) {
      clearInterval(refreshIntervalId)
      refreshIntervalId = null
    }
  }

  return {
    baseCurrency: BASE_CURRENCY,
    currencies: CURRENCIES,
    rates,
    loading,
    error,
    lastUpdate,
    nextRefreshAt,
    loadRates,
    startAutoRefresh,
    stopAutoRefresh
  }
}
