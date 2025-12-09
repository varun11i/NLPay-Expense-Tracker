import { createRouter, createWebHistory } from 'vue-router'
import Transactions from '../views/Transactions.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'transactions',
      component: Transactions
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("../views/DashboardView.vue"),
    }
  ]
})

export default router