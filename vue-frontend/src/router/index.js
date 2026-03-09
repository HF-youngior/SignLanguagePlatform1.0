import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '@/views/Welcome.vue'
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
import HomeMap from '@/views/HomeMap.vue'
import LivingRoom from '@/views/LivingRoom.vue'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/learn',
    name: 'Learn',
    component: Learn
  },
  {
    path: '/learn/challenge',
    name: 'ChallengeMode',
    component: ChallengeMode
  },
  {
    path: '/learn/challenge/level-1',
    name: 'ChallengeLevelCalendar',
    component: ChallengeLevelCalendar
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
