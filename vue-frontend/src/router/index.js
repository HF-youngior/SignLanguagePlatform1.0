import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Learn from '@/views/Learn.vue'
import Translate from '@/views/Translate.vue'
import Community from '@/views/Community.vue'
import Profile from '@/views/Profile.vue'
import PostDetail from '@/views/PostDetail.vue'
import GroupChat from '@/views/GroupChat.vue'
import ChatGroup from '@/views/ChatGroup.vue'
import HashtagPage from '@/views/HashtagPage.vue'
import PrivateChat from '@/views/PrivateChat.vue'
import ChallengeMode from '@/views/ChallengeMode.vue'
import ChallengeLevelCalendar from '@/views/ChallengeLevelCalendar.vue'
import Admin from '@/views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
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
    component: HomeMap
  },
  {
    path: '/learn/challenge/level-2/living-room',
    name: 'LivingRoom',
    component: LivingRoom
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
    component: Profile,
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // 如果已登录且访问登录页，跳转到首页
  if (to.path === '/' && token) {
    if (user?.role === 'admin') {
      next('/admin')
    } else {
      next('/home')
    }
    return
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !token) {
    next('/')
    return
  }

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/home')
    return
  }

  next()
})

export default router