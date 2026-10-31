<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import TradeHistory from '../components/TradeHistory.vue'

// App provides the assets used by this page.
const props = defineProps({
  assets:{
    type: Array,
    required: true,
  },
  holdings: { 
    type: Array, 
    default: () => [] 
  },
  balance: {
    type: Number,
    default: 0,
  }
})

const quantity = ref(0)

const quantityStep = computed(() => {
  return selectedAsset.value?.type === 'Crypto' ? 0.001 : 1
})

const estimatedCost = computed(() => {
  const value = Number(quantity.value)

  // validate before calculating cost
  return Number.isFinite(value) && value > 0 
    ? value * selectedAsset.value.price
    : 0
})

function formatCurrency(value) {
  return Number.isFinite(value) 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
    : '—'
}

//can buy if number is finite but about zero
//can buy if asset is less than available balance

const canBuy = computed(() => {
  const amount = Number(quantity.value)
  const price = Number(selectedAsset.value?.price)

  const totalCost = amount * price 

  return (
    Number.isFinite(amount) && amount > 0 &&
    Number.isFinite(price) && price > 0 &&
    totalCost <= balance.value
  )
})

// Prevent native input selection events from reaching App's modal listener.
defineEmits(['select', 'confirm'])

const route = useRoute()

const selectedAsset = computed(() => {
  // route.params.symbol = symbol in the url
  return props.assets.find((asset) => asset.symbol === route.params.symbol)
})

const updateQuantity = () => {

}

const selectedPeriod = ref('24H')
const side = ref('Buy')
</script>

<template>
  <div v-if="selectedAsset" class="w-full space-y-6 p-4 font-figtree sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Trading</h1>
        <p class="mt-1 text-sm text-slate-500">Your space to practice the market.</p>
      </div>
      <span class="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600">Demo market data</span>
    </header>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section class="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2" aria-labelledby="market-title">
        
        <!-- Header row: asset identity on the left, label on the right. -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-2xl font-bold text-orange-500" aria-hidden="true">
              {{ selectedAsset.logo || (selectedAsset.symbol === 'BTC' ? '₿' : selectedAsset.name.charAt(0)) }}
            </span>
            <h2 id="market-title" class="text-xl font-semibold">
              {{ selectedAsset.name }}
              <span class="text-sm font-normal text-slate-500">{{ selectedAsset.symbol }} / USD</span>
            </h2>
          </div>
          <span class="text-sm text-slate-400">Market overview</span>
        </div>

        <!-- Price and change stack below the header, outside its flex row. -->
        <p class="mt-6 break-words text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {{ selectedAsset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
        </p>
        <p v-if="Number.isFinite(selectedAsset.change24h)" class="mt-2 font-medium"
          :class="selectedAsset.change24h < 0 ? 'text-red-500' : 'text-emerald-500'">
          {{ selectedAsset.change24h > 0 ? '+' : '' }}{{ selectedAsset.change24h.toFixed(2) }}%
          <span class="font-normal">in 24h</span>
        </p>
        <p v-else class="mt-2 text-sm text-slate-400">24h change unavailable</p>

        <div class="mt-8 flex w-fit gap-1 rounded-full bg-slate-100 p-1" aria-label="Chart time range">
          <button v-for="period in ['1H', '24H', '7D', '1M']" :key="period" type="button"
            class="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            :class="selectedPeriod === period ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            :aria-pressed="selectedPeriod === period" @click="selectedPeriod = period">
            {{ period }}
          </button>
        </div>

        <div class="mt-5 flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-linear-to-b from-blue-50/50 to-slate-50 px-6 text-center lg:min-h-80">
          <svg class="size-10 text-blue-300" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M5 5v22h23M8 21l6-7 5 3 8-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="text-sm text-slate-500">Bitcoin price chart will appear here</p>
          <p class="text-xs text-slate-400">{{ selectedPeriod }} view · chart preview</p>
        </div>
        <div class="mt-5 flex flex-wrap justify-between gap-3 text-sm text-slate-500">
          <p>24h low: <span class="font-semibold text-slate-700">$65,200</span></p>
          <p>24h high: <span class="font-semibold text-slate-700">$67,800</span></p>
        </div>
      </section>

      <aside class="flex flex-col gap-6">
        <section class="rounded-3xl border border-white bg-linear-to-br from-indigo-100 to-violet-100 p-5 sm:p-6" aria-labelledby="portfolio-title">
          <h2 id="portfolio-title" class="text-xl font-semibold text-slate-900">Your portfolio</h2>
          <p class="mt-5 text-sm text-slate-500">Total portfolio value</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">—</p>
          <dl class="mt-6 space-y-4 text-sm">
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Available cash</dt><dd class="font-semibold text-slate-800">{{ balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">{{ selectedAsset.name }} held</dt><dd class="font-semibold text-slate-800">— {{ selectedAsset.symbol }}</dd></div>
          </dl>
        </section>

        <section class="flex-1 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="trade-title">
          <h2 id="trade-title" class="text-xl font-semibold text-slate-900">Trade {{ selectedAsset.name }}</h2>
          <div class="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <button v-for="option in ['Buy', 'Sell']" :key="option" type="button" class="rounded-xl py-2.5 text-sm font-semibold"
              :class="side === option ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'"
              :aria-pressed="side === option" @click="side = option">{{ option }}</button>
          </div>
          <form class="mt-5" @submit.prevent>
            <label for="trade-quantity" class="text-sm font-medium text-slate-600">Quantity to {{ side.toLowerCase() }} ({{ selectedAsset.symbol }})</label>
            <div class="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-400">
              <input id="trade-quantity" placeholder="0" type="number"  v-model.number="quantity" inputmode="decimal" min="0" :step="quantityStep" class="w-full min-w-0 bg-transparent px-2 py-3 text-xl font-semibold outline-none" />
              <span class="text-slate-400">{{ selectedAsset.symbol }}</span>
            </div>
            <p>Quanitity Entered: {{ quantity }}</p>
      
            <div class="mt-4 flex justify-between gap-2 text-sm">
              <span class="text-slate-500">{{ side === 'Buy' ? 'Estimated cost' : 'Estimated proceeds' }}</span>
              <span class="font-semibold">{{ formatCurrency(estimatedCost) }}</span>
            </div>
            <button type="submit" :disabled="!canBuy" class="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white enabled:cursor-pointer enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">{{ side }} {{ selectedAsset.symbol }}</button>
            <p class="mt-3 text-center text-xs text-slate-400">Practice funds only · form not connected yet</p>
          </form>
        </section>
      </aside>
    </div>

    <TradeHistory />
  </div>
  <p v-else class="p-6 text-slate-500">Asset not found. Choose an asset from Markets.</p>
</template>

