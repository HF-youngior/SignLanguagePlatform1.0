import { createRouter, createWebHistory } from 'vue-router'
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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail
  },
  {
    path: '/group-chat/:id',
    name: 'GroupChat',
    component: GroupChat
  },
  {
    path: '/chat-group/:id',
    name: 'ChatGroup',
    component: ChatGroup
  },
  {
    path: '/profile/:id',
    name: 'UserProfile',
    component: Profile
  },
  {
    path: '/hashtag/:name',
    name: 'HashtagPage',
    component: HashtagPage
  },
  {
    path: '/private-chat/:id',
    name: 'PrivateChat',
    component: PrivateChat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
