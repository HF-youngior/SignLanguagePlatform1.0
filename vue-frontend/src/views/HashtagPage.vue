<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <el-button @click="goBack" icon="ArrowLeft" circle></el-button>
            <router-link to="/" class="text-2xl font-bold text-blue-600">手语教学平台</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-blue-600">首页</router-link>
            <router-link to="/community" class="text-gray-600 hover:text-blue-600">社区</router-link>
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
        <!-- 话题头部 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">#</div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ hashtagName }}</h1>
              <p class="text-gray-600 mt-2">{{ hashtagPosts.length }} 条讨论 · {{ totalViews }} 次浏览</p>
            </div>
          </div>
        </div>

        <!-- 帖子列表 -->
        <div class="space-y-4">
          <el-card v-for="post in hashtagPosts" :key="post.id" class="hover:shadow-lg transition-shadow">
            <div class="flex items-start space-x-4">
              <el-avatar :size="50" :src="post.avatar" class="cursor-pointer" @click="goToProfile(post.userId)">
                {{ post.username.charAt(0) }}
              </el-avatar>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-semibold cursor-pointer hover:text-blue-600" @click="goToProfile(post.userId)">
                    {{ post.username }}
                  </span>
                  <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                    {{ post.level }}
                  </el-tag>
                  <span class="text-gray-500 text-sm">{{ post.time }}</span>
                </div>
                <p class="text-gray-700 mb-3" v-html="highlightHashtags(post.content)"></p>
                
                <!-- 显示帖子中的图片 -->
                <div v-if="post.images && post.images.length > 0" class="mb-3">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <img v-for="image in post.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80">
                  </div>
                </div>

                <!-- 显示帖子中的视频 -->
                <div v-if="post.videos && post.videos.length > 0" class="mb-3">
                  <video v-for="video in post.videos" :key="video.id" :src="video.url" class="w-full max-w-md rounded border" controls></video>
                </div>

                <div class="flex items-center space-x-4 text-gray-500 text-sm">
                  <span class="flex items-center cursor-pointer hover:text-blue-600" @click="toggleCommentInput(post.id)">
                    <el-icon class="mr-1"><ChatDotRound /></el-icon>
                    {{ post.comments }} 评论
                  </span>
                  <span class="flex items-center cursor-pointer hover:text-red-600">
                    <el-icon class="mr-1"><Like /></el-icon>
                    {{ post.likes }} 点赞
                  </span>
                  <span class="flex items-center cursor-pointer hover:text-gray-600">
                    <el-icon class="mr-1"><View /></el-icon>
                    {{ post.views }} 浏览
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

        <!-- 空状态 -->
        <div v-if="hashtagPosts.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg">暂无相关讨论</div>
          <p class="text-gray-500 mt-2">成为第一个讨论这个话题的人吧！</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'HashtagPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const hashtagName = ref('')
    const hashtagPosts = ref([])
    const totalViews = ref(0)

    // 模拟话题相关帖子数据
    const allPosts = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        level: '初级',
        time: '2小时前',
        content: '今天学会了#手语字母学习，感觉很有成就感！大家有什么学习技巧可以分享吗？',
        avatar: '',
        comments: 5,
        likes: 12,
        views: 156,
        images: [],
        videos: []
      },
      {
        id: 2,
        userId: 2,
        username: '小红',
        level: '中级',
        time: '4小时前',
        content: '分享一个#日常对话的心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！',
        avatar: '',
        comments: 8,
        likes: 23,
        views: 89,
        images: [],
        videos: []
      },
      {
        id: 3,
        userId: 3,
        username: '老师',
        level: '高级',
        time: '6小时前',
        content: '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！#学习心得',
        avatar: '',
        comments: 15,
        likes: 45,
        views: 67,
        images: [],
        videos: []
      },
      {
        id: 4,
        userId: 4,
        username: '小李',
        level: '初级',
        time: '8小时前',
        content: '#AI翻译功能真的很实用！可以帮助我快速理解手语内容。',
        avatar: '',
        comments: 3,
        likes: 8,
        views: 45,
        images: [],
        videos: []
      },
      {
        id: 5,
        userId: 5,
        username: '小王',
        level: '中级',
        time: '1天前',
        content: '制定了一个详细的#学习计划，每天学习新的手语词汇。',
        avatar: '',
        comments: 7,
        likes: 18,
        views: 32,
        images: [],
        videos: []
      }
    ])

    // 高亮话题标签
    const highlightHashtags = (content) => {
      return content.replace(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g, '<span class="text-blue-600 font-medium">$&</span>')
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 跳转到个人主页
    const goToProfile = (userId) => {
      router.push(`/profile/${userId}`)
    }

    // 切换评论输入框显示
    const toggleCommentInput = (postId) => {
      ElMessage.info('评论功能开发中...')
    }

    // 计算综合热度
    const calculateHotScore = (post) => {
      return post.views * 0.3 + post.likes * 0.4 + post.comments * 0.3
    }

    onMounted(() => {
      hashtagName.value = decodeURIComponent(route.params.name)
      
      // 过滤包含该话题的帖子
      hashtagPosts.value = allPosts.value
        .filter(post => post.content.includes(`#${hashtagName.value}`))
        .sort((a, b) => calculateHotScore(b) - calculateHotScore(a))
      
      // 计算总浏览量
      totalViews.value = hashtagPosts.value.reduce((sum, post) => sum + post.views, 0)
      
      document.title = `#${hashtagName.value} - 手语教学平台`
    })

    return {
      hashtagName,
      hashtagPosts,
      totalViews,
      goBack,
      goToProfile,
      toggleCommentInput,
      highlightHashtags
    }
  }
}
</script>
