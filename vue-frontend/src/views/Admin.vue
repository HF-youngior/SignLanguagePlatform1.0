<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <nav class="bg-gray-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-xl font-bold">管理后台</span>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="currentTab = tab.id"
                  :class="[
                    currentTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'px-3 py-2 rounded-md text-sm font-medium'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-300">{{ user?.username }}</span>
            <button
              @click="logout"
              class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 统计概览 -->
      <AdminDashboard v-if="currentTab === 'dashboard'" :stats="stats" />

      <!-- 用户管理 -->
      <AdminUsers 
        v-else-if="currentTab === 'users'" 
        :users="users" 
        :currentUser="currentUser"
        @fetchUsers="fetchUsers"
        @toggleUserStatus="toggleUserStatus"
        @deleteUser="deleteUser"
        @viewUserDetail="viewUserDetail"
        @createUser="createUser"
      />

      <!-- 帖子管理 -->
      <AdminPosts 
        v-else-if="currentTab === 'posts'" 
        :posts="posts" 
        :comments="comments"
        @fetchPosts="fetchPosts"
        @fetchComments="fetchComments"
        @viewPost="viewPost"
        @deletePost="deletePost"
        @deleteComment="deleteComment"
      />

      <!-- 社群管理 -->
      <AdminGroups 
        v-else-if="currentTab === 'groups'" 
        :groups="groups"
        @fetchGroups="fetchGroups"
        @viewGroup="viewGroup"
        @deleteGroup="deleteGroup"
        @removeMember="removeMember"
        @deleteMessage="deleteMessage"
      />

      <!-- 操作日志 -->
      <AdminLogs v-else-if="currentTab === 'logs'" :logs="logs" />
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminUsers from '../components/admin/AdminUsers.vue'
import AdminPosts from '../components/admin/AdminPosts.vue'
import AdminGroups from '../components/admin/AdminGroups.vue'
import AdminLogs from '../components/admin/AdminLogs.vue'

const router = useRouter()
const currentTab = ref('dashboard')
const user = ref(null)
const currentUser = ref(null)

const tabs = [
  { id: 'dashboard', name: '系统概览' },
  { id: 'users', name: '用户管理' },
  { id: 'posts', name: '帖子管理' },
  { id: 'groups', name: '社群管理' },
  { id: 'logs', name: '操作日志' }
]

// 统计数据
const stats = reactive({
  users: {},
  posts: {},
  comments: {},
  learning: {},
  translations: {}
})

// 用户管理
const users = ref([])

// 帖子管理
const posts = ref([])

// 评论管理
const comments = ref([])

// 日志
const logs = ref([])

// 社群管理
const groups = ref([])

// 获取token
const getToken = () => localStorage.getItem('token')

// 动态获取API基础地址
const getApiBaseUrl = () => {
  const hostname = window.location.hostname
  // 如果是localhost或127.0.0.1，使用localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '${getApiBaseUrl()}'
  }
  // 否则使用当前页面的hostname（这样手机访问时会自动使用电脑的IP）
  return `http://${hostname}:8000/api`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      Object.assign(stats, data.data)
    }
  } catch (error) {
    console.error('获取统计数据错误:', error)
  }
}

// 获取用户列表
const fetchUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    
    const response = await fetch(`${getApiBaseUrl()}/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      users.value = data.data.users
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
  }
}

// 获取帖子列表
const fetchPosts = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.author) params.append('author', filters.author)
    if (filters.date) params.append('date', filters.date)
    
    const response = await fetch(`${getApiBaseUrl()}/admin/posts?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      posts.value = data.data.posts
    }
  } catch (error) {
    console.error('获取帖子列表错误:', error)
  }
}

// 获取评论列表
const fetchComments = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    
    const response = await fetch(`${getApiBaseUrl()}/admin/comments?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      comments.value = data.data.comments
    }
  } catch (error) {
    console.error('获取评论列表错误:', error)
  }
}

// 获取日志
const fetchLogs = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/logs`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      logs.value = data.data.logs
      console.log('操作日志数据:', data.data.logs)
    } else {
      ElMessage.error('获取操作日志失败')
      console.error('获取操作日志错误:', data.message)
    }
  } catch (error) {
    console.error('获取日志错误:', error)
    ElMessage.error('获取操作日志失败')
  }
}

// 获取社群列表
const fetchGroups = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    
    const response = await fetch(`${getApiBaseUrl()}/admin/groups?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      groups.value = data.data.groups
    } else {
      ElMessage.error('获取社群列表失败')
    }
  } catch (error) {
    console.error('获取社群列表错误:', error)
    ElMessage.error('获取社群列表失败')
  }
}

// 查看帖子详情
const viewPost = async (post, callback) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/posts/${post.id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success && callback) {
      callback(data.data)
    }
  } catch (error) {
    console.error('获取帖子详情错误:', error)
  }
}

// 查看社群详情
const viewGroup = async (group, callback) => {
  try {
    // 获取社群基本信息和成员
    const groupResponse = await fetch(`${getApiBaseUrl()}/admin/groups/${group.id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const groupData = await groupResponse.json()
    
    if (!groupData.success) {
      ElMessage.error('获取社群详情失败')
      return
    }
    
    // 获取群聊消息
    const messagesResponse = await fetch(`${getApiBaseUrl()}/admin/groups/${group.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const messagesData = await messagesResponse.json()
    
    if (!messagesData.success) {
      ElMessage.error('获取群聊消息失败')
      return
    }
    
    if (callback) {
      callback({
        group: groupData.data.group,
        members: groupData.data.members,
        messages: messagesData.data.messages
      })
    }
  } catch (error) {
    console.error('获取社群详情错误:', error)
    ElMessage.error('获取社群详情失败')
  }
}

// 删除社群
const deleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除社群 ${group.name} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/groups/${group.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchGroups()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除社群错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 移出群成员
const removeMember = async (group, member) => {
  try {
    await ElMessageBox.confirm(
      `确定要移出成员 ${member.user_username} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/groups/${group.id}/members/${member.user_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      // 重新获取社群详情
      viewGroup(group, () => {})
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移出群成员错误:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除群消息
const deleteMessage = async (message) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条消息吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/group-messages/${message.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      // 重新获取群聊消息
      viewGroup({ id: message.group_id }, () => {})
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除群消息错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 查看用户详情
const viewUserDetail = async (user) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/users/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    const data = await response.json()
    if (data.success) {
      // 显示用户详情弹窗
      ElMessageBox.alert(
        `<div class="space-y-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-16 w-16">
              ${data.data.user.avatar ? `<img src="${data.data.user.avatar}" class="h-16 w-16 rounded-full" alt="" />` : `<div class="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">${data.data.user.username.charAt(0).toUpperCase()}</div>`}
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-bold text-gray-900">${data.data.user.username}</h4>
              <p class="text-gray-600">${data.data.user.email}</p>
              <p class="text-gray-600">${data.data.user.first_name} ${data.data.user.last_name}</p>
              <p class="text-gray-600">角色: ${data.data.user.role === 'admin' ? '管理员' : data.data.user.role === 'moderator' ? '版主' : '用户'}</p>
              <p class="text-gray-600">状态: ${data.data.user.is_active ? '正常' : '禁用'}</p>
              <p class="text-gray-600">注册时间: ${formatDate(data.data.user.created_at)}</p>
            </div>
          </div>
          ${data.data.user.bio ? `<div><p class="text-gray-700">签名: ${data.data.user.bio}</p></div>` : ''}
          <div class="border-t border-gray-200 pt-4">
            <h5 class="font-medium text-gray-900">统计信息</h5>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <p>帖子数: ${data.data.stats.posts}</p>
              <p>评论数: ${data.data.stats.comments}</p>
              <p>学习记录: ${data.data.stats.learningRecords}</p>
              <p>翻译记录: ${data.data.stats.translationRecords}</p>
            </div>
          </div>
        </div>`,
        '用户详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }
  } catch (error) {
    console.error('获取用户详情错误:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要${user.is_active ? '禁用' : '启用'}用户 ${user.username} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/users/${user.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ isActive: !user.is_active })
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchUsers()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换用户状态错误:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除用户
const deleteUser = async (user, callback) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.username} 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchUsers()
      if (callback) callback()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 新增用户
const createUser = async (userData) => {
  try {
    const response = await fetch('${getApiBaseUrl()}/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchUsers()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    console.error('创建用户错误:', error)
    ElMessage.error('创建失败')
  }
}

// 删除帖子
const deletePost = async (post, callback) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个帖子吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/posts/${post.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchPosts()
      if (callback) callback()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除帖子错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 删除评论
const deleteComment = async (comment, callback) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`${getApiBaseUrl()}/admin/comments/${comment.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(data.message)
      fetchComments()
      fetchPosts() // 同时刷新帖子列表，以便更新评论数
      if (callback) callback()
    } else {
      ElMessage.error(data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 退出登录
const logout = () => {
  localStorage.clear() // 清除所有存储数据，避免存储空间不足
  router.push('/')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  // 检查用户是否已登录且是管理员
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  
  if (!userStr || !token) {
    router.push('/')
    return
  }
  
  currentUser.value = JSON.parse(userStr)
  user.value = currentUser.value
  
  if (currentUser.value.role !== 'admin') {
    ElMessage.error('权限不足')
    router.push('/home')
    return
  }
  
  // 加载数据
  fetchStats()
  fetchUsers()
  fetchPosts()
  fetchComments()
  fetchLogs()
  fetchGroups()
})
</script>