<template>
  <div class="min-h-screen animated-gradient admin-page">
    <nav class="border-b border-slate-200 bg-slate-900 text-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6">
          <h1 class="text-lg font-semibold tracking-wide">管理员后台</h1>
          <div class="hidden items-center gap-2 md:flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'rounded-md px-3 py-2 text-sm transition-colors',
                currentTab === tab.id
                  ? 'bg-white text-slate-900'
                  : 'text-slate-200 hover:bg-slate-700 hover:text-white'
              ]"
            >
              {{ tab.name }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-slate-300 sm:inline">{{ user?.username }}</span>
          <button
            @click="refreshCurrentTab"
            class="rounded-md bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
          >
            刷新
          </button>
          <button
            @click="logout"
            class="rounded-md bg-rose-600 px-3 py-2 text-sm hover:bg-rose-500"
          >
            退出登录
          </button>
        </div>
      </div>

      <div class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        <button
          v-for="tab in tabs"
          :key="`mobile-${tab.id}`"
          @click="currentTab = tab.id"
          :class="[
            'whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors',
            currentTab === tab.id
              ? 'bg-white text-slate-900'
              : 'bg-slate-700 text-slate-200'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <template v-if="currentTab === 'dashboard'">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm text-slate-500">看板范围</div>
            <div class="flex items-center gap-2">
              <select
                v-model.number="dashboardDays"
                class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                @change="reloadDashboard"
              >
                <option :value="7">近 7 天</option>
                <option :value="14">近 14 天</option>
                <option :value="30">近 30 天</option>
              </select>
              <button
                @click="reloadDashboard"
                class="rounded-md bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
              >
                重载看板
              </button>
            </div>
          </div>

          <AdminDashboard
            :stats="stats"
            :dashboard="dashboard"
            :loading="tabState.dashboard.loading"
            :error="tabState.dashboard.error"
            @retry="reloadDashboard"
          />
        </template>

        <template v-else-if="currentTab === 'users'">
          <div v-if="tabState.users.loading" class="rounded-lg bg-white p-6 text-center text-slate-500 shadow">
            正在加载用户数据...
          </div>
          <div v-else-if="tabState.users.error" class="rounded-lg bg-white p-6 shadow">
            <p class="text-red-600">{{ tabState.users.error }}</p>
            <button class="mt-4 rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="reloadUsers">重试</button>
          </div>
          <AdminUsers
            v-else
            :users="users"
            :currentUser="currentUser"
            @fetchUsers="fetchUsers"
            @toggleUserStatus="toggleUserStatus"
            @deleteUser="deleteUser"
            @viewUserDetail="viewUserDetail"
            @createUser="createUser"
          />
        </template>

        <template v-else-if="currentTab === 'posts'">
          <div v-if="tabState.posts.loading" class="rounded-lg bg-white p-6 text-center text-slate-500 shadow">
            正在加载帖子与评论数据...
          </div>
          <div v-else-if="tabState.posts.error" class="rounded-lg bg-white p-6 shadow">
            <p class="text-red-600">{{ tabState.posts.error }}</p>
            <button class="mt-4 rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="reloadPosts">重试</button>
          </div>
          <AdminPosts
            v-else
            :posts="posts"
            :comments="comments"
            @fetchPosts="fetchPosts"
            @fetchComments="fetchComments"
            @viewPost="viewPost"
            @deletePost="deletePost"
            @deleteComment="deleteComment"
          />
        </template>

        <template v-else-if="currentTab === 'groups'">
          <div v-if="tabState.groups.loading" class="rounded-lg bg-white p-6 text-center text-slate-500 shadow">
            正在加载社群数据...
          </div>
          <div v-else-if="tabState.groups.error" class="rounded-lg bg-white p-6 shadow">
            <p class="text-red-600">{{ tabState.groups.error }}</p>
            <button class="mt-4 rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="reloadGroups">重试</button>
          </div>
          <AdminGroups
            v-else
            :groups="groups"
            @fetchGroups="fetchGroups"
            @viewGroup="viewGroup"
            @deleteGroup="deleteGroup"
            @removeMember="removeMember"
            @deleteMessage="deleteMessage"
          />
        </template>

        <template v-else-if="currentTab === 'logs'">
          <div class="mb-4 rounded-lg bg-white p-4 shadow">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-6">
              <input
                v-model="logFilters.keyword"
                type="text"
                placeholder="关键词"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                v-model="logFilters.action"
                type="text"
                placeholder="操作类型"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                v-model="logFilters.startDate"
                type="date"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                v-model="logFilters.endDate"
                type="date"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button class="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="reloadLogs">筛选</button>
              <button class="rounded-md border border-slate-300 px-3 py-2 text-sm" @click="resetLogFilters">重置</button>
            </div>
          </div>

          <div v-if="tabState.logs.loading" class="rounded-lg bg-white p-6 text-center text-slate-500 shadow">
            正在加载操作日志...
          </div>
          <div v-else-if="tabState.logs.error" class="rounded-lg bg-white p-6 shadow">
            <p class="text-red-600">{{ tabState.logs.error }}</p>
            <button class="mt-4 rounded-md bg-slate-800 px-3 py-2 text-sm text-white" @click="reloadLogs">重试</button>
          </div>
          <AdminLogs v-else :logs="logs" />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import apiService from '../services/api'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminUsers from '../components/admin/AdminUsers.vue'
import AdminPosts from '../components/admin/AdminPosts.vue'
import AdminGroups from '../components/admin/AdminGroups.vue'
import AdminLogs from '../components/admin/AdminLogs.vue'
import { getNodeApiBaseUrl } from '@/utils/runtimeUrls'

const router = useRouter()
const currentTab = ref('dashboard')
const user = ref(null)
const currentUser = ref(null)
const dashboard = ref(null)
const dashboardDays = ref(7)

const tabs = [
  { id: 'dashboard', name: '系统概览' },
  { id: 'users', name: '用户管理' },
  { id: 'posts', name: '帖子管理' },
  { id: 'groups', name: '社群管理' },
  { id: 'logs', name: '操作日志' }
]

const stats = reactive({
  users: {},
  posts: {},
  comments: {},
  learning: {},
  translations: {}
})

const users = ref([])
const posts = ref([])
const comments = ref([])
const logs = ref([])
const groups = ref([])

const tabState = reactive({
  dashboard: { loaded: false, loading: false, error: '' },
  users: { loaded: false, loading: false, error: '' },
  posts: { loaded: false, loading: false, error: '' },
  groups: { loaded: false, loading: false, error: '' },
  logs: { loaded: false, loading: false, error: '' }
})

// 动态获取API基础地址
const getApiBaseUrl = () => getNodeApiBaseUrl()

const userFilters = reactive({ search: '', role: '' })
const postFilters = reactive({ search: '', author: '', date: '' })
const commentFilters = reactive({ search: '' })
const groupFilters = reactive({ search: '' })
const logFilters = reactive({ action: '', startDate: '', endDate: '', keyword: '' })

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const parseApiError = (error, apiName) => {
  const status = error?.status ? ` [${error.status}]` : ''
  const message = error?.message || '未知错误'
  const endpoint = error?.endpoint ? ` (${error.endpoint})` : ''
  console.error(`[Admin:${apiName}]`, error)
  return `${apiName}失败${status}: ${message}${endpoint}`
}

const withTabLoading = async (tab, loader, force = false) => {
  const state = tabState[tab]
  if (state.loading) return
  if (state.loaded && !force) return

  state.loading = true
  state.error = ''
  try {
    await loader()
    state.loaded = true
  } catch (error) {
    state.error = parseApiError(error, tab)
    throw error
  } finally {
    state.loading = false
  }
}

const fetchStats = async () => {
  const response = await apiService.getAdminStats()
  if (response.success) {
    Object.assign(stats, response.data)
  }
}

const fetchDashboard = async () => {
  const response = await apiService.getAdminDashboard(dashboardDays.value)
  if (response.success) {
    dashboard.value = response.data
  }
}

const fetchUsers = async (filters = null) => {
  if (filters) Object.assign(userFilters, filters)
  const response = await apiService.getAdminUsers(userFilters)
  if (response.success) {
    users.value = response.data.users || []
  }
}

const fetchPosts = async (filters = null) => {
  if (filters) Object.assign(postFilters, filters)
  const response = await apiService.getAdminPosts(postFilters)
  if (response.success) {
    posts.value = response.data.posts || []
  }
}

const fetchComments = async (filters = null) => {
  if (filters) Object.assign(commentFilters, filters)
  const response = await apiService.getAdminComments(commentFilters)
  if (response.success) {
    comments.value = response.data.comments || []
  }
}

const fetchLogs = async (filters = null) => {
  if (filters) Object.assign(logFilters, filters)
  const response = await apiService.getAdminLogs(logFilters)
  if (response.success) {
    logs.value = response.data.logs || []
  }
}

const fetchGroups = async (filters = null) => {
  if (filters) Object.assign(groupFilters, filters)
  const response = await apiService.getAdminGroups(groupFilters)
  if (response.success) {
    groups.value = response.data.groups || []
  }
}

const loadDashboardTab = async () => {
  await Promise.all([fetchStats(), fetchDashboard()])
}

const loadUsersTab = async () => {
  await fetchUsers()
}

const loadPostsTab = async () => {
  await Promise.all([fetchPosts(), fetchComments()])
}

const loadGroupsTab = async () => {
  await fetchGroups()
}

const loadLogsTab = async () => {
  await fetchLogs()
}

const tabLoaderMap = {
  dashboard: loadDashboardTab,
  users: loadUsersTab,
  posts: loadPostsTab,
  groups: loadGroupsTab,
  logs: loadLogsTab
}

const ensureTabLoaded = async (tab, force = false) => {
  const loader = tabLoaderMap[tab]
  if (!loader) return

  try {
    await withTabLoading(tab, loader, force)
  } catch {
    ElMessage.error(tabState[tab].error || `${tab} 加载失败`)
  }
}

const reloadDashboard = async () => {
  await ensureTabLoaded('dashboard', true)
}

const reloadUsers = async () => {
  await ensureTabLoaded('users', true)
}

const reloadPosts = async () => {
  await ensureTabLoaded('posts', true)
}

const reloadGroups = async () => {
  await ensureTabLoaded('groups', true)
}

const reloadLogs = async () => {
  await ensureTabLoaded('logs', true)
}

const resetLogFilters = async () => {
  Object.assign(logFilters, { action: '', startDate: '', endDate: '', keyword: '' })
  await reloadLogs()
}

const refreshCurrentTab = async () => {
  await ensureTabLoaded(currentTab.value, true)
}

const viewPost = async (post, callback) => {
  try {
    const response = await apiService.getAdminPostById(post.id)
    if (response.success && callback) {
      callback(response.data)
    }
  } catch (error) {
    ElMessage.error(parseApiError(error, '查看帖子详情'))
  }
}

const viewGroup = async (group, callback) => {
  try {
    const [groupResponse, messagesResponse] = await Promise.all([
      apiService.getAdminGroupById(group.id),
      apiService.getAdminGroupMessages(group.id)
    ])

    if (!groupResponse.success || !messagesResponse.success) {
      ElMessage.error('获取社群详情失败')
      return
    }

    callback?.({
      group: groupResponse.data.group,
      members: groupResponse.data.members,
      messages: messagesResponse.data.messages || []
    })
  } catch (error) {
    ElMessage.error(parseApiError(error, '查看社群详情'))
  }
}

const deleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(`确定删除社群 ${group.name} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiService.deleteAdminGroup(group.id)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchGroups(), fetchDashboard(), fetchStats()])
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '删除社群'))
    }
  }
}

const removeMember = async (group, member) => {
  try {
    await ElMessageBox.confirm(`确定移除成员 ${member.user_username} 吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiService.removeAdminGroupMember(group.id, member.user_id)
    if (response.success) {
      ElMessage.success(response.message)
      await fetchGroups()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '移除社群成员'))
    }
  }
}

const deleteMessage = async (message) => {
  try {
    await ElMessageBox.confirm('确定删除该群消息吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiService.deleteAdminGroupMessage(message.id)
    if (response.success) {
      ElMessage.success(response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '删除群消息'))
    }
  }
}

const viewUserDetail = async (targetUser) => {
  try {
    const response = await apiService.getAdminUserById(targetUser.id)
    if (!response.success) return

    const detail = response.data
    await ElMessageBox.alert(
      `<div class="space-y-3">
        <div><strong>用户名：</strong>${detail.user.username}</div>
        <div><strong>邮箱：</strong>${detail.user.email}</div>
        <div><strong>角色：</strong>${detail.user.role}</div>
        <div><strong>状态：</strong>${detail.user.is_active ? '正常' : '禁用'}</div>
        <div><strong>注册时间：</strong>${formatDate(detail.user.created_at)}</div>
        <hr />
        <div><strong>帖子：</strong>${detail.stats.posts}</div>
        <div><strong>评论：</strong>${detail.stats.comments}</div>
        <div><strong>学习记录：</strong>${detail.stats.learningRecords}</div>
        <div><strong>翻译记录：</strong>${detail.stats.translationRecords}</div>
      </div>`,
      '用户详情',
      { dangerouslyUseHTMLString: true }
    )
  } catch (error) {
    ElMessage.error(parseApiError(error, '查看用户详情'))
  }
}

const toggleUserStatus = async (targetUser) => {
  try {
    await ElMessageBox.confirm(
      `确定要${targetUser.is_active ? '禁用' : '启用'}用户 ${targetUser.username} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await apiService.toggleAdminUserStatus(targetUser.id, !targetUser.is_active)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchUsers(), fetchStats(), fetchDashboard()])
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '修改用户状态'))
    }
  }
}

const deleteUser = async (targetUser, callback) => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 ${targetUser.username} 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await apiService.deleteAdminUser(targetUser.id)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchUsers(), fetchStats(), fetchDashboard()])
      callback?.()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '删除用户'))
    }
  }
}

const createUser = async (userData) => {
  try {
    const response = await apiService.createAdminUser(userData)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchUsers(), fetchStats(), fetchDashboard()])
    }
  } catch (error) {
    ElMessage.error(parseApiError(error, '创建用户'))
  }
}

const deletePost = async (post, callback) => {
  try {
    await ElMessageBox.confirm('确定删除该帖子吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiService.deleteAdminPost(post.id)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchPosts(), fetchStats(), fetchDashboard()])
      callback?.()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '删除帖子'))
    }
  }
}

const deleteComment = async (comment, callback) => {
  try {
    await ElMessageBox.confirm('确定删除该评论吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiService.deleteAdminComment(comment.id)
    if (response.success) {
      ElMessage.success(response.message)
      await Promise.all([fetchComments(), fetchPosts(), fetchStats(), fetchDashboard()])
      callback?.()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(parseApiError(error, '删除评论'))
    }
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()
  ElMessage.success('已退出登录')
  location.reload()
  router.push('/')
}

watch(currentTab, async (tab) => {
  await ensureTabLoaded(tab)
})

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  if (!userStr || !token) {
    router.push('/')
    return
  }

  try {
    currentUser.value = JSON.parse(userStr)
  } catch {
    localStorage.clear()
    router.push('/')
    return
  }

  user.value = currentUser.value

  if (currentUser.value.role !== 'admin') {
    ElMessage.error('权限不足')
    router.push('/home')
    return
  }

  await ensureTabLoaded('dashboard', true)
})
</script>
