<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'

const props = defineProps({ 
    asset: Object,
    balance: Number,
})
const emit = defineEmits(['close', 'confirm'])

// This is the submit handler 
function submitOrder(e) {
    e.preventDefault()
    if(!canBuy.value) return 

    // tell the parent that we clicked confirm purchase and here is the quantity 
    emit('confirm', { quantity: quantity.value})
}

//holds DOM element reference
const dialog = ref(null)

const quantity = ref(0)

//computed
const estimatedCost = computed(() => {
    return quantity.value * props.asset.price
})
const estimatedBalance = computed(() => {
    return props.balance - estimatedCost.value
})

// increase and decrease handlers 

const quantityStep = computed(() => {
  return props.asset.type === 'Crypto' ? 0.001 : 1
})

function increaseQuantity() {
  quantity.value = Number(
    (Number(quantity.value) + quantityStep.value).toFixed(8)
  )
}

function decreaseQuantity() {
  quantity.value = Math.max(
    0,
    Number(
      (Number(quantity.value) - quantityStep.value).toFixed(8)
    )
  )
}

//can order be submitted?
const canBuy = computed(() => {
  return (
    Number.isFinite(quantity.value) &&
    quantity.value > 0 &&
    estimatedCost.value <= props.balance
  )
})

// Native dialog handles focus trapping and Escape; App owns visibility.
let previousOverflow
onMounted(() => {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.value.showModal()
})
onUnmounted(() => {
    document.body.style.overflow = previousOverflow
})
</script>

<template>
    <Teleport to="body">
        <dialog
            ref="dialog"
            class="trade-dialog font-figtree"
            aria-labelledby="trade-title"
            @cancel.prevent="emit('close')"
            @click.self="emit('close')"
        >
            <form class="trade-panel" @submit="submitOrder">
                <header class="flex items-center gap-3">
                    <div class="asset-icon" aria-hidden="true">
                        {{ asset?.symbol === 'BTC' ? '₿' : asset?.name?.charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                        <h2 id="trade-title" class="text-xl font-semibold tracking-tight">
                            Buy {{ asset?.name }}
                        </h2>
                        <p class="mt-1 text-sm text-slate-500">
                            {{ asset?.symbol }} · {{ asset?.price }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="close-button"
                        aria-label="Close trade form"
                        autofocus
                        @click="emit('close')"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                        </svg>
                    </button>
                </header>

                <!-- Quantity drives the estimated cost and remaining balance. -->
                <div class="mt-4">
                    <label for="trade-quantity" class="text-sm font-semibold tracking-wide text-slate-500">
                        QUANTITY
                    </label>
                    <div class="quantity-control mt-3">
                        <button type="button" class="step-button" aria-label="Decrease quantity" @click="decreaseQuantity">−</button>
                        <input id="trade-quantity" type="number" inputmode="decimal" min="0" step="any" class="quantity-input" v-model.number="quantity" />
                        <button type="button" class="step-button" aria-label="Increase quantity" @click="increaseQuantity">+</button>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Quantity presets">
                    <button
                        v-for="preset in ['25%', '50%', '75%', 'Max']"
                        :key="preset"
                        type="button"
                        class="preset-button"
                        :class="{ 'preset-highlight': preset === '50%' }"
                        disabled
                    >
                        {{ preset }}
                    </button>
                </div>

                <!-- Preview only; commission remains a placeholder. -->
                <dl class="estimate-panel mt-4 space-y-2">
                    <div class="flex items-center justify-between gap-3">
                        <dt>Est. cost</dt>
                        <dd class="font-mono font-semibold text-slate-900">${{ estimatedCost.toFixed(2) }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <dt>Est. commission</dt>
                        <dd class="font-mono font-semibold text-slate-900">$0.00</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3 pt-2">
                        <dt>New balance</dt>
                        <dd class="font-mono font-semibold text-blue-500">${{ estimatedBalance.toFixed(2) }}</dd>
                    </div>
                </dl>

                <button type="submit" class="confirm-button mt-4" :disabled="!canBuy">
                    Confirm buy · {{ quantity }} {{ asset?.symbol }}
                </button>
                <p class="mt-4 text-center text-xs text-slate-500">
                    Simulated order · no real funds are used
                </p>
            </form>
        </dialog>
    </Teleport>
</template>

<style scoped>
.trade-dialog {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(440px, calc(100% - 32px));
    max-height: calc(100dvh - 32px);
    padding: 0;
    overflow-y: auto;
    border: 1px solid rgb(255 255 255 / 65%);
    border-radius: 24px;
    background: rgb(245 246 248 / 85%);
    color: #172139;
    box-shadow: 0 28px 65px rgb(15 23 42 / 22%);
    backdrop-filter: blur(20px);
}

.trade-dialog::backdrop {
    background: rgb(71 85 105 / 32%);
    backdrop-filter: blur(9px);
}

.trade-panel { padding: 24px; }
.asset-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 16px;
    background: rgb(251 146 60 / 11%);
    color: #f28b32;
    font-size: 23px;
    font-weight: 700;
}
.close-button {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgb(255 255 255 / 55%);
    color: #78869d;
    cursor: pointer;
}
.close-button:hover { background: white; }
.close-button:focus-visible { outline: 2px solid #648cff; outline-offset: 3px; }
.quantity-control {
    display: flex;
    align-items: center;
    padding: 6px;
    border-radius: 18px;
    background: rgb(255 255 255 / 90%);
}
.step-button {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 18px;
    background: rgb(255 255 255 / 70%);
    font-size: 24px;
    font-weight: 600;
}
.step-button:first-child { color: #78869d; }
.quantity-input {
    width: 100%;
    min-width: 0;
    text-align: center;
    background: transparent;
    color: #a0aaba;
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 600;
}
.preset-button {
    padding: 8px 0;
    border-radius: 999px;
    background: rgb(255 255 255 / 60%);
    color: #78869d;
    font-size: 14px;
    font-weight: 500;
}
.preset-highlight { background: rgb(255 255 255 / 90%); color: #172139; }
.estimate-panel {
    padding: 18px;
    border-radius: 18px;
    background: rgb(255 255 255 / 90%);
    color: #78869d;
    font-size: 14px;
}
.confirm-button {
    width: 100%;
    padding: 14px 12px;
    border-radius: 18px;
    background: #8daafa;
    color: #f3f6ff;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 7px 12px rgb(91 133 255 / 13%);
}
button:disabled { cursor: not-allowed; }
.confirm-button:enabled {
    background: #3b6ff5;
    color: white;
    cursor: pointer;
}
.confirm-button:enabled:hover { background: #2959d9; }
@media (max-width: 420px) {
    .trade-panel { padding: 22px 18px; }
    .estimate-panel { padding: 18px; font-size: 14px; }
}
</style>
