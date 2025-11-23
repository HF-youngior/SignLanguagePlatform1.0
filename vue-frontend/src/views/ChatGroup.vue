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
            💬 群聊
          </h1>
        </div>

        <!-- 群聊信息头部 -->
        <el-card class="mb-6">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="getAvatarUrl(groupInfo.avatar)">
              {{ groupInfo.name.charAt(0) }}
            </el-avatar>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ groupInfo.name }}</h1>
              <p class="text-gray-600">{{ groupInfo.members }} 成员 · {{ groupInfo.activeToday }} 今日活跃</p>
            </div>
          </div>
        </el-card>

        <!-- 聊天区域 -->
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- 聊天内容区域 -->
          <div class="lg:col-span-3 space-y-6">
            <!-- 消息列表 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">💭 消息列表</span>
              </template>
              <div class="space-y-4 max-h-96 overflow-y-auto chat-container">
                <div v-for="message in messages" :key="message.id" class="flex items-start space-x-3">
                  <el-avatar :size="40" :src="getAvatarUrl(message.avatar)" class="cursor-pointer flex-shrink-0" @click="goToProfile(message.userId)">
                    {{ message.username.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-semibold text-sm cursor-pointer hover:text-blue-600" @click="goToProfile(message.userId)">
                        {{ message.username }}
                      </span>
                      <span class="text-gray-500 text-xs">{{ message.time }}</span>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md message-bubble">
                      <p class="text-gray-800 text-sm">{{ message.content }}</p>
                      
                      <!-- 显示图片 -->
                      <div v-if="message.images && message.images.length > 0" class="mt-2">
                        <img v-for="image in message.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80" @click="openImageModal(image.url)">
                      </div>

                      <!-- 显示视频 -->
                      <div v-if="message.videos && message.videos.length > 0" class="mt-2">
                        <video v-for="video in message.videos" :key="video.id" :src="video.url" class="w-full max-w-md rounded border" controls></video>
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
                  :rows="2"
                  placeholder="在群聊中发送消息..."
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
            </el-card>
          </div>

          <!-- 侧边栏 -->
          <div class="space-y-6">
            <!-- 群成员 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">👥 群成员 ({{ groupMembers.length }})</span>
              </template>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div v-for="member in groupMembers" :key="member.id" class="flex items-center space-x-3">
                  <el-avatar :size="35" :src="getAvatarUrl(member.avatar)">
                    {{ member.name.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="font-medium text-sm">{{ member.name }}</div>
                    <div class="text-xs text-gray-500">{{ member.role }}</div>
                  </div>
                  <div v-if="member.isOnline" class="ml-auto">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 群公告 -->
            <el-card>
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold">📋 群公告</span>
                  <el-button v-if="isGroupAdmin" size="small" type="primary" plain @click="showEditAnnouncement = true">编辑</el-button>
                </div>
              </template>
              <div class="text-sm text-gray-600">
                <p>{{ groupInfo.announcement || '暂无群公告' }}</p>
              </div>
            </el-card>

            <!-- 群二维码 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">📱 群二维码</span>
              </template>
              <div class="text-center">
                <div class="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img :src="groupQRCode" alt="群二维码" class="w-32 h-32">
                </div>
                <p class="text-sm text-gray-500 mt-2">扫码加入群聊</p>
                <el-button size="small" type="primary" plain @click="downloadQRCode" class="mt-2">下载二维码</el-button>
              </div>
            </el-card>

            <!-- 群管理 -->
            <el-card v-if="isGroupAdmin">
              <template #header>
                <span class="text-lg font-semibold">⚙️ 群管理</span>
              </template>
              <div class="space-y-3">
                <el-button size="small" type="primary" plain @click="showEditGroupName = true" style="width: 100%">修改群名</el-button>
                <el-button size="small" type="warning" plain @click="showEditAnnouncement = true" style="width: 100%">编辑公告</el-button>
                <el-button size="small" type="danger" plain @click="deleteGroup" style="width: 100%">解散群聊</el-button>
              </div>
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

    <!-- 编辑群名对话框 -->
    <el-dialog v-model="showEditGroupName" title="修改群名称" width="400px">
      <el-form>
        <el-form-item label="群名称">
          <el-input v-model="editGroupName" placeholder="请输入新的群名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditGroupName = false">取消</el-button>
          <el-button type="primary" @click="saveGroupName">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑群公告对话框 -->
    <el-dialog v-model="showEditAnnouncement" title="编辑群公告" width="500px">
      <el-form>
        <el-form-item label="群公告">
          <el-input 
            v-model="editAnnouncement" 
            type="textarea" 
            :rows="4"
            placeholder="请输入群公告"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditAnnouncement = false">取消</el-button>
          <el-button type="primary" @click="saveAnnouncement">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Picture, VideoCamera } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'

export default {
  name: 'ChatGroup',
  components: {
    Picture,
    VideoCamera
  },
  setup() {
    const router = useRouter()
    const newMessage = ref('')
    const uploadedImages = ref([])
    const uploadedVideos = ref([])
    const imageInput = ref(null)
    const videoInput = ref(null)
    const showEditGroupName = ref(false)
    const showEditAnnouncement = ref(false)
    const editGroupName = ref('')
    const editAnnouncement = ref('')
    const isGroupAdmin = ref(true) // 假设当前用户是群主
    const groupQRCode = ref('')

    const groupInfo = ref({
      id: 1,
      name: '手语日常对话',
      members: 234,
      activeToday: 45,
      avatar: ''
    })

    const messages = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        time: '14:30',
        content: '大家好！今天天气真不错',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 2,
        userId: 2,
        username: '小红',
        time: '14:32',
        content: '是啊，适合出去走走',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 3,
        userId: 3,
        username: '老师',
        time: '14:35',
        content: '今天想和大家分享一个手语词汇：天气',
        avatar: '',
        images: [
          {
            id: 1,
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ5NTk2NyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWuoOW5tOeKtuWGmTwvdGV4dD48L3N2Zz4=',
            name: '天气手语'
          }
        ],
        videos: []
      },
      {
        id: 4,
        userId: 4,
        username: '小李',
        time: '14:38',
        content: '谢谢老师！学会了',
        avatar: '',
        images: [],
        videos: []
      },
      {
        id: 5,
        userId: 5,
        username: '小王',
        time: '14:40',
        content: '我也学会了，太棒了！',
        avatar: '',
        images: [],
        videos: []
      }
    ])

    const groupMembers = ref([
      { id: 1, name: '小明', role: '群主', avatar: '', isOnline: true },
      { id: 2, name: '小红', role: '管理员', avatar: '', isOnline: true },
      { id: 3, name: '老师', role: '管理员', avatar: '', isOnline: true },
      { id: 4, name: '小李', role: '成员', avatar: '', isOnline: false },
      { id: 5, name: '小王', role: '成员', avatar: '', isOnline: true },
      { id: 6, name: '小张', role: '成员', avatar: '', isOnline: false },
      { id: 7, name: '小刘', role: '成员', avatar: '', isOnline: true },
      { id: 8, name: '小陈', role: '成员', avatar: '', isOnline: false }
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
        ElMessage.success('消息发送成功！')
        
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

    // 生成群二维码
    const generateQRCode = () => {
      // 这里使用一个简单的二维码生成方法
      // 实际项目中应该使用专业的二维码库
      const qrData = `https://signlanguage-platform.com/join/${groupInfo.value.id}`
      // 使用在线二维码API生成二维码
      groupQRCode.value = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrData)}`
    }

    // 下载二维码
    const downloadQRCode = () => {
      const link = document.createElement('a')
      link.href = groupQRCode.value
      link.download = `${groupInfo.value.name}_二维码.png`
      link.click()
      ElMessage.success('二维码下载成功！')
    }

    // 修改群名
    const saveGroupName = () => {
      if (editGroupName.value.trim()) {
        groupInfo.value.name = editGroupName.value.trim()
        showEditGroupName.value = false
        editGroupName.value = ''
        ElMessage.success('群名称修改成功！')
      } else {
        ElMessage.warning('请输入群名称')
      }
    }

    // 修改群公告
    const saveAnnouncement = () => {
      groupInfo.value.announcement = editAnnouncement.value.trim()
      showEditAnnouncement.value = false
      editAnnouncement.value = ''
      ElMessage.success('群公告修改成功！')
    }

    // 解散群聊
    const deleteGroup = () => {
      ElMessageBox.confirm(
        '确定要解散群聊吗？此操作不可撤销！',
        '解散群聊',
        {
          confirmButtonText: '确定解散',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        ElMessage.success('群聊已解散')
        router.push('/profile')
      }).catch(() => {
        ElMessage.info('已取消')
      })
    }

    onMounted(() => {
      document.title = `${groupInfo.value.name} - 手语教学平台`
      generateQRCode()
      editGroupName.value = groupInfo.value.name
      editAnnouncement.value = groupInfo.value.announcement || ''
    })

    return {
      newMessage,
      uploadedImages,
      uploadedVideos,
      imageInput,
      videoInput,
      groupInfo,
      messages,
      groupMembers,
      goBack,
      goToProfile,
      sendMessage,
      handleImageUpload,
      handleVideoUpload,
      showEditGroupName,
      showEditAnnouncement,
      editGroupName,
      editAnnouncement,
      isGroupAdmin,
      groupQRCode,
      downloadQRCode,
      saveGroupName,
      saveAnnouncement,
      openImageModal,
      getAvatarUrl,
      deleteGroup
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
  padding: 12px;
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
.chat-container::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb:hover,
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
  
  .max-w-xs {
    max-width: 100% !important;
  }
}
</style>
