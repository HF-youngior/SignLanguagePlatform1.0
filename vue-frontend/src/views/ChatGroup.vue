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
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">手语圈</router-link>
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
              <div class="space-y-4 max-h-96 overflow-y-auto chat-container" ref="messageContainer">
                <div v-for="message in messages" :key="message.id" 
                     :class="['flex items-start space-x-3', message.isSelf ? 'flex-row-reverse space-x-reverse' : '']">
                  <el-avatar :size="40" :src="getAvatarUrl(message.avatar)" class="cursor-pointer flex-shrink-0" @click="goToProfile(message.userId)">
                    {{ message.username.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1" :class="message.isSelf ? 'text-right' : ''">
                    <div class="flex items-center space-x-2 mb-1" :class="message.isSelf ? 'flex-row-reverse space-x-reverse' : ''">
                      <span class="font-semibold text-sm cursor-pointer hover:text-blue-600" @click="goToProfile(message.userId)">
                        {{ message.username }}
                      </span>
                      <span class="text-gray-500 text-xs">{{ message.time }}</span>
                    </div>
                    <div :class="['rounded-lg p-3 max-w-xs lg:max-w-md message-bubble inline-block text-left', 
                                   message.isSelf ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800']">
                      <p class="text-sm">{{ message.content }}</p>
                      
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
import { useRouter, useRoute } from 'vue-router'
import { Picture, VideoCamera } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'
import apiService from '@/services/api'

export default {
  name: 'ChatGroup',
  components: {
    Picture,
    VideoCamera
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const groupId = ref(route.params.id || 1)
    const newMessage = ref('')
    const uploadedImages = ref([])
    const uploadedVideos = ref([])
    const imageInput = ref(null)
    const videoInput = ref(null)
    const showEditGroupName = ref(false)
    const showEditAnnouncement = ref(false)
    const editGroupName = ref('')
    const editAnnouncement = ref('')
    const isGroupAdmin = ref(false)
    const groupQRCode = ref('')
    const isLoading = ref(false)

    const groupInfo = ref({
      id: 1,
      name: '手语日常对话',
      members: 0,
      activeToday: 0,
      avatar: '',
      announcement: ''
    })

    const messages = ref([])
    const groupMembers = ref([])

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 跳转到个人主页
    const goToProfile = (userId) => {
      router.push(`/profile/${userId}`)
    }

    // 加载群组信息
    const loadGroupInfo = async () => {
      try {
        isLoading.value = true
        const response = await apiService.getGroupDetail(groupId.value)
        if (response.success) {
          const { group, members } = response.data
          groupInfo.value = {
            ...group,
            activeToday: Math.floor(Math.random() * 20) + 5 // 模拟今日活跃数
          }
          
          // 处理群成员数据
          groupMembers.value = members.map(member => ({
            id: member.user_id,
            name: member.first_name || member.username,
            role: member.role === 'admin' ? '管理员' : '成员',
            avatar: member.avatar,
            isOnline: Math.random() > 0.3 // 模拟在线状态
          }))
          
          // 检查当前用户是否是管理员
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.id
          const currentMember = members.find(m => m.user_id === currentUserId)
          isGroupAdmin.value = currentMember?.role === 'admin'
        } else {
          // 如果API失败，使用模拟数据
          const currentUser = JSON.parse(localStorage.getItem('user')) || {}
          groupMembers.value = [
            {
              id: 3,
              name: '测试1',
              role: '管理员',
              avatar: '',
              isOnline: true
            },
            {
              id: 4,
              name: '王伟',
              role: '成员',
              avatar: '',
              isOnline: true
            },
            {
              id: 5,
              name: '李华',
              role: '成员',
              avatar: '',
              isOnline: false
            },
            {
              id: 6,
              name: '张明',
              role: '成员',
              avatar: '',
              isOnline: true
            },
            {
              id: 7,
              name: '刘芳',
              role: '成员',
              avatar: '',
              isOnline: false
            },
            {
              id: 8,
              name: '陈静',
              role: '成员',
              avatar: '',
              isOnline: true
            },
            {
              id: 9,
              name: '赵强',
              role: '成员',
              avatar: '',
              isOnline: false
            },
            // 添加当前用户到群成员列表
            {
              id: currentUser.id || 999,
              name: currentUser.first_name || '社区',
              role: '成员',
              avatar: currentUser.avatar || '',
              isOnline: true
            }
          ]
        }
      } catch (error) {
        ElMessage.error('加载群组信息失败')
        console.error('加载群组信息错误:', error)
        // 出错时使用模拟数据
        const currentUser = JSON.parse(localStorage.getItem('user')) || {}
        groupMembers.value = [
          {
            id: 3,
            name: '测试1',
            role: '管理员',
            avatar: '',
            isOnline: true
          },
          {
            id: 4,
            name: '王伟',
            role: '成员',
            avatar: '',
            isOnline: true
          },
          {
            id: 5,
            name: '李华',
            role: '成员',
            avatar: '',
            isOnline: false
          },
          {
            id: 6,
            name: '张明',
            role: '成员',
            avatar: '',
            isOnline: true
          },
          {
            id: 7,
            name: '刘芳',
            role: '成员',
            avatar: '',
            isOnline: false
          },
          {
            id: 8,
            name: '陈静',
            role: '成员',
            avatar: '',
            isOnline: true
          },
          {
            id: 9,
            name: '赵强',
            role: '成员',
            avatar: '',
            isOnline: false
          },
          // 添加当前用户到群成员列表
          {
            id: currentUser.id || 999,
            name: currentUser.first_name || '社区',
            role: '成员',
            avatar: currentUser.avatar || '',
            isOnline: true
          }
        ]
      } finally {
        isLoading.value = false
      }
    }

    // 加载群聊消息
    const loadMessages = async () => {
      try {
        isLoading.value = true
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id
        
        // 先加载示例消息
        const sampleMessages = [
          {
            id: 1,
            userId: 3,
            username: '王伟',
            time: '14:30',
            content: '大家好！今天天气真不错，适合学习手语',
            avatar: '',
            images: [],
            videos: [],
            isSelf: false
          },
          {
            id: 2,
            userId: 4,
            username: '李华',
            time: '14:32',
            content: '是啊，我刚学会了一个新的手语词汇',
            avatar: '',
            images: [],
            videos: [],
            isSelf: false
          },
          {
            id: 3,
            userId: currentUserId || 999,
            username: '测试1',
            time: '14:35',
            content: '大家好！我是测试1，很高兴加入这个群组',
            avatar: '',
            images: [],
            videos: [],
            isSelf: true
          },
          {
            id: 4,
            userId: 5,
            username: '张明',
            time: '14:38',
            content: '欢迎新成员！有什么不懂的可以随时问我们',
            avatar: '',
            images: [],
            videos: [],
            isSelf: false
          },
          {
            id: 5,
            userId: 6,
            username: '刘芳',
            time: '14:40',
            content: '今天想和大家分享一个手语词汇：天气 ☀️',
            avatar: '',
            images: [
              {
                id: 1,
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0ZGNjM0NyIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lrqDlvbHnirbpgYc8L3RleHQ+PC9zdmc+',
                name: '天气手语'
              }
            ],
            videos: [],
            isSelf: false
          },
          {
            id: 6,
            userId: currentUserId || 999,
            username: '测试1',
            time: '14:42',
            content: '谢谢分享！这个手势我学会了 🙏',
            avatar: '',
            images: [],
            videos: [],
            isSelf: true
          },
          {
            id: 7,
            userId: 7,
            username: '陈静',
            time: '14:45',
            content: '大家平时都是怎么练习手语的？',
            avatar: '',
            images: [],
            videos: [],
            isSelf: false
          },
          {
            id: 8,
            userId: 8,
            username: '赵强',
            time: '14:48',
            content: '我每天都会看视频学习，然后对着镜子练习',
            avatar: '',
            images: [],
            videos: [],
            isSelf: false
          }
        ]
        
        // 尝试从API获取消息，如果失败则使用示例消息
        try {
          const response = await apiService.getGroupMessages(groupId.value)
          if (response.success && response.data.messages.length > 0) {
            messages.value = response.data.messages.map(msg => ({
              ...msg,
              isSelf: msg.userId === currentUserId
            }))
          } else {
            // 处理示例消息，根据当前用户ID计算isSelf
            messages.value = sampleMessages.map(msg => ({
              ...msg,
              isSelf: msg.userId === currentUserId
            }))
          }
        } catch (apiError) {
          console.log('API获取消息失败，使用示例消息:', apiError)
          // 处理示例消息，根据当前用户ID计算isSelf
          messages.value = sampleMessages.map(msg => ({
            ...msg,
            isSelf: msg.userId === currentUserId
          }))
        }
        
        // 滚动到底部
        setTimeout(() => {
          const chatContainer = document.querySelector('.max-h-96')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)
      } catch (error) {
        ElMessage.error('加载群聊消息失败')
        console.error('加载群聊消息错误:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 发送消息
    const sendMessage = async () => {
      if (newMessage.value.trim() || uploadedImages.value.length > 0 || uploadedVideos.value.length > 0) {
        try {
          isLoading.value = true
          const currentUser = JSON.parse(localStorage.getItem('user')) || {}
          
          // 创建本地消息对象（立即显示）
          const localMessage = {
            id: Date.now(),
            userId: currentUser.id || 999,
            username: currentUser.first_name || '测试1',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            content: newMessage.value.trim(),
            avatar: currentUser.avatar || '',
            images: [...uploadedImages.value],
            videos: [...uploadedVideos.value],
            isSelf: true,
            isSynced: false // 添加同步状态
          }
          
          // 立即添加到消息列表
          const messageIndex = messages.value.push(localMessage) - 1
          
          // 清空输入
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
          
          // 尝试发送到服务器
          try {
            const response = await apiService.sendGroupMessage(groupId.value, {
              content: localMessage.content,
              images: localMessage.images,
              videos: localMessage.videos
            })
            
            if (response.success) {
              // 更新消息的同步状态
              messages.value[messageIndex].isSynced = true
              ElMessage.success('消息发送成功！')
            }
          } catch (apiError) {
            console.log('API发送消息失败，但已本地显示:', apiError)
            ElMessage.warning('消息已显示，但同步到服务器失败')
            // 可以添加重试机制
            setTimeout(() => {
              retrySendMessage(messageIndex)
            }, 3000)
          }
        } catch (error) {
          ElMessage.error('消息发送失败')
          console.error('发送消息错误:', error)
        } finally {
          isLoading.value = false
        }
      } else {
        ElMessage.warning('请输入消息内容')
      }
    }

    // 重试发送消息
    const retrySendMessage = async (messageIndex) => {
      try {
        const message = messages.value[messageIndex]
        if (message && !message.isSynced) {
          const response = await apiService.sendGroupMessage(groupId.value, {
            content: message.content,
            images: message.images,
            videos: message.videos
          })
          
          if (response.success) {
            messages.value[messageIndex].isSynced = true
            ElMessage.success('消息同步成功！')
          }
        }
      } catch (error) {
        console.log('重试发送消息失败:', error)
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
    const saveGroupName = async () => {
      if (editGroupName.value.trim()) {
        try {
          isLoading.value = true
          const response = await apiService.updateGroup(groupId.value, {
            name: editGroupName.value.trim()
          })
          
          if (response.success) {
            groupInfo.value.name = editGroupName.value.trim()
            showEditGroupName.value = false
            editGroupName.value = ''
            ElMessage.success('群名称修改成功！')
          }
        } catch (error) {
          ElMessage.error('修改群名称失败')
          console.error('修改群名称错误:', error)
        } finally {
          isLoading.value = false
        }
      } else {
        ElMessage.warning('请输入群名称')
      }
    }

    // 修改群公告
    const saveAnnouncement = async () => {
      try {
        isLoading.value = true
        const response = await apiService.updateGroup(groupId.value, {
          description: editAnnouncement.value.trim()
        })
        
        if (response.success) {
          groupInfo.value.announcement = editAnnouncement.value.trim()
          showEditAnnouncement.value = false
          editAnnouncement.value = ''
          ElMessage.success('群公告修改成功！')
        }
      } catch (error) {
        ElMessage.error('修改群公告失败')
        console.error('修改群公告错误:', error)
      } finally {
        isLoading.value = false
      }
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
      ).then(async () => {
        try {
          isLoading.value = true
          const response = await apiService.dissolveGroup(groupId.value)
          if (response.success) {
            ElMessage.success('群聊已解散')
            router.push('/profile')
          }
        } catch (error) {
          ElMessage.error('解散群聊失败')
          console.error('解散群聊错误:', error)
        } finally {
          isLoading.value = false
        }
      }).catch(() => {
        ElMessage.info('已取消')
      })
    }

    onMounted(async () => {
      await loadGroupInfo()
      await loadMessages()
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
      deleteGroup,
      isLoading
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

/* 消息气泡样式 - 微信风格 */
.message-bubble {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
}

.message-bubble:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 自己的消息气泡 - 蓝色 */
.message-bubble.bg-blue-500 {
  background: linear-gradient(135deg, #95ec69 0%, #95ec69 100%) !important;
  color: #000 !important;
  border-radius: 12px 12px 4px 12px !important;
}

/* 别人的消息气泡 - 灰色 */
.message-bubble.bg-gray-100 {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%) !important;
  color: #000 !important;
  border-radius: 12px 12px 12px 4px !important;
}

/* 聊天容器样式 - 微信风格背景 */
.chat-container {
  background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
  border-radius: 12px;
  padding: 16px;
  min-height: 400px;
}

/* 消息项动画 */
.chat-container > div {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自己的消息动画 - 从右边滑入 */
.flex-row-reverse {
  animation: messageSlideInRight 0.3s ease-out;
}

@keyframes messageSlideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 别人的消息动画 - 从左边滑入 */
:not(.flex-row-reverse) {
  animation: messageSlideInLeft 0.3s ease-out;
}

@keyframes messageSlideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
