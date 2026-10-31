<script setup>
import { RouterLink } from 'vue-router'

defineProps({ 
    asset: { 
        type: Object, 
        required: true } 
})

const emit = defineEmits(['select'])
function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
function formatCompact(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)
    : '—'
}
</script>

<template>
  <article class="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left font-figtree shadow-sm">
    <header class="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-500" aria-hidden="true">
        {{ asset.symbol === 'BTC' ? '₿' : asset.name.charAt(0) }}
      </div>
      <div class="min-w-0">
        <h3 class="font-semibold text-slate-900">{{ asset.name }}</h3>
        <p class="text-xs text-slate-500">{{ asset.symbol }} · {{ asset.type }}</p>
      </div>
    </header>
    <div>
      <p class="text-xs text-slate-500">{{ asset.name }} price</p>
      <p class="mt-1 text-2xl font-semibold tracking-tight">{{ formatMoney(asset.price) }}</p>
      <p
        v-if="Number.isFinite(asset.change24h)"
        class="text-sm"
        :class="asset.change24h < 0 ? 'text-red-500' : 'text-emerald-600'"
      >
        {{ asset.change24h > 0 ? '+' : '' }}{{ asset.change24h.toFixed(2) }}%
      <span class="text-slate-400 text-xs ">(24h)</span>
</p>

<p v-else class="text-sm text-slate-400">
  24h change unavailable
</p>
    </div>
    <dl class="grid grid-cols-3 divide-x divide-slate-100 text-xs">
      <div class="pr-2">
        <dt class="text-slate-500">7d change</dt>
        <dd class="mt-1 font-semibold">{{ Number.isFinite(asset.change7dPercent) ? `${asset.change7dPercent.toFixed(2)}%` : '—' }}</dd>
      </div>
      <div class="px-2">
        <dt class="text-slate-500">Market cap</dt>
        <dd class="mt-1 font-semibold">{{ formatCompact(asset.marketCapUsd) }}</dd>
      </div>
      <div class="pl-2">
        <dt class="text-slate-500">Volume (24h)</dt>
        <dd class="mt-1 font-semibold">{{ formatCompact(asset.volume24hUsd) }}</dd>
      </div>
    </dl>
    <!-- <p v-if="![asset.roi, asset.marketCap, asset.volume24h].every(Number.isFinite)" class="text-xs text-slate-400">— Data unavailable</p> -->
    <!-- <button type="button" class="mt-auto w-full cursor-pointer rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" :aria-label="`Buy ${asset.name}`" @click="emit('select', asset)">
      Details
    </button> -->

    <RouterLink 
      :to="`/trading/${asset.symbol}`" 
      class="mt-auto w-full text-center cursor-pointer rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
        Details
    </RouterLink>
  </article>
</template>
