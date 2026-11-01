import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from './views/DashboardView.vue'
import MarketsView from './views/MarketsView.vue'
import TradingView from './views/TradingView.vue'
import AuthView from './views/AuthView.vue'
import PortfolioView from './views/PortfolioView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/login', component: AuthView },
    { path: '/register', component: AuthView },
    { path: '/markets', component: MarketsView },
    { path: '/portfolio', component: PortfolioView },
    { path: '/trading', redirect: '/trading/BTC' },
    { path: '/trading/:symbol', component: TradingView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
