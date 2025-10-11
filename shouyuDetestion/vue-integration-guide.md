# Vue项目集成手语翻译功能指南

## 快速集成步骤

### 1. 复制必要文件到现有Vue项目

```bash
# 在现有Vue项目根目录执行
mkdir -p src/views/translation/sign-language
mkdir -p src/components/sign-language
mkdir -p src/api/sign-language
mkdir -p src/stores

# 复制组件文件
cp vue-frontend/components/SignLanguageDetector.vue src/views/translation/sign-language/
```

### 2. 安装必要依赖

```bash
# 在现有Vue项目中安装
npm install axios
npm install element-plus  # 如果使用Element Plus
# 或
npm install ant-design-vue  # 如果使用Ant Design Vue
```

### 3. 添加路由配置

```javascript
// src/router/index.js 或 src/router/routes.js
import { createRouter, createWebHistory } from 'vue-router'
import SignLanguageDetector from '@/views/translation/sign-language/SignLanguageDetector.vue'

const routes = [
  // ... 现有路由
  {
    path: '/translation/sign-language',
    name: 'SignLanguageTranslation',
    component: SignLanguageDetector,
    meta: {
      title: '手语翻译',
      requiresAuth: true,
      permissions: ['translation:sign-language']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 4. 创建API服务

```javascript
// src/api/sign-language/index.js
import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000'

const signLanguageAPI = {
  // 健康检查
  async healthCheck() {
    return axios.get(`${API_BASE_URL}/api/health`)
  },

  // 图片检测
  async detectImage(imageFile, confidence = 0.5) {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('confidence', confidence)
    
    return axios.post(`${API_BASE_URL}/api/detect/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 视频检测
  async detectVideo(videoFile, confidence = 0.5) {
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('confidence', confidence)
    
    return axios.post(`${API_BASE_URL}/api/detect/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 批量图片检测
  async detectBatch(images, confidence = 0.5) {
    const formData = new FormData()
    images.forEach(image => {
      formData.append('images', image)
    })
    formData.append('confidence', confidence)
    
    return axios.post(`${API_BASE_URL}/api/detect/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 保存结果
  async saveResults(results) {
    return axios.post(`${API_BASE_URL}/api/save/results`, {
      results,
      timestamp: Date.now()
    })
  },

  // 获取模型信息
  async getModelInfo() {
    return axios.get(`${API_BASE_URL}/api/models/info`)
  }
}

export default signLanguageAPI
```

### 5. 创建状态管理

```javascript
// src/stores/signLanguage.js
import { defineStore } from 'pinia'
import signLanguageAPI from '@/api/sign-language'

export const useSignLanguageStore = defineStore('signLanguage', {
  state: () => ({
    // 检测状态
    isDetecting: false,
    detectionResults: [],
    currentImage: null,
    currentVideo: null,
    
    // 参数设置
    parameters: {
      confidence: 0.5,
      delay: 10
    },
    
    // 摄像头状态
    isCameraActive: false,
    mediaStream: null,
    
    // 历史记录
    detectionHistory: []
  }),

  getters: {
    // 当前检测结果
    currentDetections: (state) => {
      return state.detectionResults
    },
    
    // 检测结果数量
    detectionCount: (state) => {
      return state.detectionResults.length
    },
    
    // 是否有检测结果
    hasResults: (state) => {
      return state.detectionResults.length > 0
    }
  },

  actions: {
    // 设置参数
    setParameters(params) {
      this.parameters = { ...this.parameters, ...params }
    },

    // 图片检测
    async detectImage(imageFile) {
      try {
        this.isDetecting = true
        const response = await signLanguageAPI.detectImage(
          imageFile, 
          this.parameters.confidence
        )
        
        this.detectionResults = response.data.detections
        this.currentImage = response.data.image
        
        // 添加到历史记录
        this.detectionHistory.unshift({
          type: 'image',
          results: response.data.detections,
          timestamp: Date.now()
        })
        
        return response.data
      } catch (error) {
        console.error('图片检测失败:', error)
        throw error
      } finally {
        this.isDetecting = false
      }
    },

    // 视频检测
    async detectVideo(videoFile) {
      try {
        this.isDetecting = true
        const response = await signLanguageAPI.detectVideo(
          videoFile,
          this.parameters.confidence
        )
        
        this.detectionResults = response.data.detections
        this.currentVideo = response.data.output_video
        
        return response.data
      } catch (error) {
        console.error('视频检测失败:', error)
        throw error
      } finally {
        this.isDetecting = false
      }
    },

    // 批量检测
    async detectBatch(imageFiles) {
      try {
        this.isDetecting = true
        const response = await signLanguageAPI.detectBatch(
          imageFiles,
          this.parameters.confidence
        )
        
        return response.data
      } catch (error) {
        console.error('批量检测失败:', error)
        throw error
      } finally {
        this.isDetecting = false
      }
    },

    // 保存结果
    async saveResults() {
      try {
        const response = await signLanguageAPI.saveResults(this.detectionResults)
        return response.data
      } catch (error) {
        console.error('保存失败:', error)
        throw error
      }
    },

    // 清空结果
    clearResults() {
      this.detectionResults = []
      this.currentImage = null
      this.currentVideo = null
    },

    // 摄像头控制
    async startCamera() {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        })
        this.isCameraActive = true
        return this.mediaStream
      } catch (error) {
        console.error('摄像头启动失败:', error)
        throw error
      }
    },

    stopCamera() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }
      this.isCameraActive = false
    }
  }
})
```

### 6. 添加导航菜单

```vue
<!-- 在现有项目的导航组件中添加 -->
<template>
  <div class="navigation">
    <!-- 现有导航项 -->
    
    <!-- 添加翻译模块 -->
    <el-sub-menu index="translation">
      <template #title>
        <el-icon><Translation /></el-icon>
        <span>翻译服务</span>
      </template>
      <el-menu-item index="/translation/sign-language">
        <el-icon><SignLanguage /></el-icon>
        <span>手语翻译</span>
      </el-menu-item>
    </el-sub-menu>
  </div>
</template>
```

### 7. 环境变量配置

```bash
# .env.development
VUE_APP_API_BASE_URL=http://localhost:5000
VUE_APP_WS_URL=ws://localhost:8765

# .env.production
VUE_APP_API_BASE_URL=https://your-api-domain.com
VUE_APP_WS_URL=wss://your-api-domain.com:8765
```

### 8. 权限控制

```javascript
// src/router/guards.js
import { useUserStore } from '@/stores/user'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    
    // 检查手语翻译权限
    if (to.path.includes('/translation/sign-language')) {
      if (userStore.hasPermission('translation:sign-language')) {
        next()
      } else {
        next('/unauthorized')
      }
    } else {
      next()
    }
  })
}
```

### 9. 样式集成

```scss
// src/styles/sign-language.scss
.sign-language-detector {
  // 继承现有项目的主题色
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  
  // 使用现有项目的字体
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  
  // 响应式设计
  @media (max-width: 768px) {
    .main-content {
      flex-direction: column;
    }
    
    .control-panel {
      width: 100%;
      margin-top: 20px;
    }
  }
}
```

### 10. 启动后端服务

```bash
# 在项目根目录创建backend目录
mkdir backend
cd backend

# 复制后端文件
cp -r ../backend_api/* .

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

## 测试集成

### 1. 功能测试
```javascript
// tests/sign-language.test.js
import { mount } from '@vue/test-utils'
import SignLanguageDetector from '@/views/translation/sign-language/SignLanguageDetector.vue'

describe('SignLanguageDetector', () => {
  test('组件正常渲染', () => {
    const wrapper = mount(SignLanguageDetector)
    expect(wrapper.exists()).toBe(true)
  })
  
  test('图片上传功能', async () => {
    const wrapper = mount(SignLanguageDetector)
    const fileInput = wrapper.find('input[type="file"]')
    
    // 模拟文件选择
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    await fileInput.trigger('change', { target: { files: [file] } })
    
    // 验证上传逻辑
    expect(wrapper.vm.hasContent).toBe(true)
  })
})
```

### 2. API测试
```javascript
// tests/api/sign-language.test.js
import signLanguageAPI from '@/api/sign-language'

describe('SignLanguage API', () => {
  test('健康检查', async () => {
    const response = await signLanguageAPI.healthCheck()
    expect(response.data.status).toBe('ok')
  })
})
```

## 部署配置

### 1. Docker配置
```dockerfile
# Dockerfile.backend
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

```dockerfile
# Dockerfile.frontend
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "serve"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    volumes:
      - ./models:/app/models
      - ./save_data:/app/save_data
    environment:
      - FLASK_ENV=production

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - VUE_APP_API_BASE_URL=http://backend:5000
```

## 注意事项

1. **模型文件**: 确保将训练好的模型文件复制到正确位置
2. **权限设置**: 摄像头功能需要HTTPS环境
3. **跨域配置**: 确保后端CORS配置正确
4. **文件大小**: 设置合适的文件上传大小限制
5. **错误处理**: 添加完善的错误处理和用户提示

## 完成检查清单

- [ ] 组件文件复制完成
- [ ] 路由配置添加
- [ ] API服务创建
- [ ] 状态管理配置
- [ ] 导航菜单添加
- [ ] 权限控制设置
- [ ] 样式集成完成
- [ ] 后端服务启动
- [ ] 功能测试通过
- [ ] 部署配置完成
