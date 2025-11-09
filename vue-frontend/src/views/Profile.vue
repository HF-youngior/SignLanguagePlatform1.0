<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              👋 手语教学平台
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
            <router-link to="/profile" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">我的</router-link>
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
            <el-avatar :size="100" :src="getAvatarUrl(userInfo.avatar)" class="ring-4 ring-blue-500">
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
            <div class="flex flex-col space-y-2">
              <el-button type="primary" @click="showEditDialog = true">编辑资料</el-button>
              <el-button v-if="isOtherUser" type="success" @click="addFriend">添加好友</el-button>
            </div>
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
                  <el-avatar :size="50" :src="getAvatarUrl(post.avatar)">
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
                    <el-button size="small" type="primary" plain @click="goToPostDetail(post.id)">查看详情</el-button>
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
                  <el-avatar :size="60" :src="getAvatarUrl(group.avatar)" class="mb-4 mx-auto">
                    {{ group.name.charAt(0) }}
                  </el-avatar>
                  <h3 class="text-lg font-semibold mb-2">{{ group.name }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ group.description }}</p>
                  <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>{{ group.members }} 成员</span>
                    <span>{{ group.posts }} 帖子</span>
                  </div>
                  <div class="flex space-x-2">
                    <el-button size="small" type="primary" plain @click="viewGroup(group)">查看</el-button>
                    <el-button size="small" type="danger" plain @click="leaveGroup(group)">退出</el-button>
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
                  <el-avatar :size="60" :src="getAvatarUrl(friend.avatar)" class="mb-4 mx-auto">
                    {{ friend.name.charAt(0) }}
                  </el-avatar>
                  <h3 class="text-lg font-semibold mb-2">{{ friend.name }}</h3>
                  <el-tag size="small" :type="friend.level === '初级' ? 'info' : friend.level === '中级' ? 'warning' : 'success'" class="mb-3">
                    {{ friend.level }}
                  </el-tag>
                  <p class="text-gray-600 text-sm mb-4">{{ friend.bio }}</p>
                  <div class="flex space-x-2">
                    <el-button size="small" type="primary" plain @click="chatWithFriend(friend)">私聊</el-button>
                    <el-button size="small" type="danger" plain @click="deleteFriend(friend)">删除</el-button>
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

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.name" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <div class="flex items-center space-x-4">
            <el-avatar :size="60" :src="getAvatarUrl(editForm.avatar)">{{ editForm.name.charAt(0) }}</el-avatar>
            <input type="file" accept="image/*" @change="handleAvatarUpload" class="hidden" ref="avatarInput">
            <el-button @click="$refs.avatarInput.click()">上传头像</el-button>
          </div>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog v-model="showNotificationDialog" :title="notificationType === 'likes' ? '赞和评论' : '好友信息'" width="600px">
      <div v-if="notificationType === 'likes'" class="space-y-4">
        <div v-for="item in likeComments" :key="item.id" class="flex items-start space-x-3 p-3 border rounded-lg">
          <el-avatar :size="40" :src="getAvatarUrl(item.avatar)">{{ item.username.charAt(0) }}</el-avatar>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-medium">{{ item.username }}</span>
              <el-tag size="small" :type="item.type === 'like' ? 'danger' : 'primary'">
                {{ item.type === 'like' ? '点赞' : '评论' }}
              </el-tag>
              <span class="text-sm text-gray-500">{{ item.time }}</span>
            </div>
            <p class="text-gray-700 text-sm mb-1">{{ item.targetPost }}</p>
            <p v-if="item.commentContent" class="text-blue-600 text-sm">{{ item.commentContent }}</p>
            <el-button size="small" type="primary" plain @click="goToPostDetail(item.targetPostId)">查看帖子</el-button>
          </div>
        </div>
      </div>
      <div v-else-if="notificationType === 'friends'" class="space-y-4">
        <div v-for="item in friendMessages" :key="item.id" class="flex items-start space-x-3 p-3 border rounded-lg">
          <el-avatar :size="40" :src="getAvatarUrl(item.avatar)">{{ item.username.charAt(0) }}</el-avatar>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-medium">{{ item.username }}</span>
              <span class="text-sm text-gray-500">{{ item.time }}</span>
            </div>
            <p class="text-gray-700 text-sm">{{ item.message }}</p>
            <el-button size="small" type="primary" plain @click="chatWithFriend({id: item.userId, name: item.username})">回复消息</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showNotificationDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建群聊对话框 -->
    <el-dialog v-model="showCreateGroupDialog" title="创建新的群聊" width="600px">
      <el-form :model="createGroupForm" label-width="80px">
        <el-form-item label="群名称" required>
          <el-input 
            v-model="createGroupForm.name" 
            placeholder="请输入群名称（限20字符）"
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="群公告">
          <el-input 
            v-model="createGroupForm.announcement" 
            type="textarea" 
            :rows="3"
            placeholder="请输入群公告（可选）"
          ></el-input>
        </el-form-item>
        <el-form-item label="邀请好友">
          <div class="max-h-48 overflow-y-auto border rounded p-3">
            <div v-for="friend in myFriends" :key="friend.id" class="flex items-center space-x-3 mb-2">
              <el-checkbox 
                v-model="createGroupForm.selectedFriends" 
                :label="friend.id"
              ></el-checkbox>
              <el-avatar :size="30" :src="getAvatarUrl(friend.avatar)">{{ friend.name.charAt(0) }}</el-avatar>
              <span class="font-medium">{{ friend.name }}</span>
              <el-tag size="small" :type="friend.level === '初级' ? 'info' : friend.level === '中级' ? 'warning' : 'success'">
                {{ friend.level }}
              </el-tag>
            </div>
          </div>
          <div class="text-sm text-gray-500 mt-2">
            已选择 {{ createGroupForm.selectedFriends.length }} 位好友
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelCreateGroup">取消</el-button>
          <el-button type="primary" @click="createGroup">创建群聊</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAvatarUrl } from '@/utils/avatar'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activeTab = ref('posts')
    const showEditDialog = ref(false)
    const showNotificationDialog = ref(false)
    const showCreateGroupDialog = ref(false)
    const notificationType = ref('')
    const isOtherUser = ref(false)
    const editForm = ref({
      name: '',
      bio: '',
      avatar: ''
    })
    const createGroupForm = ref({
      name: '',
      announcement: '',
      selectedFriends: []
    })

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

    // 详细的通知数据
    const likeComments = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        avatar: '',
        type: 'like',
        time: '2小时前',
        targetPost: '今天学会了"你好"的手语表达',
        targetPostId: 1
      },
      {
        id: 2,
        userId: 2,
        username: '小红',
        avatar: '',
        type: 'comment',
        time: '1小时前',
        targetPost: '分享一个学习心得',
        targetPostId: 2,
        commentContent: '很棒的建议！我也要试试'
      }
    ])

    const friendMessages = ref([
      {
        id: 1,
        userId: 1,
        username: '小明',
        avatar: '',
        time: '30分钟前',
        message: '你好！我想请教一下手语学习的方法'
      },
      {
        id: 2,
        userId: 2,
        username: '小红',
        avatar: '',
        time: '2小时前',
        message: '谢谢你的分享，很有帮助！'
      }
    ])

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
      showCreateGroupDialog.value = true
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

    // 编辑资料功能
    const editProfile = () => {
      showEditDialog.value = true
      editForm.value = {
        name: userInfo.value.name,
        bio: userInfo.value.bio,
        avatar: userInfo.value.avatar
      }
    }

    // 保存编辑
    const saveEdit = () => {
      userInfo.value.name = editForm.value.name
      userInfo.value.bio = editForm.value.bio
      userInfo.value.avatar = editForm.value.avatar
      showEditDialog.value = false
      ElMessage.success('资料更新成功！')
    }

    // 头像上传
    const handleAvatarUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          editForm.value.avatar = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // 添加好友
    const addFriend = () => {
      ElMessageBox.confirm(
        `确定要添加 ${userInfo.value.name} 为好友吗？`,
        '添加好友',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      ).then(() => {
        ElMessage.success('好友请求已发送！')
      }).catch(() => {
        ElMessage.info('已取消')
      })
    }

    // 显示通知详情
    const showNotifications = (type) => {
      notificationType.value = type
      showNotificationDialog.value = true
    }

    // 退出群聊
    const leaveGroup = (group) => {
      ElMessageBox.confirm(
        `确定要退出群聊"${group.name}"吗？`,
        '退出群聊',
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
        }
      ).then(() => {
        myGroups.value = myGroups.value.filter(g => g.id !== group.id)
        userInfo.value.groups -= 1
        ElMessage.success('已退出群聊')
      }).catch(() => {
        ElMessage.info('已取消')
      })
    }

    // 查看群聊
    const viewGroup = (group) => {
      router.push(`/chat-group/${group.id}`)
    }

    // 私聊好友
    const chatWithFriend = (friend) => {
      router.push(`/private-chat/${friend.id}`)
    }

    // 删除好友
    const deleteFriend = (friend) => {
      ElMessageBox.confirm(
        `确定要删除好友"${friend.name}"吗？`,
        '删除好友',
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
        }
      ).then(() => {
        myFriends.value = myFriends.value.filter(f => f.id !== friend.id)
        userInfo.value.friends -= 1
        ElMessage.success('已删除好友')
      }).catch(() => {
        ElMessage.info('已取消')
      })
    }

    // 跳转到帖子详情
    const goToPostDetail = (postId) => {
      router.push(`/post/${postId}`)
    }

    // 创建群聊
    const createGroup = () => {
      if (createGroupForm.value.name.trim()) {
        const newGroup = {
          id: Date.now(),
          name: createGroupForm.value.name,
          description: createGroupForm.value.announcement || '暂无群公告',
          members: createGroupForm.value.selectedFriends.length + 1, // +1 for creator
          posts: 0,
          avatar: ''
        }
        
        myGroups.value.push(newGroup)
        userInfo.value.groups += 1
        
        // 重置表单
        createGroupForm.value = {
          name: '',
          announcement: '',
          selectedFriends: []
        }
        
        showCreateGroupDialog.value = false
        ElMessage.success('群聊创建成功！')
        
        // 跳转到新创建的群聊
        router.push(`/chat-group/${newGroup.id}`)
      } else {
        ElMessage.warning('请输入群名称')
      }
    }

    // 取消创建群聊
    const cancelCreateGroup = () => {
      createGroupForm.value = {
        name: '',
        announcement: '',
        selectedFriends: []
      }
      showCreateGroupDialog.value = false
    }

    onMounted(() => {
      // 检查是否是其他用户的个人主页
      const userId = route.params.id
      if (userId && userId !== 'me') {
        isOtherUser.value = true
        // 这里可以根据userId加载其他用户的信息
        document.title = `${userInfo.value.name}的个人主页 - 手语教学平台`
      } else {
        document.title = '我的主页 - 手语教学平台'
      }
    })

    return {
      activeTab,
      showEditDialog,
      showNotificationDialog,
      showCreateGroupDialog,
      notificationType,
      isOtherUser,
      editForm,
      createGroupForm,
      userInfo,
      myPosts,
      myGroups,
      myFriends,
      achievements,
      notifications,
      likeComments,
      friendMessages,
      getPrivacyType,
      getPrivacyText,
      viewPostDetail,
      createNewGroup,
      showNotifications,
      markAllAsRead,
      editProfile,
      saveEdit,
      handleAvatarUpload,
      addFriend,
      getAvatarUrl,
      leaveGroup,
      viewGroup,
      chatWithFriend,
      deleteFriend,
      goToPostDetail,
      createGroup,
      cancelCreateGroup
    }
  },
  mounted() {
    document.title = '我的主页 - 手语教学平台'
  }
}
</script>
