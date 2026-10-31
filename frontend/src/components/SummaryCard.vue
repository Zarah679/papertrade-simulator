<!-- quantity and price should reflect here and change dynamically -->
<script setup>
    const props = defineProps({
        holdings: Object,
        required: true,
    })

    function formatMoney(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    function formatQuantity(value) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 8,
    }).format(value)
    }
</script>

<template>
  <section class="rounded-3xl bg-white p-6 font-figtree">
    <h2 class="font-semibold text-slate-500">
      HOLDINGS
    </h2>

    <!-- conditional rendering -->
    <p
      v-if="holdings.length === 0"
      class="mt-4 text-sm text-slate-400"
    >
      Your purchases will appear here.
    </p>

    <div
      v-for="holding in holdings"
      :key="holding.symbol"
      class="mt-4 flex items-center justify-between gap-4"
    >
      <div>
        <h3 class="font-semibold text-slate-900">
          {{ holding.name }}
        </h3>

        <p class="text-sm text-slate-500">
          {{ formatQuantity(holding.quantity) }}
          {{ holding.symbol }}
        </p>
      </div>

      <div class="text-right">
        <p class="font-mono text-sm font-semibold text-slate-900">
          {{ formatMoney(holding.averagePrice) }}
        </p>

        <p class="text-xs text-slate-500">
          Avg. buy price
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>