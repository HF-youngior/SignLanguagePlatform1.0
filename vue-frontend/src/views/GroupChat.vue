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
            <router-link to="/home" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
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
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8 fade-in">
          <h1 class="text-4xl font-bold text-blue-700 mb-2 animate-fade-in-down">
            💬 小组聊天
          </h1>
        </div>

        <!-- 小组信息头部 -->
        <el-card class="mb-6">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="getAvatarUrl(groupInfo.avatar)">
              {{ groupInfo.name.charAt(0) }}
            </el-avatar>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ groupInfo.name }}</h1>
              <p class="text-gray-600">{{ groupInfo.description }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{{ groupInfo.members }} 成员</span>
                <span>{{ groupInfo.type === 'deaf' ? '聋人组' : groupInfo.type === 'mixed' ? '聋健混合组' : '听力组' }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 论坛式聊天区域 -->
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-3 space-y-6">
            <!-- 消息列表 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">💬 消息列表</span>
              </template>
              <div class="space-y-6 max-h-96 overflow-y-auto">
                <div v-for="message in messages" :key="message.id" class="border-b border-gray-200 pb-6 last:border-b-0">
                  <div class="flex items-start space-x-4">
                    <el-avatar :size="45" :src="getAvatarUrl(message.avatar)" class="cursor-pointer" @click="goToProfile(message.userId)">
                      {{ message.username.charAt(0) }}
                    </el-avatar>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <span class="font-semibold cursor-pointer hover:text-blue-600" @click="goToProfile(message.userId)">
                          {{ message.username }}
                        </span>
                        <el-tag size="small" :type="message.level === '初级' ? 'info' : message.level === '中级' ? 'warning' : 'success'">
                          {{ message.level }}
                        </el-tag>
                        <span class="text-gray-500 text-sm">{{ message.time }}</span>
                      </div>
                      <p class="text-gray-700 mb-3">{{ message.content }}</p>
                      
                      <!-- 显示图片 -->
                      <div v-if="message.images && message.images.length > 0" class="mb-3">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <img v-for="image in message.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80" @click="openImageModal(image.url)">
                        </div>
                      </div>

                      <!-- 显示视频 -->
                      <div v-if="message.videos && message.videos.length > 0" class="mb-3">
                        <video v-for="video in message.videos" :key="video.id" :src="video.url" class="w-full max-w-md rounded border" controls></video>
                      </div>

                      <div class="flex items-center space-x-4 text-gray-500 text-sm mb-4">
                        <span class="flex items-center cursor-pointer hover:text-blue-600" @click="toggleReply(message.id)">
                          <el-icon class="mr-1"><ChatDotRound /></el-icon>
                          {{ message.replies.length }} 回复
                        </span>
                        <span class="flex items-center cursor-pointer hover:text-red-600">
                          <span class="mr-1 text-lg">❤️</span>
                          {{ message.likes }} 点赞
                        </span>
                      </div>

                      <!-- 回复区域 -->
                      <div v-if="showReplyInput === message.id" class="mt-4">
                        <el-input
                          v-model="newReply"
                          type="textarea"
                          :rows="2"
                          placeholder="写下你的回复..."
                          class="mb-2"
                        ></el-input>
                        <div class="flex justify-end space-x-2">
                          <el-button size="small" @click="showReplyInput = null">取消</el-button>
                          <el-button size="small" type="primary" @click="sendReply(message.id)">发送回复</el-button>
                        </div>
                      </div>

                      <!-- 回复列表 -->
                      <div v-if="message.replies && message.replies.length > 0" class="mt-4 ml-8 border-l-2 border-gray-200 pl-4">
                        <div v-for="reply in message.replies" :key="reply.id" class="mb-3">
                          <div class="flex items-start space-x-3">
                            <el-avatar :size="30" :src="getAvatarUrl(reply.avatar)" class="cursor-pointer" @click="goToProfile(reply.userId)">
                              {{ reply.username.charAt(0) }}
                            </el-avatar>
                            <div class="flex-1">
                              <div class="flex items-center space-x-2 mb-1">
                                <span class="font-medium text-sm cursor-pointer hover:text-blue-600" @click="goToProfile(reply.userId)">
                                  {{ reply.username }}
                                </span>
                                <span class="text-gray-500 text-xs">{{ reply.time }}</span>
                              </div>
                              <p class="text-gray-700 text-sm">{{ reply.content }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 消息发送区域 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">✍️ 发送消息</span>
              </template>
              <div class="space-y-4">
                <el-input
                  v-model="newMessage"
                  type="textarea"
                  :rows="3"
                  placeholder="在小组中分享你的想法..."
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
                  <el-button type="primary" @click="sendMessage">发送消息</el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 侧边栏 -->
          <div class="space-y-6">
            <!-- 在线成员 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">👥 在线成员 ({{ onlineMembers.length }})</span>
              </template>
              <div class="space-y-3">
                <div v-for="member in onlineMembers" :key="member.id" class="flex items-center space-x-3">
                  <el-avatar :size="35" :src="getAvatarUrl(member.avatar)">
                    {{ member.name.charAt(0) }}
                  </el-avatar>
                  <div>
                    <div class="font-medium text-sm">{{ member.name }}</div>
                    <div class="text-xs text-green-500">在线</div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 小组规则 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">📋 小组规则</span>
              </template>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• 尊重每位成员的发言权</li>
                <li>• 禁止发布不当内容</li>
                <li>• 鼓励积极讨论学习心得</li>
                <li>• 保持友善的交流氛围</li>
              </ul>
            </el-card>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Picture, VideoCamera, ChatDotRound } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'

export default {
  name: 'GroupChat',
  components: {
    Picture,
    VideoCamera,
    ChatDotRound
  },
  setup() {
    const router = useRouter()
    const newMessage = ref('')
    const newReply = ref('')
    const showReplyInput = ref(null)
    const uploadedImages = ref([])
    const uploadedVideos = ref([])
    const imageInput = ref(null)
    const videoInput = ref(null)

    const groupInfo = ref({
      id: 1,
      name: '聋健交流组',
      description: '聋人朋友与听力正常朋友交流的平台',
      members: 120,
      type: 'mixed',
      avatar: ''
    })

    const messages = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        level: '初级',
        time: '2小时前',
        content: '大家好！我是新来的，想学习手语，有什么建议吗？',
        avatar: '',
        likes: 5,
        replies: [
          {
            id: 1,
            userId: 2,
            username: '小红',
            content: '欢迎！建议从基础字母开始学习',
            time: '1小时前',
            avatar: ''
          }
        ],
        images: [],
        videos: []
      },
      {
        id: 2,
        userId: 3,
        username: '老师',
        level: '高级',
        time: '4小时前',
        content: '今天想和大家分享一个学习技巧：每天坚持15分钟练习比一次性练习2小时效果更好！',
        avatar: '',
        likes: 12,
        replies: [],
        images: [
          {
            id: 1,
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ5NTk2NyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPueVjOeoi++8jOeUt+Wls+eahOWKoOi9vTwvdGV4dD48L3N2Zz4=',
            name: '学习技巧图'
          }
        ],
        videos: []
      }
    ])

    const onlineMembers = ref([
      { id: 1, name: '小明', avatar: '' },
      { id: 2, name: '小红', avatar: '' },
      { id: 3, name: '老师', avatar: '' },
      { id: 4, name: '小李', avatar: '' },
      { id: 5, name: '小王', avatar: '' }
    ])

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 跳转到个人主页
    const goToProfile = (userId) => {
      router.push(`/profile/${userId}`)
    }

    // 发送消息
    const sendMessage = () => {
      if (newMessage.value.trim()) {
        const messageObj = {
          id: Date.now(),
          userId: 999, // 当前用户ID
          username: '我',
          level: '初级',
          time: '刚刚',
          content: newMessage.value.trim(),
          avatar: '',
          likes: 0,
          replies: [],
          images: [...uploadedImages.value],
          videos: [...uploadedVideos.value]
        }
        
        messages.value.push(messageObj)
        newMessage.value = ''
        uploadedImages.value = []
        uploadedVideos.value = []
        ElMessage.success('消息发送成功！')
      } else {
        ElMessage.warning('请输入消息内容')
      }
    }

    // 发送回复
    const sendReply = (messageId) => {
      if (newReply.value.trim()) {
        const message = messages.value.find(m => m.id === messageId)
        if (message) {
          const replyObj = {
            id: Date.now(),
            userId: 999,
            username: '我',
            content: newReply.value.trim(),
            time: '刚刚',
            avatar: ''
          }
          
          message.replies.push(replyObj)
          newReply.value = ''
          showReplyInput.value = null
          ElMessage.success('回复发送成功！')
        }
      } else {
        ElMessage.warning('请输入回复内容')
      }
    }

    // 切换回复输入框
    const toggleReply = (messageId) => {
      showReplyInput.value = showReplyInput.value === messageId ? null : messageId
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
      document.title = `${groupInfo.value.name} - 手语教学平台`
    })

    return {
      newMessage,
      newReply,
      showReplyInput,
      uploadedImages,
      uploadedVideos,
      imageInput,
      videoInput,
      groupInfo,
      messages,
      onlineMembers,
      goBack,
      goToProfile,
      sendMessage,
      sendReply,
      toggleReply,
      getAvatarUrl,
      handleImageUpload,
      handleVideoUpload,
      openImageModal
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

/* 评论区域样式 */
.border-t {
  border-color: rgba(102, 126, 234, 0.2) !important;
}

/* 回复区域样式 */
.border-l-2 {
  border-color: rgba(102, 126, 234, 0.3) !important;
}

/* 图标悬停效果 */
.el-icon {
  transition: all 0.3s ease;
}

.el-icon:hover {
  transform: scale(1.1);
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
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
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
  
  .grid-cols-2 {
    grid-template-columns: 1fr !important;
  }
}
</style>
