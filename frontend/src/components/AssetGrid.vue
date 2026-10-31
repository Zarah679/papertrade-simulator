<script setup>
import { computed } from 'vue'
import AssetCard from './AssetCard.vue'
const emit = defineEmits(['select'])
const props = defineProps({
  assets: { type: Array, required: true },
  limit: { type: Number, default: 0 },
})
const visibleAssets = computed(() => props.limit ? props.assets.slice(0, props.limit) : props.assets)
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <AssetCard v-for="asset in visibleAssets" :key="asset.symbol" :asset="asset" @select="emit('select', $event)" />
  </div>
</template>
