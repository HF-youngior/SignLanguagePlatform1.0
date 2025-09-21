<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">手语教学平台</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-blue-600">首页</router-link>
            <router-link to="/learn" class="text-gray-600 hover:text-blue-600">学习</router-link>
            <router-link to="/translate" class="text-gray-600 hover:text-blue-600">翻译</router-link>
            <router-link to="/community" class="text-gray-600 hover:text-blue-600">社区</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 个人信息卡片 -->
        <el-card class="mb-8">
          <div class="flex items-center space-x-6">
            <el-avatar :size="100" :src="userInfo.avatar" class="ring-4 ring-blue-500">
              {{ userInfo.name.charAt(0) }}
            </el-avatar>
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ userInfo.name }}</h1>
              <div class="flex items-center space-x-4 mb-4">
                <el-tag :type="userInfo.level === '初级' ? 'info' : userInfo.level === '中级' ? 'warning' : 'success'">
                  {{ userInfo.level }}
                </el-tag>
                <span class="text-gray-600">{{ userInfo.joinDate }} 加入</span>
                <span class="text-gray-600">{{ userInfo.location }}</span>
              </div>
              <p class="text-gray-700 mb-4">{{ userInfo.bio }}</p>
              <div class="flex items-center space-x-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ userInfo.posts }}</div>
                  <div class="text-sm text-gray-500">发布帖子</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ userInfo.groups }}</div>
                  <div class="text-sm text-gray-500">加入社群</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ userInfo.friends }}</div>
                  <div class="text-sm text-gray-500">好友数量</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-600">{{ userInfo.points }}</div>
                  <div class="text-sm text-gray-500">积分</div>
                </div>
              </div>
            </div>
            <el-button type="primary" @click="editProfile">编辑资料</el-button>
          </div>
        </el-card>

        <!-- 提示栏 -->
        <el-card class="mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <!-- 赞和评论 -->
              <div class="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors" @click="showNotifications('likes')">
                <div class="relative">
                  <el-icon class="text-blue-600" size="20"><ChatDotRound /></el-icon>
                  <el-badge :value="notifications.likes + notifications.comments" class="ml-2" v-if="notifications.likes + notifications.comments > 0"></el-badge>
                </div>
                <div>
                  <div class="font-medium">赞和评论</div>
                  <div class="text-sm text-gray-500">{{ notifications.likes + notifications.comments }} 条新消息</div>
                </div>
              </div>

              <!-- 好友信息 -->
              <div class="flex items-center space-x-2 cursor-pointer hover:bg-green-50 p-3 rounded-lg transition-colors" @click="showNotifications('friends')">
                <div class="relative">
                  <el-icon class="text-green-600" size="20"><User /></el-icon>
                  <el-badge :value="notifications.friendRequests + notifications.friendMessages" class="ml-2" v-if="notifications.friendRequests + notifications.friendMessages > 0"></el-badge>
                </div>
                <div>
                  <div class="font-medium">好友信息</div>
                  <div class="text-sm text-gray-500">{{ notifications.friendRequests + notifications.friendMessages }} 条新消息</div>
                </div>
              </div>
            </div>
            
            <!-- 全部标记为已读 -->
            <el-button size="small" type="primary" plain @click="markAllAsRead">全部标记为已读</el-button>
          </div>
        </el-card>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="mb-6">
          <el-tab-pane label="我的帖子" name="posts">
            <div class="space-y-4">
              <el-card v-for="post in myPosts" :key="post.id" class="hover:shadow-lg transition-shadow">
                <div class="flex items-start space-x-4">
                  <el-avatar :size="50" :src="post.avatar">
                    {{ post.username.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="font-semibold">{{ post.username }}</span>
                      <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                        {{ post.level }}
                      </el-tag>
                      <span class="text-gray-500 text-sm">{{ post.time }}</span>
                      <el-tag size="small" :type="getPrivacyType(post.privacy)" class="ml-2">
                        {{ getPrivacyText(post.privacy) }}
                      </el-tag>
                    </div>
                    <p class="text-gray-700 mb-3">{{ post.content }}</p>
                    <div class="flex items-center space-x-4 text-gray-500 text-sm">
                      <span class="flex items-center">
                        <el-icon class="mr-1"><ChatDotRound /></el-icon>
                        {{ post.comments }} 评论
                      </span>
                      <span class="flex items-center">
                        <el-icon class="mr-1"><Like /></el-icon>
                        {{ post.likes }} 点赞
                      </span>
                      <span class="flex items-center">
                        <el-icon class="mr-1"><View /></el-icon>
                        {{ post.views }} 浏览
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2" @click.stop>
                    <el-button size="small" type="primary" plain @click="viewPostDetail(post.id)">查看详情</el-button>
                    <el-button size="small" type="danger" plain>删除</el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="我的社群" name="groups">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <el-card v-for="group in myGroups" :key="group.id" class="hover:shadow-lg transition-shadow">
                <div class="text-center">
                  <el-avatar :size="60" :src="group.avatar" class="mb-4 mx-auto">
                    {{ group.name.charAt(0) }}
                  </el-avatar>
                  <h3 class="text-lg font-semibold mb-2">{{ group.name }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ group.description }}</p>
                  <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>{{ group.members }} 成员</span>
                    <span>{{ group.posts }} 帖子</span>
                  </div>
                  <div class="flex space-x-2">
                    <el-button size="small" type="primary" plain>查看</el-button>
                    <el-button size="small" type="danger" plain>退出</el-button>
                  </div>
                </div>
              </el-card>
              
              <!-- 创建新群聊卡片 -->
              <el-card class="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500" @click="createNewGroup">
                <div class="text-center py-8">
                  <div class="text-4xl text-blue-400 mb-4">+</div>
                  <h3 class="text-lg font-semibold text-blue-600 mb-2">创建新的群聊</h3>
                  <p class="text-gray-500 text-sm">创建一个新的学习群聊，邀请朋友一起交流</p>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="我的好友" name="friends">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <el-card v-for="friend in myFriends" :key="friend.id" class="hover:shadow-lg transition-shadow">
                <div class="text-center">
                  <el-avatar :size="60" :src="friend.avatar" class="mb-4 mx-auto">
                    {{ friend.name.charAt(0) }}
                  </el-avatar>
                  <h3 class="text-lg font-semibold mb-2">{{ friend.name }}</h3>
                  <el-tag size="small" :type="friend.level === '初级' ? 'info' : friend.level === '中级' ? 'warning' : 'success'" class="mb-3">
                    {{ friend.level }}
                  </el-tag>
                  <p class="text-gray-600 text-sm mb-4">{{ friend.bio }}</p>
                  <div class="flex space-x-2">
                    <el-button size="small" type="primary" plain>私聊</el-button>
                    <el-button size="small" type="danger" plain>删除</el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="学习成就" name="achievements">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <el-card v-for="achievement in achievements" :key="achievement.id" class="hover:shadow-lg transition-shadow">
                <div class="text-center">
                  <div class="text-4xl mb-4">{{ achievement.icon }}</div>
                  <h3 class="text-lg font-semibold mb-2">{{ achievement.title }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ achievement.description }}</p>
                  <div class="flex items-center justify-center">
                    <el-tag :type="achievement.unlocked ? 'success' : 'info'">
                      {{ achievement.unlocked ? '已获得' : '未获得' }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const activeTab = ref('posts')

    const userInfo = ref({
      name: '张三',
      avatar: '',
      level: '中级',
      joinDate: '2024年1月',
      location: '北京市',
      bio: '热爱手语学习，希望通过这个平台结识更多朋友，一起进步！',
      posts: 12,
      groups: 5,
      friends: 28,
      points: 1250
    })

    const myPosts = ref([
      {
        id: 1,
        username: '张三',
        level: '中级',
        time: '2小时前',
        content: '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？',
        avatar: '',
        comments: 5,
        likes: 12,
        views: 89,
        privacy: 'public'
      },
      {
        id: 2,
        username: '张三',
        level: '中级',
        time: '1天前',
        content: '分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！',
        avatar: '',
        comments: 8,
        likes: 23,
        views: 156,
        privacy: 'friends'
      },
      {
        id: 3,
        username: '张三',
        level: '中级',
        time: '3天前',
        content: '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！',
        avatar: '',
        comments: 15,
        likes: 45,
        views: 234,
        privacy: 'public'
      }
    ])

    const myGroups = ref([
      {
        id: 1,
        name: '初学者互助组',
        description: '帮助新手快速入门手语学习',
        members: 156,
        posts: 89,
        avatar: ''
      },
      {
        id: 2,
        name: '聋健交流组',
        description: '聋人朋友与听力正常朋友交流的平台',
        members: 120,
        posts: 156,
        avatar: ''
      },
      {
        id: 3,
        name: '手语文化分享组',
        description: '分享手语文化和艺术',
        members: 80,
        posts: 67,
        avatar: ''
      },
      {
        id: 4,
        name: '中级进阶组',
        description: '中级学习者进阶交流',
        members: 89,
        posts: 45,
        avatar: ''
      }
    ])

    const myFriends = ref([
      {
        id: 1,
        name: '小明',
        level: '初级',
        bio: '刚开始学习手语，请多指教！',
        avatar: ''
      },
      {
        id: 2,
        name: '小红',
        level: '高级',
        bio: '手语老师，愿意帮助大家学习',
        avatar: ''
      },
      {
        id: 3,
        name: '小李',
        level: '中级',
        bio: '热爱手语文化，喜欢交流',
        avatar: ''
      },
      {
        id: 4,
        name: '小王',
        level: '初级',
        bio: '聋人朋友，一起学习进步',
        avatar: ''
      }
    ])

    const achievements = ref([
      {
        id: 1,
        icon: '🎯',
        title: '初学者',
        description: '发布第一个帖子',
        unlocked: true
      },
      {
        id: 2,
        icon: '💬',
        title: '活跃用户',
        description: '发布10个帖子',
        unlocked: true
      },
      {
        id: 3,
        icon: '👥',
        title: '社交达人',
        description: '添加20个好友',
        unlocked: true
      },
      {
        id: 4,
        icon: '🏆',
        title: '学习标兵',
        description: '获得1000积分',
        unlocked: true
      },
      {
        id: 5,
        icon: '🌟',
        title: '社区贡献者',
        description: '获得50个点赞',
        unlocked: false
      },
      {
        id: 6,
        icon: '🎖️',
        title: '资深会员',
        description: '加入平台超过1年',
        unlocked: false
      }
    ])

    const notifications = ref({
      likes: 5,
      comments: 3,
      friendRequests: 2,
      friendMessages: 4
    })

    const getPrivacyType = (privacy) => {
      switch (privacy) {
        case 'public': return 'success'
        case 'friends': return 'warning'
        case 'private': return 'info'
        default: return 'success'
      }
    }

    const getPrivacyText = (privacy) => {
      switch (privacy) {
        case 'public': return '公开'
        case 'friends': return '仅好友可见'
        case 'private': return '仅自己可见'
        default: return '公开'
      }
    }

    const viewPostDetail = (postId) => {
      // 跳转到帖子详情页面
      router.push(`/post/${postId}`)
    }

    const createNewGroup = () => {
      ElMessage.info('创建群聊功能开发中...')
    }

    const showNotifications = (type) => {
      if (type === 'likes') {
        ElMessage.info('查看赞和评论详情功能开发中...')
      } else if (type === 'friends') {
        ElMessage.info('查看好友信息详情功能开发中...')
      }
    }

    const markAllAsRead = () => {
      notifications.value = {
        likes: 0,
        comments: 0,
        friendRequests: 0,
        friendMessages: 0
      }
      ElMessage.success('已标记所有消息为已读')
    }

    const editProfile = () => {
      ElMessage.info('编辑资料功能开发中...')
    }

    return {
      activeTab,
      userInfo,
      myPosts,
      myGroups,
      myFriends,
      achievements,
      notifications,
      getPrivacyType,
      getPrivacyText,
      viewPostDetail,
      createNewGroup,
      showNotifications,
      markAllAsRead,
      editProfile
    }
  },
  mounted() {
    document.title = '我的主页 - 手语教学平台'
  }
}
</script>
