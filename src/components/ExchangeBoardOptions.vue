<template>
  <div class="board">
    <div class="board-bg-lines" aria-hidden="true" />

    <header class="board-header">
      <div class="xpf-input-block">
        <label for="xpf-amount-options" class="xpf-label">
          Montant à convertir (franc pacifique)
        </label>
        <div class="xpf-input-wrap">
          <input
            id="xpf-amount-options"
            v-model.number="xpfAmount"
            type="number"
            min="0"
            step="0.001"
            inputmode="decimal"
            class="xpf-input"
            :disabled="loading"
          >
          <span class="xpf-suffix">{{ baseCurrency }}</span>
        </div>
        <p class="xpf-hint">
          Saisissez un montant en {{ baseCurrency }} ou modifiez un montant reçu dans le tableau pour recalculer en franc pacifique.
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
        <strong>{{ formattedXpf }} {{ baseCurrency }}</strong>,
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
      <p v-if="dataSource === 'local'" class="dev-badge">
        Données locales (JSON) — mode développement, pas d'appel API
      </p>
      <p v-else-if="dataSource === 'proxy'" class="dev-badge dev-badge--proxy">
        Taux via proxy Netlify (clé API non exposée, cache serveur 1 h)
      </p>
    </footer>
  </div>
</template>

<script>
import { fetchLatestRates, getRatesDataSource } from '@/services/exchangeRateApi'
import {
  BASE_CURRENCY,
  CURRENCIES,
  convertFromXpf,
  convertToXpf,
  formatAmountDisplay,
  pickCurrencyRates,
  roundAmount
} from '@/constants/currencies'
import {
  REFRESH_INTERVAL_MS,
  formatLastUpdate
} from '@/composables/useExchangeRates'
import CurrencyRow from '@/components/CurrencyRow.vue'

export default {
  name: 'ExchangeBoardOptions',
  components: {
    CurrencyRow
  },
  data () {
    return {
      baseCurrency: BASE_CURRENCY,
      xpfAmount: 1000,
      rates: {},
      loading: false,
      error: null,
      lastUpdate: null,
      nextRefreshAt: null,
      dataSource: getRatesDataSource(),
      refreshIntervalId: null
    }
  },
  computed: {
    formattedXpf () {
      return formatAmountDisplay(this.xpfAmount) ?? '0,000'
    },
    leftCurrencies () {
      return CURRENCIES.filter((c) => c.column === 'left')
    },
    rightCurrencies () {
      return CURRENCIES.filter((c) => c.column === 'right')
    },
    formattedNextRefresh () {
      if (!this.nextRefreshAt) return null
      return this.nextRefreshAt.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formattedLastUpdate () {
      return formatLastUpdate(this.lastUpdate)
    }
  },
  mounted () {
    // Premier appel API au montage, puis setInterval toutes les 3 600 000 ms
    this.startAutoRefresh()
  },
  beforeUnmount () {
    this.stopAutoRefresh()
  },
  methods: {
    updateNextRefreshTime () {
      this.nextRefreshAt = new Date(Date.now() + REFRESH_INTERVAL_MS)
    },
    async loadRates () {
      this.loading = true
      this.error = null
      try {
        this.dataSource = getRatesDataSource()
        const data = await fetchLatestRates(BASE_CURRENCY)
        this.rates = pickCurrencyRates(data.conversion_rates)
        this.lastUpdate = data.time_last_update_utc ?? null
        this.updateNextRefreshTime()
      } catch (e) {
        this.error = e.message
        this.rates = {}
        this.lastUpdate = null
      } finally {
        this.loading = false
      }
    },
    startAutoRefresh () {
      this.stopAutoRefresh()
      this.loadRates()
      this.refreshIntervalId = setInterval(
        this.loadRates,
        REFRESH_INTERVAL_MS // 3 600 000 ms = 1 heure
      )
    },
    stopAutoRefresh () {
      if (this.refreshIntervalId != null) {
        clearInterval(this.refreshIntervalId)
        this.refreshIntervalId = null
      }
    },
    getRawAmount (code) {
      if (this.loading || !Object.keys(this.rates).length) return null
      return convertFromXpf(this.xpfAmount, code, this.rates)
    },
    onForeignAmountChange (code, foreignAmount) {
      if (code === BASE_CURRENCY) return
      const xpf = convertToXpf(foreignAmount, code, this.rates)
      if (xpf == null) return
      this.xpfAmount = roundAmount(xpf) ?? 0
    },
    rowIndex (column, index) {
      return column === 'left' ? index : this.leftCurrencies.length + index
    }
  }
}
</script>

<style scoped src="./exchange-board.css"></style>
