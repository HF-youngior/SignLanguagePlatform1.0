<template>
  <div class="login-page">
    <div class="login-glow login-glow--left"></div>
    <div class="login-glow login-glow--right"></div>

    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-mark">
          <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语" />
        </div>
        <p class="brand-mini">掌中语 · Hand in Hand</p>
        <h2 class="brand-title">探索手语的魅力</h2>
        <p class="brand-copy">
          学手语，是一场温暖的旅程<br>
          从这里开始，让我们的世界更近一点
        </p>
      </section>

      <section class="form-panel">
        <div class="panel-header">
          <h2>{{ isLogin ? '欢迎回来' : '加入掌中语' }}</h2>
          <p>{{ isLogin ? '登录后继续你的学习旅程' : '创建账号，开始你的手语旅程' }}</p>
        </div>

        <form v-if="isLogin" class="panel-form" @submit.prevent="handleLogin">
          <label class="field">
            <span>用户名或邮箱</span>
            <input v-model="loginForm.username" type="text" required placeholder="请输入用户名或邮箱" />
          </label>

          <label class="field">
            <span>密码</span>
            <input v-model="loginForm.password" type="password" required autocomplete="current-password" placeholder="请输入密码" />
          </label>

          <div class="field-row">
            <label class="checkbox-label">
              <input v-model="loginForm.rememberMe" type="checkbox" />
              <span>记住我</span>
            </label>
            <button type="button" class="text-btn">忘记密码</button>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <form v-else class="panel-form" @submit.prevent="handleRegister">
          <div class="avatar-upload">
            <p>头像（必填）</p>
            <div class="avatar-box" @click="$refs.avatarInput.click()">
              <img v-if="registerForm.avatar" :src="registerForm.avatar" alt="用户头像" />
              <span v-else>上传头像</span>
              <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
            </div>
          </div>

          <label class="field">
            <span>用户名</span>
            <input v-model="registerForm.username" type="text" required placeholder="设置用户名" />
          </label>

          <label class="field">
            <span>邮箱</span>
            <input v-model="registerForm.email" type="email" required placeholder="请输入邮箱" />
          </label>

          <label class="field">
            <span>密码</span>
            <input v-model="registerForm.password" type="password" required autocomplete="new-password" placeholder="至少 6 位" />
          </label>

          <label class="field">
            <span>确认密码</span>
            <input v-model="registerForm.confirmPassword" type="password" required autocomplete="new-password" placeholder="再次输入密码" />
          </label>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </form>

        <button class="switch-btn" @click="toggleMode">
          {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
        </button>


      </section>
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

const getApiBaseUrl = () => getNodeApiBaseUrl()

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('头像文件大小不能超过 5MB')
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })

    const data = await response.json()

    if (data.success) {
      localStorage.clear()
      const userData = data.data.user
      const essentialUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(essentialUserData))
      ElMessage.success('登录成功')

      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/learn')
      }
    } else if (data.errors && data.errors.length > 0) {
      data.errors.forEach((error) => ElMessage.error(error.msg))
    } else {
      ElMessage.error(data.message || '登录失败')
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
    ElMessage.warning('密码长度至少 6 位')
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.avatar = ''
    } else if (data.errors && data.errors.length > 0) {
      data.errors.forEach((error) => ElMessage.error(error.msg))
    } else {
      ElMessage.error(data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  padding: 30px 16px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 8% 16%, rgba(102, 132, 255, 0.24), transparent 26%),
    radial-gradient(circle at 86% 18%, rgba(165, 140, 253, 0.24), transparent 28%),
    radial-gradient(circle at 68% 80%, rgba(114, 185, 255, 0.18), transparent 30%),
    linear-gradient(140deg, #f8f8ff, #eef0ff 46%, #e8e7ff 100%);
  overflow: hidden;
}

.login-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(22px);
}

.login-glow--left {
  width: 260px;
  height: 260px;
  left: -90px;
  top: 8%;
  background: rgba(94, 126, 255, 0.32);
}

.login-glow--right {
  width: 320px;
  height: 320px;
  right: -120px;
  top: 32%;
  background: rgba(161, 134, 252, 0.3);
}

.login-shell {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.brand-panel,
.form-panel {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(118, 124, 204, 0.28);
  box-shadow: 0 22px 54px rgba(80, 87, 166, 0.2);
  backdrop-filter: blur(12px);
}

.brand-panel {
  padding: 36px 24px;
  background:
    radial-gradient(circle at 85% 10%, rgba(150, 177, 255, 0.25), transparent 35%),
    radial-gradient(circle at 10% 84%, rgba(241, 179, 143, 0.16), transparent 28%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.86), rgba(241, 240, 255, 0.82));
}

.brand-mark {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(145deg, #5766f0, #8f6df5 72%, #72b9ff);
  display: grid;
  place-items: center;
  box-shadow: 0 12px 28px rgba(81, 93, 183, 0.36);
}

.brand-mark img {
  width: 42px;
  height: 42px;
  filter: brightness(0) invert(1);
}

.brand-mini {
  margin: 16px 0 12px;
  color: #636fbb;
  font-size: 0.92rem;
}

.brand-title {
  margin: 0;
  font-size: clamp(1.7rem, 5vw, 2.7rem);
  line-height: 1.35;
  color: #312b66;
  font-weight: 800;
}

.brand-copy {
  margin: 16px 0 0;
  color: #66639a;
  line-height: 1.75;
  font-size: 1.05rem;
}

.form-panel {
  padding: 40px 24px 24px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.65rem;
  color: #353066;
}

.panel-header p {
  margin: 8px 0 0;
  color: #666ca0;
  font-size: 0.94rem;
}

.panel-form {
  display: grid;
  gap: 12px;
  flex: 1;
}

.switch-btn {
  margin-top: 24px;
  width: 100%;
  border: 0;
  background: transparent;
  color: #5966f0;
  font-weight: 700;
  cursor: pointer;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #595a93;
  font-size: 0.9rem;
  font-weight: 700;
}

.field input {
  width: 100%;
  border: 1px solid rgba(114, 122, 201, 0.32);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 14px;
  color: #332d61;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  border-color: rgba(90, 99, 240, 0.82);
  box-shadow: 0 0 0 4px rgba(114, 142, 245, 0.2);
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #635f95;
  font-size: 0.9rem;
}

.text-btn {
  border: 0;
  background: transparent;
  color: #5767ef;
  cursor: pointer;
  font-weight: 700;
}

.submit-btn {
  margin-top: 4px;
  border: 0;
  border-radius: 14px;
  padding: 12px 14px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(118deg, #5a63f0, #8f6df5 70%, #71b8ff);
  box-shadow: 0 12px 28px rgba(86, 104, 214, 0.34);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(86, 104, 214, 0.42);
}

.submit-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

.switch-btn {
  margin-top: 16px;
  width: 100%;
  border: 0;
  background: transparent;
  color: #5966f0;
  font-weight: 700;
  cursor: pointer;
}



.avatar-upload {
  display: grid;
  gap: 8px;
}

.avatar-upload p {
  margin: 0;
  color: #595a93;
  font-size: 0.9rem;
  font-weight: 700;
}

.avatar-box {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  border: 1px dashed rgba(107, 120, 204, 0.6);
  background: rgba(255, 255, 255, 0.85);
  display: grid;
  place-items: center;
  color: #61608f;
  cursor: pointer;
  overflow: hidden;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden {
  display: none;
}

@media (min-width: 960px) {
  .login-shell {
    grid-template-columns: 1.06fr 1fr;
    gap: 22px;
  }

  .brand-panel,
  .form-panel {
    min-height: 620px;
  }

  .brand-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px;
  }

  .form-panel {
    padding: 48px 34px 34px;
  }
}
</style>
