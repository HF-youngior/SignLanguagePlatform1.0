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
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 聊天头部 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="friendInfo.avatar" class="cursor-pointer" @click="goToProfile">
              {{ friendInfo.name.charAt(0) }}
            </el-avatar>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ friendInfo.name }}</h1>
              <p class="text-gray-600">{{ friendInfo.level }} · {{ friendInfo.isOnline ? '在线' : '离线' }}</p>
            </div>
            <div class="ml-auto">
              <el-tag :type="friendInfo.level === '初级' ? 'info' : friendInfo.level === '中级' ? 'warning' : 'success'">
                {{ friendInfo.level }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="bg-white rounded-lg shadow-md">
          <!-- 消息列表 -->
          <div class="p-6 max-h-96 overflow-y-auto">
            <div class="space-y-4">
              <div v-for="message in messages" :key="message.id" 
                   :class="['flex', message.isMe ? 'justify-end' : 'justify-start']">
                <div :class="['flex items-end space-x-2 max-w-xs lg:max-w-md', message.isMe ? 'flex-row-reverse space-x-reverse' : '']">
                  <el-avatar :size="35" :src="message.avatar" class="flex-shrink-0">
                    {{ message.username.charAt(0) }}
                  </el-avatar>
                  <div :class="['rounded-lg p-3', message.isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800']">
                    <p class="text-sm">{{ message.content }}</p>
                    <div v-if="message.images && message.images.length > 0" class="mt-2">
                      <img v-for="image in message.images" :key="image.id" :src="image.url" :alt="image.name" class="w-32 h-24 object-cover rounded border cursor-pointer hover:opacity-80">
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
                  <el-button size="small" icon="Picture" @click="imageInput.click()">图片</el-button>
                  
                  <input
                    ref="videoInput"
                    type="file"
                    accept="video/*"
                    multiple
                    style="display: none"
                    @change="handleVideoUpload"
                  >
                    <el-button size="small" icon="VideoCamera" @click="videoInput.click()">视频</el-button>
                </div>
                <el-button type="primary" @click="sendMessage">发送</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'PrivateChat',
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

    onMounted(() => {
      const friendId = route.params.id
      // 这里可以根据friendId加载好友信息
      document.title = `与${friendInfo.value.name}的对话 - 手语教学平台`
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
      handleVideoUpload
    }
  }
}
</script>
