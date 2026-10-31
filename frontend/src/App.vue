<!-- App.vue Shared application shell and state -->
<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue';
import FormModal from './components/FormModal.vue';
import { ref, onMounted, onUnmounted, watchEffect } from "vue";

const API_URL = '/api/markets/stats'

const token = ref(null)

const modalIsOpen = ref(false)
const selectedAsset = ref(null) 
const balance = ref(10000)
const assets = ref([
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'Crypto',
    price: 73483.40,
    change24h: null,
    coingeckoId: 'bitcoin'
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'Crypto',
    price: 225.00,
    change24h: null,
    coingeckoId: 'ethereum'
  },
  {
    name: 'Tesla',
    symbol: 'TSLA',
    type: 'Stock',
    price: 256.89,
    change24h: null,
    coingeckoId: 'tesla'
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    type: 'Crypto',
    price: 145.50,
    change24h: null,
    coingeckoId: 'solana'
  },
])
const holdings = ref([])

async function registerUser({ name, email, password }) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      header: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, password })
    })

    if(!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json()

  } catch (error) {
    console.error(`Failed to post: `, error)
  }
}

async function loginUser({ email, password }) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-type': 'application/json'},
      body: JSON.stringify({ email, password })
    })

    if(!response.ok) throw new Error(`Status: ${response.status}`);
    
    //this is the reponse, either failed or invalid or successful
    const data = await response.json()
    
    token.value = data.token
  } catch (error) {
    console.error(`Fetch Post error`, error)
  }
}



async function fetchMarketData() {
  try {
    const response = await fetch(`${API_URL}`)

    if(!response.ok) {
      throw new Error(`Market stats request failed: ${response.status}`)
    }

    const data = await response.json() 
    // console.log(data)
    //what ties everything together 
    // for each item in data.assets, run this function
    data.assets.forEach(updateMarketStats)

  } catch (error) {
    console.error(`Failed to fetch market stats:`, error.message)
  }
  
}

onMounted(fetchMarketData)  

let socket

// Coinbase data 
onMounted(() => {
  socket = new WebSocket('ws://localhost:3001/price')

  // open the connection 
  socket.addEventListener('open', () => {
    console.log('Connected to Express backend!')

    socket.send('Vue connected to Express')
  })

  // receive the message 
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)
      // console.log(data)

      // snapshot, multiple crypto objects
      if(data.type === 'snapshot') {
        // extract the values into an array
        // run the update function for each
        Object.values(data.prices).forEach(updateAssetPrice)
      } else if (data.type === 'price') {
        updateAssetPrice(data)
      }
    } catch (error) {
      console.error('Could not process price update', error.message)
    }
  })
  // error event 

  // close event
})



function openModal(asset) {
    selectedAsset.value = asset
    modalIsOpen.value = true
}

// update asset prices 
function updateAssetPrice(update) {
  const symbol = update.symbol?.split('-')[0]
  const price = Number(update.price)

  if(!Number.isFinite(price) || price <= 0) return

  const asset = assets.value.find(asset => asset.symbol === symbol)

  if(asset) {
    asset.price = price

    asset.change24h = Number.isFinite(update.change24h)
      ? update.change24h
      : null
  }
}

// update coingecko market stats
function updateMarketStats(marketData) {
  const asset = assets.value.find(
    asset => asset.coingeckoId === marketData.id
  )

    if (!asset) return

    asset.marketCapUsd = marketData.marketCapUsd
    asset.volume24hUsd = marketData.volume24hUsd
    asset.change7dPercent = marketData.change7dPercent
}

// turns preview into an actual purchase
function confirmPurchase({ quantity, symbol }) {
  const asset = symbol ? assets.value.find(asset => asset.symbol === symbol) : selectedAsset.value
  if(!asset) return 

  // Are quantuity and price valid?
    if (!Number.isFinite(quantity) || quantity <= 0) return
    if (!Number.isFinite(asset.price) || asset.price <= 0) return

    // sets cost as a variable
    const cost = Number((quantity * asset.price).toFixed(2))

    //checks if you can afford it
    if (cost <= 0 || quantity * asset.price > balance.value) return

    // deducts cost from app's actual balance and closes modal
    balance.value = Number((balance.value - cost).toFixed(2))

    //check is you already own the asset
    const existingHolding = holdings.value.find(
      holding => holding.symbol === asset.symbol
    )

    //if you do, increase the qtty and update the avg price
    if(existingHolding) {
      const previousCost = existingHolding.quantity * existingHolding.averagePrice

      const totalQuantity = existingHolding.quantity + quantity

      existingHolding.averagePrice = (previousCost + quantity * asset.price) / totalQuantity

      existingHolding.quantity = totalQuantity
    } else {
      //else, create an object with the new holding and push
      holdings.value.push({
        name: asset.name,
        symbol: asset.symbol,
        quantity,
        averagePrice: asset.price
      })
    }


    modalIsOpen.value = false

    
}

// Fetch live prices

const price = ref(null)
const error = ref('')
const lastFetched = ref(null)

let timer
let controller
let stopped = false

async function fetchPrice() {
  controller = new AbortController()

  try {
    const response = await fetch(
      '/coinbase/api/v3/brokerage/market/products/BTC-USD',
      { signal: controller.signal }
    )

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const data = await response.json()
    const nextPrice = Number(data.price)

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      throw new Error('API returned an invalid price')
    }

    if (stopped) return

    price.value = nextPrice
    const bitcoin = assets.value.find(asset => asset.symbol === 'BTC')

    if (bitcoin)  {
        bitcoin.price = nextPrice
    }
    lastFetched.value = new Date().toLocaleTimeString()
    error.value = ''
  } catch (err) {
    if (!stopped) error.value = err.message
  } finally {
    // Wait until this request finishes before scheduling another.
    if (!stopped) {
      timer = setTimeout(fetchPrice, 10_000)
    }
  }
}

// Price polling is paused while practicing the local hello exchange.
// onMounted(fetchPrice)

onUnmounted(() => {
  socket?.close()
  stopped = true
  clearTimeout(timer)
  controller?.abort()
})

</script>

<template>
  <Header />

  <!-- main content area of the page - bg, min screen height -->
  <main class="min-h-screen bg-slate-100 font-figtree pt-16">

    <!-- form modal  -->
     <!-- passing a prop to form modal component  -->
     <FormModal 
        v-if="modalIsOpen"
        :asset="selectedAsset"
        :balance="balance"
        @confirm="confirmPurchase"
        @close="modalIsOpen = false"
     />

     <!-- Render whichever page the router selected and pass down these props -->
    <RouterView v-slot="{ Component }">
      <component 
        :is="Component" 
        :assets="assets" 
        :holdings="holdings" 
        :balance="balance"
        :error="error" :last-fetched="lastFetched" @select="openModal" 
        @confirm="confirmPurchase" 
        @register="registerUser" 
        @login="loginUser" />
    </RouterView>
  </main>

  <!-- form practice: toggle active, add a task -->



</template>

<style scoped>
  
</style>
