<template>
  <div class="px-4 sm:px-0">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">用户管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <input
          v-model="userSearch"
          type="text"
          placeholder="搜索用户名或邮箱..."
          class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="fetchUsers"
        />
        <select
          v-model="userRoleFilter"
          class="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="fetchUsers"
        >
          <option value="">所有角色</option>
          <option value="user">普通用户</option>
          <option value="moderator">版主</option>
          <option value="admin">管理员</option>
        </select>
        <button
          @click="fetchUsers"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          搜索
        </button>
        <button
          @click="showCreateUserDialog = true"
          class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          新增用户
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    class="h-10 w-10 rounded-full"
                    alt=""
                  />
                  <div v-else class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-red-100 text-red-800': user.role === 'admin',
                'bg-yellow-100 text-yellow-800': user.role === 'moderator',
                'bg-green-100 text-green-800': user.role === 'user'
              }">
                {{ user.role === 'admin' ? '管理员' : user.role === 'moderator' ? '版主' : '用户' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-green-100 text-green-800': user.is_active,
                'bg-red-100 text-red-800': !user.is_active
              }">
                {{ user.is_active ? '正常' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewUserDetail(user)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                详情
              </button>
              <button
                v-if="user.id !== currentUser.id"
                @click="toggleUserStatus(user)"
                :class="user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                class="mr-3"
              >
                {{ user.is_active ? '禁用' : '启用' }}
              </button>
              <button
                v-if="user.id !== currentUser.id"
                @click="deleteUser(user)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增用户弹窗 -->
    <div v-if="showCreateUserDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">新增用户</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              v-model="newUser.username"
              type="text"
              class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              v-model="newUser.email"
              type="email"
              class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              v-model="newUser.password"
              type="password"
              class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              v-model="newUser.role"
              class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">普通用户</option>
              <option value="moderator">版主</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showCreateUserDialog = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="createUser"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  currentUser: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['fetchUsers', 'toggleUserStatus', 'deleteUser', 'viewUserDetail', 'createUser'])

const userSearch = ref('')
const userRoleFilter = ref('')
const showCreateUserDialog = ref(false)
const newUser = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const fetchUsers = () => {
  emit('fetchUsers', { search: userSearch.value, role: userRoleFilter.value })
}

const toggleUserStatus = (user) => {
  emit('toggleUserStatus', user)
}

const deleteUser = (user) => {
  emit('deleteUser', user, () => {
    // 刷新用户列表
    fetchUsers()
  })
}

const viewUserDetail = (user) => {
  emit('viewUserDetail', user)
}

const createUser = () => {
  if (!newUser.username || !newUser.email || !newUser.password) {
    ElMessage.error('请填写完整信息')
    return
  }
  emit('createUser', newUser)
  showCreateUserDialog.value = false
  // 重置表单
  Object.assign(newUser, { username: '', email: '', password: '', role: 'user' })
}
</script>