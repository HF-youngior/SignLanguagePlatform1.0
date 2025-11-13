<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <el-button @click="goBack" icon="ArrowLeft" circle></el-button>
            <router-link to="/" class="text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              👋 手语教学平台
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">社区</router-link>
            <router-link to="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
              我的
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8 fade-in">
          <h1 class="text-4xl font-bold text-blue-700 mb-2 animate-fade-in-down">
            💬 私信聊天
          </h1>
        </div>

        <!-- 聊天头部 -->
        <el-card class="mb-6">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="getAvatarUrl(friendInfo.avatar)" class="cursor-pointer" @click="goToProfile">
              {{ friendInfo.name.charAt(0) }}
            </el-avatar>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900">{{ friendInfo.name }}</h1>
              <p class="text-gray-600">{{ friendInfo.level }} · {{ friendInfo.isOnline ? '在线' : '离线' }}</p>
            </div>
            <div>
              <el-tag :type="friendInfo.level === '初级' ? 'info' : friendInfo.level === '中级' ? 'warning' : 'success'">
                {{ friendInfo.level }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 聊天区域 -->
        <el-card>
          <template #header>
            <span class="text-lg font-semibold">💭 消息</span>
          </template>
          <!-- 消息列表 -->
          <div class="p-6 max-h-96 overflow-y-auto chat-container">
            <div class="space-y-4">
              <div v-for="message in messages" :key="message.id" 
                   :class="['flex', message.isMe ? 'justify-end' : 'justify-start']">
                <div :class="['flex items-end space-x-2 max-w-xs lg:max-w-md', message.isMe ? 'flex-row-reverse space-x-reverse' : '']">
                  <el-avatar :size="35" :src="getAvatarUrl(message.avatar)" class="flex-shrink-0">
                    {{ message.username.charAt(0) }}
                  </el-avatar>
                  <div :class="['rounded-lg p-3 message-bubble', message.isMe ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-800']">
                    <p class="text-sm">{{ message.content }}</p>
                    <div v-if="message.images && message.images.length > 0" class="mt-2">
                      <img v-for="image in message.images" :key="image.id" :src="image.url" :alt="image.name" class="w-32 h-24 object-cover rounded border cursor-pointer hover:opacity-80" @click="openImageModal(image.url)">
                    </div>
                    <div v-if="message.videos && message.videos.length > 0" class="mt-2">
                      <video v-for="video in message.videos" :key="video.id" :src="video.url" class="w-40 h-24 rounded border" controls></video>
                    </div>
                    <p :class="['text-xs mt-1', message.isMe ? 'text-blue-100' : 'text-gray-500']">{{ message.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息发送区域 -->
          <div class="border-t p-6">
            <div class="space-y-4">
              <el-input
                v-model="newMessage"
                type="textarea"
                :rows="2"
                placeholder="输入消息..."
                @keydown.enter.prevent="sendMessage"
              ></el-input>
              <div class="flex justify-between items-center">
                <div class="flex space-x-2">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    style="display: none"
                    @change="handleImageUpload"
                  >
                  <el-button size="small" :icon="Picture" @click="imageInput.click()">图片</el-button>
                  
                  <input
                    ref="videoInput"
                    type="file"
                    accept="video/*"
                    multiple
                    style="display: none"
                    @change="handleVideoUpload"
                  >
                  <el-button size="small" :icon="VideoCamera" @click="videoInput.click()">视频</el-button>
                </div>
                <el-button type="primary" @click="sendMessage">发送</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8 mt-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { Picture, VideoCamera } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'

export default {
  name: 'PrivateChat',
  components: {
    Picture,
    VideoCamera
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const newMessage = ref('')
    const uploadedImages = ref([])
    const uploadedVideos = ref([])
    const imageInput = ref(null)
    const videoInput = ref(null)

    const friendInfo = ref({
      id: 1,
      name: '小明',
      level: '初级',
      avatar: '',
      isOnline: true
    })

    const messages = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        isMe: false,
        time: '14:30',
        content: '你好！我想请教一下手语学习的方法',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 2,
        userId: 999,
        username: '我',
        isMe: true,
        time: '14:32',
        content: '你好！很高兴认识你。我觉得学习手语最重要的是多练习基础手势',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 3,
        userId: 1,
        username: '小明',
        isMe: false,
        time: '14:35',
        content: '谢谢你的建议！有什么推荐的练习方法吗？',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 4,
        userId: 999,
        username: '我',
        isMe: true,
        time: '14:37',
        content: '我建议每天练习15分钟，可以从基础字母开始。这里有一张练习图',
        avatar: '',
        images: [
          {
            id: 1,
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ5NTk2NyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS4jeS4uueahOWKoOi9vTwvdGV4dD48L3N2Zz4=',
            name: '手语练习图'
          }
        ],
        videos: []
      },
      {
        id: 5,
        userId: 1,
        username: '小明',
        isMe: false,
        time: '14:40',
        content: '太棒了！我会按照你的建议练习的，谢谢！',
        avatar: '',
        images: [],
        videos: []
      }
    ])

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 跳转到个人主页
    const goToProfile = () => {
      router.push(`/profile/${friendInfo.value.id}`)
    }

    // 发送消息
    const sendMessage = () => {
      if (newMessage.value.trim()) {
        const messageObj = {
          id: Date.now(),
          userId: 999, // 当前用户ID
          username: '我',
          isMe: true,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          content: newMessage.value.trim(),
          avatar: '',
          images: [...uploadedImages.value],
          videos: [...uploadedVideos.value]
        }
        
        messages.value.push(messageObj)
        newMessage.value = ''
        uploadedImages.value = []
        uploadedVideos.value = []
        
        // 自动滚动到底部
        setTimeout(() => {
          const chatContainer = document.querySelector('.max-h-96')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)
      } else {
        ElMessage.warning('请输入消息内容')
      }
    }

    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              uploadedImages.value.push({
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name
              })
            }
            reader.readAsDataURL(file)
          } else {
            ElMessage.warning('请选择图片文件')
          }
        })
      }
    }

    // 处理视频上传
    const handleVideoUpload = (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('video/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              uploadedVideos.value.push({
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name
              })
            }
            reader.readAsDataURL(file)
          } else {
            ElMessage.warning('请选择视频文件')
          }
        })
      }
    }

    // 打开图片模态框
    const openImageModal = (imageUrl) => {
      window.open(imageUrl, '_blank')
    }

    onMounted(() => {
      const friendId = route.params.id
      // 这里可以根据friendId加载好友信息
      document.title = `与${friendInfo.value.name}的对话 - 手语教学平台`
      
      // 自动滚动到底部
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      }, 100)
    })

    return {
      newMessage,
      uploadedImages,
      uploadedVideos,
      imageInput,
      videoInput,
      friendInfo,
      messages,
      goBack,
      goToProfile,
      sendMessage,
      handleImageUpload,
      handleVideoUpload,
      openImageModal,
      getAvatarUrl
    }
  }
}
</script>

<style scoped>
/* 动态渐变背景 */
.animated-gradient {
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  min-height: 100vh;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片美化 */
:deep(.el-card) {
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-card:hover) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px) !important;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 16px 20px !important;
  font-weight: 600 !important;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

/* 按钮美化 */
:deep(.el-button) {
  border-radius: 10px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-button:active) {
  transform: translateY(0) !important;
}

/* 按钮类型美化 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
  border: none !important;
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
}

/* 标签美化 */
:deep(.el-tag) {
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-weight: 500 !important;
}

/* 输入框美化 */
:deep(.el-input__wrapper) {
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-textarea__inner) {
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

/* 头像美化 */
:deep(.el-avatar) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-avatar:hover) {
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 导航链接样式 */
.nav-link {
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #2563eb !important;
}

/* 消息气泡样式 */
.message-bubble {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

.message-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px) !important;
}

/* 聊天容器样式 */
.chat-container {
  background: rgba(249, 250, 251, 0.5);
  border-radius: 12px;
}

/* 图片预览样式 */
img.rounded {
  transition: all 0.3s ease;
}

img.rounded:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 视频预览样式 */
video.rounded {
  transition: all 0.3s ease;
}

video.rounded:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 自定义滚动条 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 页脚样式 */
footer {
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .text-4xl {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 768px) {
  .text-4xl {
    font-size: 2rem !important;
  }
  
  .max-w-xs {
    max-width: 100% !important;
  }
}
</style>
