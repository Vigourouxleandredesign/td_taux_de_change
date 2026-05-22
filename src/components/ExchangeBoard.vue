<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  useExchangeRates,
  formatLastUpdate
} from '@/composables/useExchangeRates'
import {
  BASE_CURRENCY,
  CURRENCIES,
  convertFromXpf
} from '@/constants/currencies'
import CurrencyRow from '@/components/CurrencyRow.vue'

const {
  rates,
  loading,
  error,
  lastUpdate,
  nextRefreshAt,
  dataSource,
  startAutoRefresh,
  stopAutoRefresh
} = useExchangeRates()

// Montage : premier chargement + setInterval toutes les 3 600 000 ms (1 h)
onMounted(() => {
  startAutoRefresh()
})
onUnmounted(() => {
  stopAutoRefresh()
})

const xpfAmount = ref(1000)

const formattedLastUpdate = computed(() => formatLastUpdate(lastUpdate.value))

const formattedXpf = computed(() => {
  const value = Number(xpfAmount.value)
  if (!value || Number.isNaN(value)) return '0'
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
})

const formattedNextRefresh = computed(() => {
  if (!nextRefreshAt.value) return null
  return nextRefreshAt.value.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const leftCurrencies = computed(() =>
  CURRENCIES.filter((c) => c.column === 'left')
)

const rightCurrencies = computed(() =>
  CURRENCIES.filter((c) => c.column === 'right')
)

function formatAmount (code, raw) {
  if (raw == null) return null
  const opts =
    code === 'JPY' || code === 'VUV' || code === 'XPF'
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return Number(raw).toLocaleString('fr-FR', opts)
}

function getDisplayAmount (code) {
  if (loading.value || !Object.keys(rates.value).length) return null
  const raw = convertFromXpf(xpfAmount.value, code, rates.value)
  return formatAmount(code, raw)
}

function rowIndex (column, index) {
  return column === 'left' ? index : leftCurrencies.value.length + index
}
</script>

<template>
  <div class="board">
    <div class="board-bg-lines" aria-hidden="true" />

    <header class="board-header">
      <div class="xpf-input-block">
        <label for="xpf-amount" class="xpf-label">
          Montant à convertir (franc pacifique)
        </label>
        <div class="xpf-input-wrap">
          <input
            id="xpf-amount"
            v-model.number="xpfAmount"
            type="number"
            min="0"
            step="1"
            inputmode="decimal"
            class="xpf-input"
            :disabled="loading"
          >
          <span class="xpf-suffix">{{ BASE_CURRENCY }}</span>
        </div>
        <p class="xpf-hint">
          Saisissez le montant en {{ BASE_CURRENCY }} que le client souhaite changer.
        </p>
      </div>

      <div class="board-title">
        <h1 class="board-title__fr">Bureau de change</h1>
        <p class="board-title__en" lang="en">Exchange office</p>
      </div>
    </header>

    <p v-if="error" class="board-error">{{ error }}</p>

    <template v-else>
      <p class="board-legend">
        Pour
        <strong>{{ formattedXpf }} {{ BASE_CURRENCY }}</strong>,
        voici le montant que vous recevriez dans chaque devise&nbsp;:
      </p>

      <div class="board-columns">
        <div class="column">
          <div class="column-headers" aria-hidden="true">
            <span>Pays / devise</span>
            <span>Montant reçu</span>
          </div>
          <CurrencyRow
            v-for="(currency, i) in leftCurrencies"
            :key="currency.code"
            :currency="currency"
            :amount="getDisplayAmount(currency.code)"
            :index="rowIndex('left', i)"
            :loading="loading"
          />
        </div>
        <div class="column">
          <div class="column-headers" aria-hidden="true">
            <span>Pays / devise</span>
            <span>Montant reçu</span>
          </div>
          <CurrencyRow
            v-for="(currency, i) in rightCurrencies"
            :key="currency.code"
            :currency="currency"
            :amount="getDisplayAmount(currency.code)"
            :index="rowIndex('right', i)"
            :loading="loading"
          />
        </div>
      </div>
    </template>

    <footer class="board-footer">
      <p v-if="formattedLastUpdate" class="last-update">
        Dernière mise à jour : {{ formattedLastUpdate }}
      </p>
      <p v-if="formattedNextRefresh" class="auto-refresh">
        Prochaine actualisation automatique : {{ formattedNextRefresh }}
      </p>
      <p class="auto-refresh-hint">
        Les taux sont actualisés automatiquement toutes les heures.
      </p>
      <p v-if="dataSource === 'local'" class="dev-badge">
        Données locales (JSON) — mode développement, pas d'appel API
      </p>
    </footer>
  </div>
</template>

<style scoped src="./exchange-board.css"></style>
