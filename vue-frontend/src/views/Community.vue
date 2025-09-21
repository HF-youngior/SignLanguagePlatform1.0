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
            <router-link to="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              我的
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">👥 我的社区</h1>
          <p class="text-xl text-gray-600">我在这里有话说</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 发布动态 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">分享你的学习心得</span>
              </template>
              <div class="space-y-4">
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="分享你的学习心得、遇到的问题或者学习技巧..."
                  v-model="newPost"
                ></el-input>
                <div class="flex justify-between items-center">
                  <div class="flex space-x-2">
                    <el-button size="small" icon="Picture">图片</el-button>
                    <el-button size="small" icon="VideoCamera">视频</el-button>
                  </div>
                  <el-button type="primary" @click="publishPost">发布</el-button>
                </div>
              </div>
            </el-card>

            <!-- 动态列表 -->
            <div class="space-y-4">
              <el-card v-for="post in posts" :key="post.id" class="hover:shadow-lg transition-shadow">
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
                    </div>
                    <p class="text-gray-700 mb-3">{{ post.content }}</p>
                    <div class="flex items-center space-x-4 text-gray-500 text-sm">
                      <span class="flex items-center cursor-pointer hover:text-blue-600">
                        <el-icon class="mr-1"><ChatDotRound /></el-icon>
                        {{ post.comments }} 评论
                      </span>
                      <span class="flex items-center cursor-pointer hover:text-red-600">
                        <el-icon class="mr-1"><Like /></el-icon>
                        {{ post.likes }} 点赞
                      </span>
                      <span class="flex items-center cursor-pointer hover:text-green-600">
                        <el-icon class="mr-1"><Share /></el-icon>
                        分享
                      </span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="space-y-6">
            <!-- 聋健互通组别 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🤝 聋健互通</span>
              </template>
              <div class="space-y-3">
                <div v-for="group in deafHearingGroups" :key="group.id" class="flex items-center space-x-3">
                  <el-avatar :size="40" :src="group.avatar" :class="group.type === 'deaf' ? 'ring-2 ring-green-500' : 'ring-2 ring-blue-500'">
                    {{ group.name.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员</div>
                    <div class="text-xs text-gray-400">{{ group.description }}</div>
                  </div>
                  <el-button size="small" type="success" plain>加入</el-button>
                </div>
              </div>
            </el-card>

            <!-- 热门话题 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🔥 热门话题</span>
              </template>
              <div class="space-y-2">
                <div v-for="topic in hotTopics" :key="topic.id" class="flex items-center justify-between">
                  <span class="text-blue-600 cursor-pointer hover:underline">{{ topic.name }}</span>
                  <el-tag size="small" type="danger">{{ topic.count }}</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 热门群聊 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🔥 热门群聊</span>
              </template>
              <div class="space-y-3">
                <div v-for="group in hotChatGroups" :key="group.id" class="flex items-center space-x-3">
                  <el-avatar :size="40" :src="group.avatar">{{ group.name.charAt(0) }}</el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员 · {{ group.activeToday }} 今日活跃</div>
                  </div>
                  <el-button size="small" type="primary" plain>加入</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
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
import { ElMessage } from 'element-plus'

export default {
  name: 'Community',
  setup() {
    const newPost = ref('')

    const posts = ref([
      {
        id: 1,
        username: '小明',
        level: '初级',
        time: '2小时前',
        content: '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？',
        avatar: '',
        comments: 5,
        likes: 12
      },
      {
        id: 2,
        username: '小红',
        level: '中级',
        time: '4小时前',
        content: '分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！',
        avatar: '',
        comments: 8,
        likes: 23
      },
      {
        id: 3,
        username: '老师',
        level: '高级',
        time: '6小时前',
        content: '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！',
        avatar: '',
        comments: 15,
        likes: 45
      }
    ])


    const hotTopics = ref([
      { id: 1, name: '#手语字母学习', count: 156 },
      { id: 2, name: '#日常对话', count: 89 },
      { id: 3, name: '#学习心得', count: 67 },
      { id: 4, name: '#AI翻译', count: 45 },
      { id: 5, name: '#学习计划', count: 32 },
      { id: 6, name: '#聋健交流', count: 78 },
      { id: 7, name: '#聋人文化', count: 56 },
      { id: 8, name: '#手语差异', count: 43 }
    ])

    const hotChatGroups = ref([
      { id: 1, name: '手语日常对话', members: 234, activeToday: 45, avatar: '' },
      { id: 2, name: 'AI翻译讨论组', members: 189, activeToday: 38, avatar: '' },
      { id: 3, name: '聋人文化分享', members: 167, activeToday: 32, avatar: '' },
      { id: 4, name: '手语学习打卡', members: 298, activeToday: 67, avatar: '' },
      { id: 5, name: '新手指南群', members: 145, activeToday: 28, avatar: '' }
    ])

    const deafHearingGroups = ref([
      { id: 1, name: '聋健交流组', members: 120, avatar: '', type: 'mixed', description: '聋人朋友与听力正常朋友交流的平台' },
      { id: 2, name: '聋人文化分享组', members: 80, avatar: '', type: 'deaf', description: '分享聋人文化、艺术、生活经验' },
      { id: 3, name: '手语差异讨论组', members: 95, avatar: '', type: 'mixed', description: '讨论教学手语与聋人实际使用手语的差异' },
      { id: 4, name: '聋人生活现状组', members: 65, avatar: '', type: 'mixed', description: '了解聋人的日常生活、工作、学习现状' }
    ])

    const publishPost = () => {
      if (newPost.value.trim()) {
        console.log('发布动态:', newPost.value)
        newPost.value = ''
        ElMessage.success('发布成功！')
      }
    }

    return {
      newPost,
      posts,
      hotTopics,
      hotChatGroups,
      deafHearingGroups,
      publishPost
    }
  },
  mounted() {
    document.title = '我的社区 - 手语教学平台'
  }
}
</script>
