import { Router } from 'express'
import { getMarkets, getMarketData } from '../controllers/marketController.js'

const router = Router()

router.get('/', getMarkets)
router.get('/stats', getMarketData)

export default router
