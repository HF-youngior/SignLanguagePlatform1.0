import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Learn from '@/views/Learn.vue'
import Translate from '@/views/Translate.vue'
import Community from '@/views/Community.vue'
import Profile from '@/views/Profile.vue'
import UserProfile from '@/views/UserProfile.vue'
import PostDetail from '@/views/PostDetail.vue'
import GroupChat from '@/views/GroupChat.vue'
import ChatGroup from '@/views/ChatGroup.vue'
import HashtagPage from '@/views/HashtagPage.vue'
import PrivateChat from '@/views/PrivateChat.vue'
import ChallengeMode from '@/views/ChallengeMode.vue'
import ChallengeLevelCalendar from '@/views/ChallengeLevelCalendar.vue'
import HomeMap from '@/views/HomeMap.vue'
import LivingRoom from '@/views/LivingRoom.vue'
import Admin from '@/views/Admin.vue'

const routes = [
  {
    path: '/',
    redirect: '/learn'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/learn',
    name: 'Learn',
    component: Learn,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/challenge',
    name: 'ChallengeMode',
    component: ChallengeMode,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/challenge/level-1',
    name: 'ChallengeLevelCalendar',
    component: ChallengeLevelCalendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/challenge/level-2',
    name: 'HomeMap',
    component: HomeMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/challenge/level-2/living-room',
    name: 'LivingRoom',
    component: LivingRoom,
    meta: { requiresAuth: true }
  },
  {
    path: '/translate',
    name: 'Translate',
    component: Translate,
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/group-chat/:id',
    name: 'GroupChat',
    component: GroupChat,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat-group/:id',
    name: 'ChatGroup',
    component: ChatGroup,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/hashtag/:name',
    name: 'HashtagPage',
    component: HashtagPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/private-chat/:id',
    name: 'PrivateChat',
    component: PrivateChat,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getStoredAuthState() {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      if (token) localStorage.removeItem('token')
      if (userStr) localStorage.removeItem('user')
      return { token: null, user: null }
    }

    try {
      return { token, user: JSON.parse(userStr) }
    } catch (error) {
      console.warn('[router] invalid localStorage user payload, clearing it:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return { token: null, user: null }
    }
  } catch (error) {
    console.warn('[router] localStorage unavailable:', error)
    return { token: null, user: null }
  }
}

router.beforeEach((to, from, next) => {
  try {
    const { token, user } = getStoredAuthState()

    if (to.path === '/login' && token) {
      if (user?.role === 'admin') {
        next('/admin')
      } else {
        next('/learn')
      }
      return
    }

    if (to.meta.requiresAuth && !token) {
      next('/login')
      return
    }

    if (to.meta.requiresAdmin && user?.role !== 'admin') {
      next('/learn')
      return
    }

    next()
  } catch (error) {
    console.error('[router] guard failed, fallback to login:', error)
    try {
      localStorage.removeItem('user')
    } catch (e) {
      console.warn('[router] failed to clear user cache:', e)
    }
    next('/login')
  }
})

export default router
