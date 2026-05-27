<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  useExchangeRates,
  formatLastUpdate
} from '@/composables/useExchangeRates'
import {
  BASE_CURRENCY,
  CURRENCIES,
  convertFromXpf,
  convertToXpf,
  formatAmountDisplay,
  roundAmount
} from '@/constants/currencies'
import CurrencyRow from '@/components/CurrencyRow.vue'

const {
  rates,
  loading,
  error,
  lastUpdate,
  nextRefreshAt,
  startAutoRefresh,
  stopAutoRefresh
} = useExchangeRates()

onMounted(() => {
  startAutoRefresh()
})
onUnmounted(() => {
  stopAutoRefresh()
})

const xpfAmount = ref(1000)

const formattedLastUpdate = computed(() => formatLastUpdate(lastUpdate.value))

const formattedXpf = computed(() => formatAmountDisplay(xpfAmount.value) ?? '0,000')

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

function getRawAmount (code) {
  if (loading.value || !Object.keys(rates.value).length) return null
  return convertFromXpf(xpfAmount.value, code, rates.value)
}

function onForeignAmountChange (code, foreignAmount) {
  if (code === BASE_CURRENCY) return
  const xpf = convertToXpf(foreignAmount, code, rates.value)
  if (xpf == null) return
  xpfAmount.value = roundAmount(xpf) ?? 0
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
            step="0.001"
            inputmode="decimal"
            class="xpf-input"
            :disabled="loading"
          >
          <span class="xpf-suffix">{{ BASE_CURRENCY }}</span>
        </div>
        <p class="xpf-hint">
          Saisissez un montant en {{ BASE_CURRENCY }} ou modifiez un montant reçu dans le tableau pour recalculer en franc pacifique.
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
        voici le montant que vous recevriez dans chaque devise (cliquez une valeur pour la modifier)&nbsp;:
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
            :model-value="getRawAmount(currency.code)"
            :loading="loading"
            :index="rowIndex('left', i)"
            @update:model-value="onForeignAmountChange(currency.code, $event)"
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
            :model-value="getRawAmount(currency.code)"
            :loading="loading"
            :index="rowIndex('right', i)"
            @update:model-value="onForeignAmountChange(currency.code, $event)"
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
    </footer>
  </div>
</template>

<style scoped src="./exchange-board.css"></style>
