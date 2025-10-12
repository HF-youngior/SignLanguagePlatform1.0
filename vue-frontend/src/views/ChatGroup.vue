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
        <!-- 群聊信息头部 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="groupInfo.avatar">
              {{ groupInfo.name.charAt(0) }}
            </el-avatar>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ groupInfo.name }}</h1>
              <p class="text-gray-600">{{ groupInfo.members }} 成员 · {{ groupInfo.activeToday }} 今日活跃</p>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- 聊天内容区域 -->
          <div class="lg:col-span-3">
            <!-- 消息列表 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6 max-h-96 overflow-y-auto">
              <div class="space-y-4">
                <div v-for="message in messages" :key="message.id" class="flex items-start space-x-3">
                  <el-avatar :size="40" :src="message.avatar" class="cursor-pointer flex-shrink-0" @click="goToProfile(message.userId)">
                    {{ message.username.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-semibold text-sm cursor-pointer hover:text-blue-600" @click="goToProfile(message.userId)">
                        {{ message.username }}
                      </span>
                      <span class="text-gray-500 text-xs">{{ message.time }}</span>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md">
                      <p class="text-gray-800 text-sm">{{ message.content }}</p>
                      
                      <!-- 显示图片 -->
                      <div v-if="message.images && message.images.length > 0" class="mt-2">
                        <img v-for="image in message.images" :key="image.id" :src="image.url" :alt="image.name" class="w-32 h-24 object-cover rounded border cursor-pointer hover:opacity-80">
                      </div>

                      <!-- 显示视频 -->
                      <div v-if="message.videos && message.videos.length > 0" class="mt-2">
                        <video v-for="video in message.videos" :key="video.id" :src="video.url" class="w-40 h-24 rounded border" controls></video>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 消息发送区域 -->
            <div class="bg-white rounded-lg shadow-md p-6">
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

          <!-- 侧边栏 -->
          <div class="space-y-6">
            <!-- 群成员 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold mb-4">群成员 ({{ groupMembers.length }})</h3>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div v-for="member in groupMembers" :key="member.id" class="flex items-center space-x-3">
                  <el-avatar :size="35" :src="member.avatar">
                    {{ member.name.charAt(0) }}
                  </el-avatar>
                  <div>
                    <div class="font-medium text-sm">{{ member.name }}</div>
                    <div class="text-xs text-gray-500">{{ member.role }}</div>
                  </div>
                  <div v-if="member.isOnline" class="ml-auto">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 群公告 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">群公告</h3>
                <el-button v-if="isGroupAdmin" size="small" type="primary" plain @click="showEditAnnouncement = true">编辑</el-button>
              </div>
              <div class="text-sm text-gray-600">
                <p>{{ groupInfo.announcement || '暂无群公告' }}</p>
              </div>
            </div>

            <!-- 群二维码 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold mb-4">群二维码</h3>
              <div class="text-center">
                <div class="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img :src="groupQRCode" alt="群二维码" class="w-32 h-32">
                </div>
                <p class="text-sm text-gray-500 mt-2">扫码加入群聊</p>
                <el-button size="small" type="primary" plain @click="downloadQRCode" class="mt-2">下载二维码</el-button>
              </div>
            </div>

            <!-- 群管理 -->
            <div v-if="isGroupAdmin" class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold mb-4">群管理</h3>
              <div class="space-y-3">
                <el-button size="small" type="primary" plain @click="showEditGroupName = true">修改群名</el-button>
                <el-button size="small" type="warning" plain @click="showEditAnnouncement = true">编辑公告</el-button>
                <el-button size="small" type="danger" plain @click="deleteGroup">解散群聊</el-button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

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

export default {
  name: 'ChatGroup',
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
      deleteGroup
    }
  }
}
</script>
