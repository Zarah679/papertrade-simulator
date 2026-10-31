<script setup>
import { RouterLink } from 'vue-router'
import Chart from '../components/Chart.vue'
import SummaryCard from '../components/SummaryCard.vue'
import Button from '../components/Button.vue'
import AssetGrid from '../components/AssetGrid.vue'
import BalanceCard from '../components/BalanceCard.vue'
defineProps({ assets: Array, holdings: Array, balance: Number, error: String, lastFetched: String })
const emit = defineEmits(['select'])
</script>
<template>
    <!-- page container - control max width, center everything and allows space at the edges of the screen  -->
    <div class="w-full p-4 sm:p-6 lg:p-8">
        <!-- layout container - arrange children into columns -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- left column -->
            <section class="lg:col-span-2 flex flex-col gap-6">
                <div>
                  <div>
                    <h1 class="font-bold text-4xl font-inter">Your Account Overview</h1>
                    <p>Start Practicing with $10,000 in virtual funds</p>
                  </div>

                  <RouterLink to="/markets" class="text-blue-600 hover:underline">
                    Explore markets
                  </RouterLink>
                </div>
                <!-- equity card -->
                <Chart />
                <!-- trade buttons -->
                <Button />
            </section>

            <!-- right column -->
            <aside class="flex flex-col gap-4">
                <!-- holdings card  -->
                 <SummaryCard :holdings="holdings" />
                <!-- recent fills card  -->
                 <BalanceCard :balance="balance" />
                <!-- buying power card  -->
            </aside>
        </div>

        <section id="markets" class="mt-10 space-y-4" aria-label="Markets">
                <h2 class="text-xl font-semibold">Markets</h2>

                <!-- <p v-if="error" role="alert" class="text-sm text-red-500">
                    Price update failed: {{ error }}
                </p> -->

                <p v-if="lastFetched" class="text-xs text-slate-500">
                    Bitcoin price updated at {{ lastFetched }}
                </p>
                 <!-- recieves the asset and opens the modal -->
                <AssetGrid 
                    @select="emit('select', $event)" 
                    :assets="assets" :limit="4"
                />

                <div class="text-center pt-3">
                    <RouterLink to="/markets" class="inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 font-semibold hover:bg-slate-50">
                        Show more markets →
                    </RouterLink>
                </div>
        </section>
    </div>
</template>
