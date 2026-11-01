<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalEquityValue: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  holdings: { type: Array, default: () => [] },
  assets: { type: Array, default: () => [] },
  trades: { type: Array, default: () => [] }
})
defineEmits(['select', 'confirm', 'register', 'login'])

// Join owned quantities with current market prices, without changing holdings.
const rows = computed(() => props.holdings.map(holding => {
  const asset = props.assets.find(asset => asset.symbol === holding.symbol)
  const currentPrice = Number.isFinite(asset?.price) ? asset.price : null
  const cost = holding.quantity * holding.averagePrice
  const value = currentPrice === null ? null : holding.quantity * currentPrice
  const profit = value === null ? null : value - cost
  return { ...holding, currentPrice, cost, value, profit,
    profitPercent: profit !== null && cost > 0 ? profit / cost * 100 : null }
}))
const totalCost = computed(() => rows.value.reduce((sum, row) => sum + row.cost, 0))
const holdingsValue = computed(() => rows.value.some(row => row.value === null)
  ? null : rows.value.reduce((sum, row) => sum + row.value, 0))
const totalProfit = computed(() => holdingsValue.value === null ? null : holdingsValue.value - totalCost.value)
const equity = computed(() => holdingsValue.value === null ? null : props.balance + holdingsValue.value)
const recentTrades = computed(() => [...props.trades]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10))

const colors = ['#818cf8', '#14b8a6', '#f59e0b', '#3b82f6', '#f472b6', '#a78bfa']
const allocation = computed(() => {
  if (equity.value === null || equity.value <= 0) return []
  return [{ name: 'Cash', symbol: 'cash', value: props.balance }, ...rows.value]
    .filter(item => item.value > 0)
    .map((item, index) => ({ ...item, color: colors[index % colors.length],
      percent: item.value / equity.value * 100 }))
})
const allocationBackground = computed(() => {
  let end = 0
  const segments = allocation.value.map(item => {
    const start = end
    end += item.percent
    return `${item.color} ${start}% ${end}%`
  })
  return segments.length ? `conic-gradient(${segments.join(', ')})` : '#e2e8f0'
})
function formatCurrency(value) {
  return Number.isFinite(value) ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—'
}
function signedMoney(value) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${formatCurrency(value)}` : '—'
}
function percentage(value) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '—'
}
function profitColor(value) {
  return value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-500' : 'text-slate-500'
}
function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="w-full space-y-6 p-4 font-figtree sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div><h1 class="text-4xl font-bold">Your Portfolio</h1><p class="mt-2 text-slate-500">Your holdings, purchase costs and performance.</p></div>
      <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-600">Virtual trading account</span>
    </header>
    <div class="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
    <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
      <section class="panel"><p class="label">TOTAL ACCOUNT VALUE</p><p class="metric">{{ formatCurrency(equity) }}</p><p class="label">Cash + current holdings</p></section>
      <section class="panel"><p class="label">AVAILABLE CASH</p><p class="metric">{{ formatCurrency(balance) }}</p><p class="label">Available to trade</p></section>
      <section class="panel"><p class="label">HOLDINGS VALUE</p><p class="metric">{{ formatCurrency(holdingsValue) }}</p><p class="label">At current market prices</p></section>
      <section class="panel bg-linear-to-br from-indigo-100 to-violet-100"><p class="label">UNREALIZED P&amp;L</p><p class="metric" :class="profitColor(totalProfit)">{{ signedMoney(totalProfit) }}</p><p class="label">Current value minus purchase cost</p></section>
    </div>
    <section class="panel min-w-0" aria-labelledby="allocation-title">
      <h2 id="allocation-title" class="mb-6 text-xl font-semibold">Account allocation</h2>
      <div class="grid items-center gap-6">
        <div class="mx-auto flex aspect-square w-full max-w-52 items-center justify-center rounded-full p-6" :style="{ background: allocationBackground }" role="img" aria-label="Account allocation chart; percentages listed below">
          <div class="flex h-full w-full flex-col items-center justify-center rounded-full bg-white"><p class="label">TOTAL VALUE</p><p class="mt-2 text-2xl font-bold">{{ formatCurrency(equity) }}</p></div>
        </div>
        <div>
          <ul class="space-y-4"><li v-for="item in allocation" :key="item.symbol" class="flex items-center gap-3"><span class="size-3 shrink-0 rounded-full" :style="{ background: item.color }" aria-hidden="true"></span><span>{{ item.name }}</span><span class="ml-auto font-semibold">{{ item.percent.toFixed(1) }}%</span></li></ul>
          <p v-if="!allocation.length" class="text-slate-500">{{ equity === null ? 'Allocation unavailable until all holding prices are available.' : 'No funds or holdings to allocate yet.' }}</p>
          <p class="mt-6 text-sm text-slate-500">Allocation includes available cash.</p>
        </div>
      </div>
    </section>
    </div>

    <section class="panel" aria-labelledby="holdings-title">
      <h2 id="holdings-title" class="mb-5 text-xl font-semibold">Holdings</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[780px] text-right text-sm">
          <thead><tr><th class="text-left">Asset</th><th>Quantity</th><th>Avg. buy price</th><th>Current price</th><th>Cost</th><th>Value</th><th>Unrealized P&amp;L</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.symbol">
              <td class="text-left font-semibold">{{ row.name }}<span class="mt-1 block font-normal text-slate-500">{{ row.symbol }}</span></td>
              <td>{{ row.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 }) }}</td>
              <td>{{ formatCurrency(row.averagePrice) }}</td><td>{{ formatCurrency(row.currentPrice) }}</td>
              <td>{{ formatCurrency(row.cost) }}</td><td>{{ formatCurrency(row.value) }}</td>
              <td :class="profitColor(row.profit)">{{ signedMoney(row.profit) }}<span class="mt-1 block text-xs">{{ percentage(row.profitPercent) }}</span></td>
            </tr>
            <tr v-if="!rows.length"><td colspan="7" class="text-center text-slate-500">No holdings yet. Buy an asset to start your portfolio.</td></tr>
          </tbody>
          <tfoot v-if="rows.length"><tr class="font-semibold"><td colspan="4" class="text-left">Total</td><td>{{ formatCurrency(totalCost) }}</td><td>{{ formatCurrency(holdingsValue) }}</td><td :class="profitColor(totalProfit)">{{ signedMoney(totalProfit) }}</td></tr></tfoot>
        </table>
      </div>
    </section>

    <section class="panel" aria-labelledby="trades-title">
      <h2 id="trades-title" class="mb-5 text-xl font-semibold">Recent trades</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] text-right text-sm">
          <thead><tr><th class="text-left">Asset</th><th>Side</th><th>Quantity</th><th>Execution price</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="trade in recentTrades" :key="trade.id">
              <td class="text-left font-semibold">{{ trade.name }}<span class="mt-1 block font-normal text-slate-500">{{ trade.symbol }}</span></td>
              <td>{{ trade.side }}</td><td>{{ trade.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 }) }} {{ trade.symbol }}</td>
              <td>{{ formatCurrency(trade.price) }}</td><td>{{ formatCurrency(trade.total) }}</td><td><time :datetime="trade.createdAt">{{ formatDate(trade.createdAt) }}</time></td>
            </tr>
            <tr v-if="!recentTrades.length"><td colspan="6" class="text-center text-slate-500">No trades yet. Successful purchases will appear here.</td></tr>
          </tbody>
        </table>
      </div>
    </section>


    <p class="text-xs text-slate-500">Practice funds only · fees excluded · this session resets on refresh. Prices use the latest available app quotes.</p>
  </div>
</template>

<style scoped>
.panel { border-radius: 24px; border: 1px solid #e2e8f0; background-color: white; padding: 24px; }
.label { color: #64748b; font-size: 14px; }
.metric { margin: 8px 0; font-size: 28px; font-weight: 700; overflow-wrap: anywhere; }
th { background: #f8fafc; color: #64748b; font-weight: 500; }
th, td { padding: 18px 12px; }
tbody tr, tfoot tr { border-bottom: 1px solid #e2e8f0; }
</style>
