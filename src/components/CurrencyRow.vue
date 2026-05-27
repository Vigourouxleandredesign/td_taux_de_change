<script setup>
import { computed } from 'vue'
import {
  BASE_CURRENCY,
  AMOUNT_DECIMALS,
  formatAmountDisplay,
  getFlagUrl,
  getFlagSrcSet
} from '@/constants/currencies'

const props = defineProps({
  currency: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Number,
    default: null
  },
  index: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const flagUrl = computed(() => getFlagUrl(props.currency.flagCode))
const flagSrcSet = computed(() => getFlagSrcSet(props.currency.flagCode))

const animationDelay = computed(() => `${props.index * 0.07}s`)

const isBaseCurrency = computed(
  () => props.currency.code === BASE_CURRENCY
)

const isEditable = computed(() => !isBaseCurrency.value)

const amountLabel = computed(() =>
  isBaseCurrency.value ? 'Montant saisi' : 'Montant reçu'
)

const inputStep = computed(() => {
  const step = 10 ** -AMOUNT_DECIMALS
  return String(step)
})

const formattedAmount = computed(() => formatAmountDisplay(props.modelValue))

function onAmountInput (event) {
  const raw = event.target.value
  if (raw === '' || raw == null) {
    emit('update:modelValue', 0)
    return
  }
  const value = Number(raw)
  emit('update:modelValue', Number.isNaN(value) ? 0 : value)
}
</script>

<template>
  <article
    class="currency-row"
    :class="{ 'currency-row--editable': isEditable }"
    :style="{ animationDelay }"
  >
    <img
      :src="flagUrl"
      :srcset="flagSrcSet"
      :alt="`Drapeau ${currency.nameFr}`"
      class="flag"
      width="56"
      height="42"
      loading="lazy"
    >
    <div class="names">
      <span class="name-en">{{ currency.nameEn }}</span>
      <span class="name-fr">{{ currency.nameFr }}</span>
    </div>
    <div
      class="amount-block"
      :aria-label="`${amountLabel} : ${formattedAmount ?? '…'} ${currency.code}`"
    >
      <span class="amount-label">{{ amountLabel }}</span>
      <div v-if="!loading && modelValue != null" class="amount-value">
        <input
          v-if="isEditable"
          type="number"
          class="amount-input"
          :value="modelValue"
          min="0"
          :step="inputStep"
          inputmode="decimal"
          :aria-label="`Montant en ${currency.code}`"
          @input="onAmountInput"
        >
        <span v-else class="amount">{{ formattedAmount }}</span>
        <span class="code">{{ currency.code }}</span>
      </div>
      <div v-else-if="loading" class="amount-value skeleton">
        <span class="amount">···</span>
        <span class="code">{{ currency.code }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.currency-row {
  --row-pad-x: clamp(0.5rem, 2.5vw, 0.9rem);
  display: flex;
  align-items: center;
  gap: clamp(0.45rem, 2vw, 0.85rem);
  width: 100%;
  max-width: 100%;
  padding: clamp(0.45rem, 2vw, 0.55rem) var(--row-pad-x);
  margin-bottom: 0.35rem;
  border-radius: 2px;
  background: linear-gradient(
    105deg,
    rgba(72, 118, 178, 0.45) 0%,
    rgba(45, 82, 140, 0.35) 40%,
    rgba(60, 100, 160, 0.4) 100%
  );
  background-size: 200% 200%;
  animation:
    row-enter 0.55s ease both,
    row-shimmer 8s ease-in-out infinite;
  overflow: hidden;
}

.currency-row--editable:focus-within {
  outline: 1px solid rgba(160, 210, 255, 0.55);
  outline-offset: 1px;
}

.flag {
  flex-shrink: 0;
  width: clamp(40px, 11vw, 56px);
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.names {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-align: left;
  overflow: hidden;
}

.name-en,
.name-fr {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-en {
  font-size: clamp(0.6rem, 2.8vw, 0.72rem);
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.2;
  color: #fff;
  text-transform: uppercase;
}

.name-fr {
  font-size: clamp(0.55rem, 2.4vw, 0.62rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.82);
  text-transform: uppercase;
}

.amount-block {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.2rem;
  min-width: 0;
}

.amount-label {
  font-size: clamp(0.5rem, 2vw, 0.58rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.2;
  white-space: nowrap;
}

.amount-value {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.35rem 0.5rem;
}

.amount-value.skeleton {
  opacity: 0.45;
}

.amount,
.amount-input {
  font-size: clamp(0.85rem, 3.2vw, 1.05rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-align: right;
  line-height: 1.15;
}

.amount-input {
  width: clamp(4.5rem, 22vw, 7rem);
  max-width: 100%;
  padding: 0.1rem 0.35rem;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.25);
  cursor: text;
}

.amount-input:hover {
  border-color: rgba(255, 255, 255, 0.55);
}

.amount-input:focus {
  outline: none;
  border-color: rgba(160, 210, 255, 0.9);
  background: rgba(0, 0, 0, 0.4);
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.code {
  font-size: clamp(0.75rem, 3vw, 0.9rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  padding: 0.15rem 0.4rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

@media (max-width: 380px) {
  .currency-row {
    flex-wrap: wrap;
    gap: 0.35rem 0.5rem;
  }

  .names {
    flex: 1 1 auto;
    min-width: calc(100% - clamp(40px, 11vw, 56px) - 0.5rem);
  }

  .amount-block {
    flex: 1 1 100%;
    margin-left: 0;
    align-items: stretch;
    width: 100%;
    padding-top: 0.15rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .amount-value {
    justify-content: space-between;
  }

  .amount-input {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .names .name-en,
  .names .name-fr {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

@media (min-width: 1200px) and (max-height: 1100px) {
  .currency-row {
    --row-pad-x: 2.5rem;
    gap: 1.25rem;
    padding: 0.75rem var(--row-pad-x);
    margin-bottom: 0.55rem;
  }

  .flag {
    width: 80px;
  }

  .names {
    gap: 0.2rem;
  }

  .name-en {
    font-size: 0.88rem;
    line-height: 1.3;
  }

  .name-fr {
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .amount-block {
    gap: 0.3rem;
  }

  .amount-label {
    font-size: 0.62rem;
  }

  .amount,
  .amount-input {
    font-size: 1.15rem;
  }

  .amount-input {
    width: 8rem;
  }

  .code {
    font-size: 1rem;
    padding: 0.2rem 0.5rem;
  }
}

@media (max-width: 1080px) and (min-height: 1500px) {
  .currency-row {
    --row-pad-x: 1.15rem;
    gap: 1rem;
    padding: 0.95rem var(--row-pad-x);
    margin-bottom: 0.65rem;
  }

  .flag {
    width: 72px;
  }

  .names {
    gap: 0.25rem;
  }

  .name-en {
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .name-fr {
    font-size: 0.72rem;
    line-height: 1.35;
  }

  .amount-block {
    gap: 0.35rem;
  }

  .amount-label {
    font-size: 0.62rem;
  }

  .amount,
  .amount-input {
    font-size: 1.1rem;
  }

  .code {
    font-size: 1.05rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .currency-row {
    animation: row-enter-reduced 0.01s ease both;
  }

  @keyframes row-enter-reduced {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes row-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
