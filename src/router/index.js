import { createRouter, createWebHistory } from 'vue-router'
import HomeViewOptions from '@/views/HomeViewOptions.vue'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'etape-options',
    component: HomeViewOptions,
    meta: { step: 1 }
  },
  {
    path: '/composition',
    name: 'etape-composition',
    component: HomeView,
    meta: { step: 2 }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
