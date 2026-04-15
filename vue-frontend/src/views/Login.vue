<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <div>
        <div class="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          手语学习平台
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? '登录您的账号' : '创建新账号' }}
        </p>
      </div>

      <!-- 登录表单 -->
      <form v-if="isLogin" class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">用户名或邮箱</label>
            <input
              id="username"
              v-model="loginForm.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="用户名或邮箱"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              name="password"
              type="password"
              required
              autocomplete="current-password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="loginForm.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              忘记密码？
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>

      <!-- 注册表单 -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- 头像上传 -->
        <div class="flex flex-col items-center space-y-3">
          <label class="text-sm font-medium text-gray-700">上传头像（必填）</label>
          <div class="relative">
            <div
              v-if="!registerForm.avatar"
              class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
              @click="$refs.avatarInput.click()"
            >
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <img
              v-else
              :src="registerForm.avatar"
              class="w-24 h-24 rounded-full object-cover cursor-pointer border-2 border-blue-500"
              @click="$refs.avatarInput.click()"
            />
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
            />
          </div>
          <p v-if="!registerForm.avatar" class="text-xs text-red-500">请上传头像</p>
          <p v-else class="text-xs text-green-500">头像已上传，点击可更换</p>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="register-username" class="sr-only">用户名</label>
            <input
              id="register-username"
              v-model="registerForm.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="用户名"
            />
          </div>
          <div>
            <label for="register-email" class="sr-only">邮箱</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="邮箱"
            />
          </div>
          <div>
            <label for="register-password" class="sr-only">密码</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              name="password"
              type="password"
              required
              autocomplete="new-password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
          <div>
            <label for="register-confirm-password" class="sr-only">确认密码</label>
            <input
              id="register-confirm-password"
              v-model="registerForm.confirmPassword"
              name="confirm-password"
              type="password"
              required
              autocomplete="new-password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="确认密码"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </div>
      </form>

      <!-- 切换登录/注册 -->
      <div class="text-center">
        <button
          @click="toggleMode"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
        </button>
      </div>

      <!-- 测试账号提示 -->
      <div class="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">测试账号：</h4>
        <div class="text-xs text-gray-600 space-y-1">
          <p><strong>管理员：</strong>admin / admin123</p>
          <p><strong>测试用户：</strong>testuser / user123</p>
          <p><strong>版主：</strong>moderator / moderator123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNodeApiBaseUrl } from '@/utils/runtimeUrls'

const router = useRouter()
const isLogin = ref(true)
const isLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatar: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

// 动态获取API基础地址
const getApiBaseUrl = () => getNodeApiBaseUrl()

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('头像文件大小不能超过5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      registerForm.avatar = e.target.result
      ElMessage.success('头像上传成功')
    }
    reader.readAsDataURL(file)
  }
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })

    const data = await response.json()

    if (data.success) {
      // 清除旧的存储数据，避免存储空间不足
      localStorage.clear()
      
      // 检查用户数据大小
      const userData = data.data.user
      const userDataSize = new Blob([JSON.stringify(userData)]).size
      console.log('用户数据大小:', userDataSize, 'bytes')
      console.log('用户数据结构:', userData)
      
      // 只保存必要的用户信息，避免存储空间不足
      const essentialUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      }
      
      const essentialUserDataSize = new Blob([JSON.stringify(essentialUserData)]).size
      console.log('精简后用户数据大小:', essentialUserDataSize, 'bytes')
      
      // 保存token和用户信息
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(essentialUserData))
      
      ElMessage.success('登录成功！')
      
      // 根据角色跳转到不同页面
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/learn')
      }
    } else {
      if (data.errors && data.errors.length > 0) {
        // 显示具体的验证错误信息
        data.errors.forEach(error => {
          ElMessage.error(error.msg)
        })
      } else {
        ElMessage.error(data.message || '登录失败')
      }
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.email || !registerForm.password) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  if (!registerForm.avatar) {
    ElMessage.warning('请上传头像')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage.warning('密码长度至少6个字符')
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        avatar: registerForm.avatar
      })
    })

    const data = await response.json()

    if (data.success) {
      ElMessage.success('注册成功！请登录')
      isLogin.value = true
      // 清空注册表单
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.avatar = ''
    } else {
      if (data.errors && data.errors.length > 0) {
        // 显示具体的验证错误信息
        data.errors.forEach(error => {
          ElMessage.error(error.msg)
        })
      } else {
        ElMessage.error(data.message || '注册失败')
      }
    }
  } catch (error) {
    console.error('注册错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>