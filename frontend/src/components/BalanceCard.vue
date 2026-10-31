<script setup>
import { computed } from 'vue'
// Balance is reactive, so when it changes in parent, it automatically updates in child
const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
  startingCapital: {
    type: Number,
    default: 10000,
  },
})

// how many percent of your starting money have you spent?
const deployedPercent = computed(() => {

  if (props.startingCapital <= 0) return 0

  const percentage =
    ((props.startingCapital - props.balance) / props.startingCapital) * 100

    //from inside picks the largest number
    //from outside picks the smallest number
    //which means dont go below 0 or above 100
  return Math.min(100, Math.max(0, percentage))
})

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
</script>

<template>
    <section
    class="rounded-[28px] border border-white/80 bg-linear-to-br
           from-indigo-100 to-violet-100 p-6 font-figtree"
  >
    <h2 class="text-sm font-semibold tracking-wide text-slate-500">
      BUYING POWER
    </h2>

    <p class="mt-3 text-4xl font-bold tracking-tight text-slate-900">
      {{ formatMoney(balance) }}
    </p>

    <div
      class="mt-5 h-2.5 overflow-hidden rounded-full bg-white/80"
      role="progressbar"
      aria-label="Starting capital deployed"
      :aria-valuenow="deployedPercent"
      :aria-valuemin="0"
      :aria-valuemax="100"
    >
      <div
        class="h-full rounded-full bg-linear-to-r
               from-blue-500 to-violet-400 transition-[width]"
        :style="{ width: `${deployedPercent}%` }"
      ></div>
    </div>

    <p class="mt-2 text-sm text-slate-500">
      {{ Math.round(deployedPercent) }}% deployed ·
      {{ formatMoney(startingCapital) }} starting capital
    </p>
  </section>
</template>

<style scoped>

</style>