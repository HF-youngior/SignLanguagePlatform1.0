import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Learn from '@/views/Learn.vue'
import Translate from '@/views/Translate.vue'
import Community from '@/views/Community.vue'
import BasicSignLearning from '@/views/BasicSignLearning.vue'
import SignLetterLearning from '@/views/SignLetterLearning.vue'
import FingerSignQuiz from '@/views/FingerSignQuiz.vue'

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
    path: '/learn/basic-sign',
    name: 'BasicSignLearning',
    component: BasicSignLearning
  },
  {
    path: '/learn/sign-letters',
    name: 'SignLetterLearning',
    component: SignLetterLearning
  },
  {
    path: '/learn/finger-quiz',
    name: 'FingerSignQuiz',
    component: FingerSignQuiz
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
