<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AssetGrid from '../components/AssetGrid.vue'
const props = defineProps({ assets: Array, holdings: Array, balance: Number, error: String, lastFetched: String })
const emit = defineEmits(['select'])
const search = ref('')
const category = ref('All')
const filteredAssets = computed(() => props.assets.filter(asset =>
  (category.value === 'All' || asset.type === category.value) &&
  `${asset.name} ${asset.symbol}`.toLowerCase().includes(search.value.trim().toLowerCase())
))
</script>

<template>
  <div class="space-y-6 p-4 sm:p-6 lg:p-8">
    <RouterLink to="/" class="text-sm text-blue-600 hover:underline">← Account overview</RouterLink>
    <header>
      <h1 class="text-3xl font-bold text-slate-900">Markets</h1>
      <p class="mt-2 text-slate-500">Explore assets and place a simulated buy order.</p>
    </header>
    <div class="flex flex-wrap gap-3">
      <label class="flex flex-1 flex-col gap-1 text-sm sm:max-w-sm">
        Find assets
        <input v-model="search" type="search" placeholder="Search by name or symbol" class="rounded-xl border border-slate-200 bg-white px-4 py-3" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Asset type
        <select v-model="category" class="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <option>All</option><option>Crypto</option><option>Stock</option>
        </select>
      </label>
    </div>
    <!-- <p v-if="error" role="alert" class="text-sm text-red-500">Price update failed: {{ error }}</p> -->
    <p v-if="lastFetched" class="text-xs text-slate-500">Bitcoin price updated at {{ lastFetched }}</p>
    <AssetGrid :assets="filteredAssets" @select="emit('select', $event)" />
    <p v-if="!filteredAssets.length" class="py-10 text-center text-slate-500">No assets match your search.</p>
  </div>
</template>
