<script setup>
// Empty until completed orders are connected to this component.
</script>

<template>
  <section class="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="history-title">
    <div class="flex items-center justify-between gap-3">
      <h2 id="history-title" class="text-xl font-semibold text-slate-900">Trade history</h2>
      <span class="text-xs text-slate-400">0 orders</span>
    </div>
    <div class="mt-5 overflow-x-auto">
      <table class="w-full min-w-125 text-left text-sm">
        <thead class="border-b border-slate-100 text-xs text-slate-400">
          <tr><th class="pb-3 font-medium">Asset</th><th class="pb-3 font-medium">Side</th><th class="pb-3 font-medium">Quantity</th><th class="pb-3 font-medium">Price</th><th class="pb-3 text-right font-medium">Total</th></tr>
        </thead>
        <tbody><tr><td colspan="5" class="py-8 text-center text-slate-400">Your completed trades will appear here.</td></tr></tbody>
      </table>
    </div>
  </section>
</template>
