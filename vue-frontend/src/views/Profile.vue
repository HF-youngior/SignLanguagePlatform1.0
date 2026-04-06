<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <!-- 手机端返回按钮 -->
          <router-link to="/community" class="lg:hidden mr-4">
            <el-button type="primary" plain size="small">
              返回
            </el-button>
          </router-link>
          
          <div class="flex items-center flex-1">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          
          <!-- 电脑端导航链接 -->
          <div class="hidden lg:flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">手语圈</router-link>
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
          <div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <el-avatar :size="isMobile ? 80 : 100" :src="getAvatarUrl(userInfo.avatar)" class="ring-4 ring-blue-500 flex-shrink-0">
              {{ userInfo.name.charAt(0) }}
            </el-avatar>
            <div class="flex-1 w-full md:w-auto text-center md:text-left">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{{ userInfo.name }}</h1>
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 md:space-x-4 mb-4">
                <el-tag :type="userInfo.level === '初级' ? 'info' : userInfo.level === '中级' ? 'warning' : 'success'">
                  {{ userInfo.level }}
                </el-tag>
                <span class="text-gray-600 text-sm">{{ userInfo.joinDate }} 加入</span>
                <span class="text-gray-600 text-sm">{{ userInfo.location }}</span>
              </div>
              <p class="text-gray-700 mb-4 text-sm md:text-base px-2 md:px-0">{{ userInfo.bio }}</p>
              <div class="grid grid-cols-4 gap-2 md:grid-cols-4 md:flex md:items-center md:space-x-4 gap-0">
                <div class="text-center">
                  <div class="text-lg md:text-xl font-bold text-blue-600">{{ userInfo.posts }}</div>
                  <div class="text-xs text-gray-500">发布帖子</div>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl font-bold text-green-600">{{ userInfo.groups }}</div>
                  <div class="text-xs text-gray-500">加入社群</div>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl font-bold text-purple-600">{{ userInfo.friends }}</div>
                  <div class="text-xs text-gray-500">好友数量</div>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl font-bold text-orange-600">{{ userInfo.points }}</div>
                  <div class="text-xs text-gray-500">积分</div>
                </div>
              </div>
            </div>
            <div class="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 w-full md:w-auto justify-center md:justify-start">
              <el-button type="primary" size="mini" class="md:w-full" @click="showEditDialog = true">编辑资料</el-button>
              <el-button v-if="isOtherUser" type="success" size="mini" class="md:w-full" @click="addFriend">添加好友</el-button>
              <el-button type="danger" size="mini" class="md:w-full" @click="logout">退出登录</el-button>
            </div>
          </div>
        </el-card>

        <!-- 提示栏 -->
        <el-card class="mb-6">
          <div class="space-y-4">
            <!-- 赞和评论和好友消息 -->
            <div class="grid grid-cols-2 gap-3">
              <!-- 赞和评论 -->
              <div class="border rounded-lg p-2 cursor-pointer hover:bg-blue-50 transition-colors" @click="showNotifications('likes')">
                <div class="text-center">
                  <div class="font-medium text-sm">赞和评论</div>
                  <div class="text-xs text-gray-500">{{ notifications.likes + notifications.comments }} 条新消息</div>
                </div>
              </div>

              <!-- 好友信息 -->
              <div class="border rounded-lg p-2 cursor-pointer hover:bg-green-50 transition-colors" @click="showNotifications('friends')">
                <div class="text-center">
                  <div class="font-medium text-sm">好友消息</div>
                  <div class="text-xs text-gray-500">{{ notifications.friendRequests + notifications.friendMessages }} 条新消息</div>
                </div>
              </div>
            </div>
            
            <!-- 全部标记为已读 -->
            <div class="text-center">
              <el-button size="small" type="primary" plain class="w-full" @click="markAllAsRead">全部标记为已读</el-button>
            </div>
          </div>
        </el-card>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="mb-6">
          <el-tab-pane label="我的帖子" name="posts">
            <div class="space-y-4 md:space-y-6">
              <el-card v-for="post in myPosts" :key="post.id" class="hover:shadow-lg transition-shadow">
                <div class="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                  <!-- 头像区域 -->
                  <el-avatar :size="isMobile ? 60 : 50" :src="getAvatarUrl(post.avatar)" class="flex-shrink-0">
                    {{ post.username.charAt(0) }}
                  </el-avatar>

                  <!-- 内容区域 -->
                  <div class="flex-1 w-full min-w-0">
                    <!-- 用户信息和标签 -->
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <span class="font-semibold text-base md:text-lg">{{ post.username }}</span>
                      <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                        {{ post.level }}
                      </el-tag>
                      <span class="text-gray-500 text-xs md:text-sm">{{ post.time }}</span>
                      <el-tag size="small" :type="getPrivacyType(post.privacy)">
                        {{ getPrivacyText(post.privacy) }}
                      </el-tag>
                    </div>

                    <!-- 帖子内容 -->
                    <p class="text-gray-700 mb-3 text-sm md:text-base leading-relaxed">{{ post.content }}</p>

                    <!-- 互动统计 -->
                    <div class="flex flex-wrap items-center gap-3 md:gap-4 text-gray-500 text-xs md:text-sm mb-3">
                      <span class="flex items-center">
                        <el-icon class="mr-1"><ChatDotRound /></el-icon>
                        {{ post.comments }} 评论
                      </span>
                      <span class="flex items-center cursor-pointer hover:text-red-600" @click.stop="toggleLike(post)">
                        <span class="mr-1 text-lg" :class="{ 'text-red-500': post.isLiked }">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                        <span :class="post.isLiked ? 'text-red-500' : ''">{{ post.likes }}</span>
                      </span>
                      <span class="flex items-center">
                        <el-icon class="mr-1"><View /></el-icon>
                        {{ post.views }} 浏览
                      </span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex flex-row md:flex-col gap-2 w-full md:w-auto justify-end md:justify-start" @click.stop>
                    <el-button size="small" type="primary" plain class="flex-1 md:flex-none" @click="goToPostDetail(post.id)">查看详情</el-button>
                    <el-button size="small" type="danger" plain class="flex-1 md:flex-none">删除</el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="我的社群" name="groups">
            <el-tabs v-model="groupTab" type="card" class="mb-4">
              <el-tab-pane label="我创建的群聊" name="created">
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <el-card v-for="group in createdGroups" :key="group.id" class="hover:shadow-lg transition-shadow">
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
                        <el-button size="small" type="warning" plain @click="showGroupOptions(group)">管理</el-button>
                      </div>
                    </div>
                  </el-card>
                </div>
              </el-tab-pane>

              <el-tab-pane label="我加入的群聊" name="joined">
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <el-card v-for="group in joinedGroups" :key="group.id" class="hover:shadow-lg transition-shadow">
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
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 创建新群聊卡片 -->
            <el-card class="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500" @click="createNewGroup">
              <div class="text-center py-8">
                <div class="text-4xl text-blue-400 mb-4">+</div>
                <h3 class="text-lg font-semibold text-blue-600 mb-2">创建新的群聊</h3>
                <p class="text-gray-500 text-sm">创建一个新的学习群聊，邀请朋友一起交流</p>
              </div>
            </el-card>
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

    <!-- 群组管理对话框 -->
    <el-dialog v-model="showGroupManageDialog" title="群组管理" width="500px">
      <div class="mb-4">
        <p class="text-gray-600 mb-4">您是群主，可以选择以下操作：</p>
        <div class="space-y-3">
          <el-button type="danger" class="w-full" @click="confirmDissolveGroup">解散群组</el-button>
          <el-button type="warning" class="w-full" @click="showTransferDialog = true">转让群主</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 转让群主对话框 -->
    <el-dialog v-model="showTransferDialog" title="转让群主" width="500px">
      <div class="mb-4">
        <p class="text-gray-600 mb-4">选择要转让给哪个成员：</p>
        <el-select v-model="selectedNewOwner" placeholder="请选择新群主" class="w-full">
          <el-option
            v-for="member in groupMembers"
            :key="member.id"
            :label="member.first_name || member.username"
            :value="member.user_id"
          >
            <div class="flex items-center">
              <el-avatar :size="24" :src="getAvatarUrl(member.avatar)" class="mr-2">
                {{ (member.first_name || member.username).charAt(0) }}
              </el-avatar>
              <span>{{ member.first_name || member.username }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTransferDialog = false">取消</el-button>
          <el-button type="primary" @click="transferOwnership">确认转让</el-button>
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

    <!-- 移动端底部导航栏 -->
    <div class="mobile-bottom-nav">
      <router-link to="/learn" class="mobile-nav-item">
        <span class="mobile-nav-icon">📚</span>
        <span class="mobile-nav-text">学堂</span>
      </router-link>
      <router-link to="/translate" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔤</span>
        <span class="mobile-nav-text">译站</span>
      </router-link>
      <router-link to="/community" class="mobile-nav-item">
        <span class="mobile-nav-icon">💬</span>
        <span class="mobile-nav-text">手语圈</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, User, Star, View } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'
import { handleImageUploadWithCompression } from '@/utils/imageCompressor'
import apiService from '@/services/api'

export default {
  name: 'Profile',
  components: {
    ChatDotRound,
    User,
    Star,
    View
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isMobile = ref(window.innerWidth <= 768)
    const activeTab = ref('posts')
    const groupTab = ref('created')
    const showEditDialog = ref(false)
    const showNotificationDialog = ref(false)
    const showCreateGroupDialog = ref(false)
    const showGroupManageDialog = ref(false)
    const showTransferDialog = ref(false)
    const notificationType = ref('')
    const isOtherUser = ref(false)
    let handleResize
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
      name: '',
      avatar: '',
      level: '中级',
      joinDate: '',
      location: '北京市',
      bio: '暂无个人简介',
      posts: 0,
      groups: 0,
      friends: 0,
      points: 0
    })

    const myPosts = ref([])

    const myGroups = ref([])

    const myFriends = ref([])

    const selectedGroup = ref(null)
    const groupMembers = ref([])
    const selectedNewOwner = ref(null)

    // 加载用户信息
    const loadUserInfo = async () => {
      try {
        const response = await apiService.getUserProfile()
        if (response.success) {
          const userData = response.data
          // 优先使用first_name，如果没有则使用username
          const displayName = userData.first_name || userData.username

          userInfo.value = {
            name: displayName,
            avatar: userData.avatar,
            level: '中级',
            joinDate: new Date(userData.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
            location: '北京市',
            bio: userData.bio || '暂无个人简介',
            posts: userData.stats?.posts || 0,
            groups: 0,
            friends: userData.stats?.friends || 0,
            points: 0
          }

          // 更新编辑表单
          editForm.value = {
            name: displayName,
            bio: userData.bio || '',
            avatar: userData.avatar || ''
          }
        } else {
          // API失败时使用本地存储的用户信息
          const localUser = JSON.parse(localStorage.getItem('user')) || {}
          userInfo.value = {
            name: localUser.first_name || '社区',
            avatar: localUser.avatar || '',
            level: '中级',
            joinDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
            location: '北京市',
            bio: '暂无个人简介',
            posts: 0,
            groups: 0,
            friends: 0,
            points: 0
          }
          
          editForm.value = {
            name: localUser.first_name || '社区',
            bio: '',
            avatar: localUser.avatar || ''
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        // 出错时使用本地存储的用户信息
        const localUser = JSON.parse(localStorage.getItem('user')) || {}
        userInfo.value = {
          name: localUser.first_name || '社区',
          avatar: localUser.avatar || '',
          level: '中级',
          joinDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
          location: '北京市',
          bio: '暂无个人简介',
          posts: 0,
          groups: 0,
          friends: 0,
          points: 0
        }
        
        editForm.value = {
          name: localUser.first_name || '社区',
          bio: '',
          avatar: localUser.avatar || ''
        }
      }
    }

    // 加载用户群组
    const loadUserGroups = async () => {
      try {
        const response = await apiService.getMyGroups()
        if (response.success) {
          myGroups.value = response.data.groups.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            members: group.member_count || 0,
            posts: group.post_count || 0,
            avatar: group.avatar,
            role: group.role,
            joined_at: group.joined_at
          }))
          // 更新用户统计中的群组数量
          userInfo.value.groups = myGroups.value.length
        } else {
          // API失败时使用模拟数据
          myGroups.value = [
            {
              id: 1,
              name: '聋健交流组',
              description: '聋人与健听人交流的群组',
              members: 16,
              posts: 45,
              avatar: '',
              role: 'member',
              joined_at: new Date().toISOString()
            },
            {
              id: 2,
              name: '手语学习群',
              description: '一起学习手语的群组',
              members: 23,
              posts: 67,
              avatar: '',
              role: 'member',
              joined_at: new Date().toISOString()
            }
          ]
          userInfo.value.groups = myGroups.value.length
        }
      } catch (error) {
        console.error('加载用户群组失败:', error)
        // 出错时使用模拟数据
        myGroups.value = [
          {
            id: 1,
            name: '聋健交流组',
            description: '聋人与健听人交流的群组',
            members: 16,
            posts: 45,
            avatar: '',
            role: 'member',
            joined_at: new Date().toISOString()
          },
          {
            id: 2,
            name: '手语学习群',
            description: '一起学习手语的群组',
            members: 23,
            posts: 67,
            avatar: '',
            role: 'member',
            joined_at: new Date().toISOString()
          }
        ]
        userInfo.value.groups = myGroups.value.length
      }
    }

    // 加载用户帖子
    const loadUserPosts = async () => {
      try {
        const response = await apiService.getUserPosts()
        if (response.success) {
          myPosts.value = response.data.posts.map(post => ({
            id: post.id,
            username: post.username,
            level: '中级',
            time: new Date(post.created_at).toLocaleString('zh-CN'),
            content: post.content,
            avatar: post.avatar,
            comments: post.comments_count || 0,
            likes: post.likes_count || 0,
            views: post.views || 0,
            privacy: post.privacy || 'public',
            isLiked: post.isLiked || false
          }))
        }
      } catch (error) {
        console.error('加载用户帖子失败:', error)
      }
    }

    // 切换点赞
    const toggleLike = async (post) => {
      try {
        const response = await apiService.likePost(post.id)
        if (response.success) {
          post.isLiked = response.data.liked
          post.likes = response.data.likes_count
          if (post.isLiked) {
            ElMessage.success('点赞成功！')
          } else {
            ElMessage.info('已取消点赞')
          }
        }
      } catch (error) {
        console.error('点赞失败:', error)
        ElMessage.error('点赞失败，请稍后重试')
      }
    }

    // 保存编辑
    const saveEdit = async () => {
      try {
        console.log('正在保存资料:', {
          first_name: editForm.value.name,
          bio: editForm.value.bio,
          avatar: editForm.value.avatar ? '有头像数据' : '无头像数据'
        })

        const response = await apiService.updateUserProfile({
          first_name: editForm.value.name,
          bio: editForm.value.bio,
          avatar: editForm.value.avatar
        })

        console.log('API响应:', response)

        if (response.success) {
          // 更新本地用户信息
          userInfo.value.name = editForm.value.name
          userInfo.value.bio = editForm.value.bio
          userInfo.value.avatar = editForm.value.avatar
          
          // 更新本地存储
          const localUser = JSON.parse(localStorage.getItem('user')) || {}
          localUser.first_name = editForm.value.name
          localUser.avatar = editForm.value.avatar
          localStorage.setItem('user', JSON.stringify(localUser))
          
          showEditDialog.value = false
          ElMessage.success('资料更新成功！')
          // 刷新用户数据
          await loadUserInfo()
        } else {
          // API失败但仍更新本地数据
          userInfo.value.name = editForm.value.name
          userInfo.value.bio = editForm.value.bio
          userInfo.value.avatar = editForm.value.avatar
          
          // 更新本地存储
          const localUser = JSON.parse(localStorage.getItem('user')) || {}
          localUser.first_name = editForm.value.name
          localUser.avatar = editForm.value.avatar
          localStorage.setItem('user', JSON.stringify(localUser))
          
          showEditDialog.value = false
          ElMessage.success('资料更新成功！')
        }
      } catch (error) {
        console.error('更新资料失败:', error)
        // 出错时仍更新本地数据
        userInfo.value.name = editForm.value.name
        userInfo.value.bio = editForm.value.bio
        userInfo.value.avatar = editForm.value.avatar
        
        // 更新本地存储
        const localUser = JSON.parse(localStorage.getItem('user')) || {}
        localUser.first_name = editForm.value.name
        localUser.avatar = editForm.value.avatar
        localStorage.setItem('user', JSON.stringify(localUser))
        
        showEditDialog.value = false
        ElMessage.success('资料更新成功！')
      }
    }

    // 初始化数据
    onMounted(async () => {
      await loadUserInfo()
      await loadUserPosts()
      await loadUserGroups()
      // 只有在有token的情况下才加载通知
      const token = localStorage.getItem('token')
      if (token) {
        await loadNotifications()
      }

      // 检查是否是其他用户的个人主页
      const userId = route.params.id
      if (userId && userId !== 'me') {
        isOtherUser.value = true
        // 这里可以根据userId加载其他用户的信息
        document.title = `${userInfo.value.name}的个人主页 - 手语教学平台`
      } else {
        document.title = '我的主页 - 手语教学平台'
      }

      // 监听窗口大小变化
      handleResize = () => {
        isMobile.value = window.innerWidth <= 768
      }
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清理事件监听器
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

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
      likes: 0,
      comments: 0,
      friendRequests: 0,
      friendMessages: 0
    })

    // 详细的通知数据
    const likeComments = ref([])

    const friendMessages = ref([])

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

    // 加载通知数据
    const loadNotifications = async () => {
      try {
        const response = await apiService.getNotifications()
        if (response.success) {
          // 更新通知计数
          notifications.value.likes = response.data.likeUnreadCount || 0
          notifications.value.comments = 0
          notifications.value.friendRequests = response.data.friendUnreadCount || 0
          notifications.value.friendMessages = 0

          // 更新通知列表
          const allNotifications = response.data.notifications || []
          likeComments.value = allNotifications
            .filter(n => n.type === 'like' || n.type === 'comment')
            .map(n => ({
              id: n.id,
              userId: n.sender_id,
              username: n.sender_name || '用户',
              avatar: n.sender_avatar || '',
              type: n.type,
              time: new Date(n.created_at).toLocaleString('zh-CN'),
              targetPost: n.content || '',
              targetPostId: n.target_id,
              isRead: n.is_read
            }))

          friendMessages.value = allNotifications
            .filter(n => n.type === 'friend_request' || n.type === 'friend_accept')
            .map(n => ({
              id: n.id,
              userId: n.sender_id,
              username: n.sender_name || '用户',
              avatar: n.sender_avatar || '',
              time: new Date(n.created_at).toLocaleString('zh-CN'),
              message: n.content || '',
              isRead: n.is_read
            }))
        }
      } catch (error) {
        console.error('加载通知失败:', error)
      }
    }

    const markAllAsRead = async () => {
      try {
        // 如果没有指定类型，标记所有通知为已读
        const response = await apiService.markAllNotificationsAsRead('')
        if (response.success) {
          await loadNotifications()
          ElMessage.success('已标记所有消息为已读')
        }
      } catch (error) {
        console.error('标记已读失败:', error)
        ElMessage.error('操作失败，请稍后重试')
      }
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



    // 头像上传
    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        try {
          // 使用压缩工具处理图片
          const compressedImage = await handleImageUploadWithCompression(file, {
            maxWidth: 400,
            maxHeight: 400,
            quality: 0.8,
            maxSize: 512 * 1024 // 512KB
          })
          editForm.value.avatar = compressedImage
          ElMessage.success('头像上传成功！')
        } catch (error) {
          ElMessage.error(error.message || '头像上传失败')
        }
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

    // 退出登录
    const logout = () => {
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '退出登录',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 清除localStorage中的登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.success('已退出登录')
        // 跳转到登录页面
        router.push('/')
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
    const leaveGroup = async (group) => {
      try {
        await ElMessageBox.confirm(
          `确定要退出群聊"${group.name}"吗？`,
          '退出群聊',
          {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning',
          }
        )

        const response = await apiService.leaveGroup(group.id)
        if (response.success) {
          myGroups.value = myGroups.value.filter(g => g.id !== group.id)
          userInfo.value.groups -= 1
          ElMessage.success('已退出群聊')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出群聊失败:', error)
          ElMessage.error('退出群聊失败，请稍后重试')
        }
      }
    }

    // 显示群组管理选项
    const showGroupOptions = async (group) => {
      selectedGroup.value = group
      showGroupManageDialog.value = true

      // 加载群组成员
      try {
        const response = await apiService.getGroupDetail(group.id)
        if (response.success) {
          groupMembers.value = response.data.members.filter(m => m.user_id !== group.creator_id)
        }
      } catch (error) {
        console.error('加载群组成员失败:', error)
      }
    }

    // 解散群组
    const confirmDissolveGroup = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要解散群聊"${selectedGroup.value.name}"吗？此操作不可恢复！`,
          '解散群组',
          {
            confirmButtonText: '确认解散',
            cancelButtonText: '取消',
            type: 'danger',
          }
        )

        const response = await apiService.dissolveGroup(selectedGroup.value.id)
        if (response.success) {
          myGroups.value = myGroups.value.filter(g => g.id !== selectedGroup.value.id)
          userInfo.value.groups -= 1
          showGroupManageDialog.value = false
          ElMessage.success('群组已解散')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('解散群组失败:', error)
          ElMessage.error('解散群组失败，请稍后重试')
        }
      }
    }

    // 转让群主
    const transferOwnership = async () => {
      if (!selectedNewOwner.value) {
        ElMessage.warning('请选择要转让的成员')
        return
      }

      try {
        const response = await apiService.transferGroupOwnership(selectedGroup.value.id, selectedNewOwner.value)
        if (response.success) {
          showTransferDialog.value = false
          showGroupManageDialog.value = false
          selectedNewOwner.value = null
          ElMessage.success('群主转让成功')

          // 重新加载群组列表
          await loadUserGroups()
        }
      } catch (error) {
        console.error('转让群主失败:', error)
        ElMessage.error('转让群主失败，请稍后重试')
      }
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

    // 计算属性：我创建的群组
    const createdGroups = computed(() => {
      return myGroups.value.filter(group => group.role === 'admin')
    })

    // 计算属性：我加入的群组
    const joinedGroups = computed(() => {
      return myGroups.value.filter(group => group.role !== 'admin')
    })

    return {
      isMobile,
      activeTab,
      groupTab,
      showEditDialog,
      showNotificationDialog,
      showCreateGroupDialog,
      showGroupManageDialog,
      showTransferDialog,
      notificationType,
      isOtherUser,
      editForm,
      createGroupForm,
      userInfo,
      myPosts,
      myGroups,
      myFriends,
      createdGroups,
      joinedGroups,
      selectedGroup,
      groupMembers,
      selectedNewOwner,
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
      logout,
      getAvatarUrl,
      leaveGroup,
      showGroupOptions,
      confirmDissolveGroup,
      transferOwnership,
      viewGroup,
      chatWithFriend,
      deleteFriend,
      goToPostDetail,
      createGroup,
      cancelCreateGroup
    }
  }
}
</script>

<style scoped>
/* 移动端优化 */
@media (max-width: 768px) {
  /* 帖子卡片优化 */
  :deep(.el-card) {
    margin-bottom: 16px;
  }

  :deep(.el-card__body) {
    padding: 16px !important;
  }

  /* 头像优化 */
  :deep(.el-avatar) {
    flex-shrink: 0;
  }

  /* 标签优化 */
  :deep(.el-tag) {
    font-size: 11px;
    padding: 2px 8px;
    height: auto;
    line-height: 1.4;
  }

  /* 按钮优化 */
  :deep(.el-button) {
    padding: 8px 12px;
    font-size: 13px;
  }

  /* 文本优化 */
  p {
    word-break: break-word;
    line-height: 1.6;
  }

  /* 间距优化 */
  .space-y-4 > * + * {
    margin-top: 16px;
  }
}

/* 桌面端优化 */
@media (min-width: 769px) {
  /* 帖子卡片间距 */
  .space-y-6 > * + * {
    margin-top: 24px;
  }
}
</style>
