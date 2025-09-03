import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Learn from '@/views/Learn.vue'
import Translate from '@/views/Translate.vue'
import Community from '@/views/Community.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/learn',
    name: 'Learn',
    component: Learn
  },
  {
    path: '/translate',
    name: 'Translate',
    component: Translate
  },
  {
    path: '/community',
    name: 'Community',
    component: Community
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
