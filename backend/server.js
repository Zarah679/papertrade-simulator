import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import WebSocket, { WebSocketServer } from 'ws'
import marketRoutes from './routes/marketRoutes.js'
import authRoutes from './routes/authRoutes.js'

const PORT = process.env.PORT || 3001
const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

// Latest prices, indexed by symbol (for example, BTC-USD).
const prices = {} 

// Express controllers can access this same object through request.app.locals.
app.locals.prices = prices

app.use('/api/markets', marketRoutes)
app.use('/api/auth', authRoutes)

// 1. Accept connections from Vue using the same HTTP server and port.
const browserConnections = new WebSocketServer({
  server,
  path: '/price',
})

browserConnections.on('connection', (browser) => {
  console.log('Connected to frontend')
  browser.send(JSON.stringify({ type: 'snapshot', prices }))
  browser.on('error', (error) => console.error('Browser error:', error.message))
})

browserConnections.on('error', (error) => {
  console.error('WebSocket server error:', error.message)
})

// 2. Connect to Coinbase and subscribe to prices.
const products = ['BTC-USD', 'ETH-USD', 'SOL-USD']
const coinbase = new WebSocket('wss://ws-feed.exchange.coinbase.com')

coinbase.on('open', () => {
  console.log('Connected to Coinbase')
  coinbase.send(JSON.stringify({
    type: 'subscribe',
    product_ids: products,
    channels: ['ticker'],
  }))
})

// 3. Read each update, save it, and send it to connected browsers.
coinbase.on('message', (rawMessage) => {
  try {
    const data = JSON.parse(rawMessage.toString())
    
    const open24h = Number(data.open_24h)

    if (data.type === 'error') {
      console.error('Coinbase subscription error:', data.message)
      return
    }
    if (data.type !== 'ticker' || !products.includes(data.product_id)) return

    const numericPrice = Number(data.price)
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return

    // Calculate the percentage change from the 24-hour opening price.
    const change24h = 
        Number.isFinite(open24h) && open24h > 0 
            ? ((numericPrice - open24h) / open24h) * 100
            : null
            
    const price = {
      symbol: data.product_id,
      price: numericPrice,
      change24h,
      time: data.time,
    }

    prices[price.symbol] = price

    
    for (const browser of browserConnections.clients) {
      if (browser.readyState === WebSocket.OPEN) {
        browser.send(JSON.stringify({ type: 'price', ...price }))
      }
    }
  } catch (error) {
    console.error('Invalid price message:', error.message)
  }
})

coinbase.on('error', (error) => {
  console.error('Coinbase connection error:', error.message)
})
coinbase.on('close', (code) => {
  console.log('Coinbase connection closed:', code)
})

// 4. Close connections when stopping the backend.
function shutdown() {
  coinbase?.terminate()
  for (const browser of browserConnections.clients) browser.terminate()
  browserConnections.close()
  server.close()
}

server.on('error', (error) => {
  console.error('HTTP server error:', error.message)
  shutdown()
  process.exitCode = 1
})
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

// Start the HTTP server that also accepts browser WebSocket connections.
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
