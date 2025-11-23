<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3" />
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <!-- 桌面端导航 -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/home" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学习</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
            <router-link to="/translate" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">翻译</router-link>
          </div>
          <!-- 移动端菜单按钮 -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label="菜单"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- 移动端菜单 -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 mt-2">
          <router-link
            to="/"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            首页
          </router-link>
          <router-link
            to="/learn"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            学习
          </router-link>
          <router-link
            to="/translate"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-blue-700 bg-blue-50 font-semibold rounded-lg"
          >
            翻译
          </router-link>
          <router-link
            to="/community"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            社区
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-6 md:mb-8 fade-in">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700 mb-2 md:mb-4 animate-fade-in-down">
            🤖 手语识别翻译系统
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-gray-700 font-medium animate-fade-in-up px-2">
            基于YOLOv8的实时手语识别和智能翻译
          </p>
        </div>

        <!-- 主界面布局 -->
        <div class="grid lg:grid-cols-3 gap-4 md:gap-8">
          <!-- 移动端：检测结果框（在最上面） -->
          <el-card v-if="detectionResults.length > 0 && isMobile" class="lg:hidden mb-4 w-full order-1">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold">检测结果与位置信息</span>
                <el-tag type="success">{{ detectionResults.length }} 个目标</el-tag>
              </div>
            </template>
            <el-table
              :data="detectionResults"
              stripe
              style="width: 100%"
              :max-height="200"
              size="small"
            >
              <el-table-column prop="index" label="序号" width="60" align="center" />
              <el-table-column prop="className" label="类别" width="100" align="center" />
              <el-table-column prop="confidence" label="置信度" width="80" align="center">
                <template #default="scope">
                  <span class="font-semibold text-green-600 text-xs">{{ scope.row.confidence }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 左侧：图像显示区域（在检测结果下面） -->
          <div class="lg:col-span-2 order-2 lg:order-1 w-full">
            <el-card shadow="hover" class="h-full">
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold">📹 图像显示区域</span>
                  <el-tag :type="isProcessing ? 'success' : 'info'">
                    {{ isProcessing ? '处理中' : '就绪' }}
                  </el-tag>
                </div>
              </template>
              <div class="relative">
                <!-- 调试信息 -->
                <div v-if="currentVideo || currentImage" class="mb-2 text-xs text-gray-500 p-2 bg-gray-100 rounded">
                  <div>currentVideo: {{ currentVideo ? '已设置 ' + currentVideo.substring(0, 30) + '...' : '空' }}</div>
                  <div>currentImage: {{ currentImage ? '已设置' : '空' }}</div>
                  <div v-if="currentVideo">videoElement: {{ videoElement ? '存在' : '不存在' }}</div>
                  <div v-if="currentVideo && videoElement">视频时长: {{ videoElement.duration || '未加载' }}</div>
                  <div v-if="currentVideo && videoElement">视频尺寸: {{ videoElement.videoWidth || '?' }}x{{ videoElement.videoHeight || '?' }}</div>
                  <div v-if="currentVideo && videoElement">readyState: {{ videoElement.readyState }}</div>
                  <div v-if="currentVideo && videoElement">error: {{ videoElement.error ? videoElement.error.message : '无错误' }}</div>
                  <button @click="checkVideoStatus" class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">检查视频状态</button>
                </div>
                <!-- 图像/视频显示区域 -->
                <div class="bg-gray-100 rounded-lg mb-4 relative" :style="{ minHeight: isMobile ? '300px' : '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                  <div v-if="!currentImage && !currentVideo" class="text-center py-8">
                    <div class="text-6xl mb-4">📷</div>
                    <p class="text-gray-600">请选择图片、视频或开启摄像头</p>
                    <p class="text-sm text-gray-500">支持格式：JPG, PNG, MP4, AVI</p>
                  </div>
                  <img 
                    v-else-if="currentImage && !currentVideo"
                    :src="currentImage" 
                    alt="检测结果" 
                    class="max-w-full max-h-full object-contain w-full h-auto"
                    :style="{ maxHeight: isMobile ? '300px' : '500px', width: '100%', height: 'auto' }"
                    @load="handleImageLoad"
                  />
                  <div v-else-if="currentVideo" class="w-full" style="background: black; min-height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column; position: relative;">
                    <!-- 隐藏的原视频，用于同步播放 -->
                    <video 
                      ref="videoElement"
                      :src="currentVideo" 
                      preload="auto"
                      style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"
                      @loadeddata="onVideoLoaded"
                      @play="handleVideoPlay"
                      @pause="handleVideoPause"
                      @loadedmetadata="() => { console.log('Video metadata loaded'); }"
                      @error="(e) => handleVideoError(e)"
                    >
                      您的浏览器不支持该视频格式
                    </video>
                    
                    <!-- 显示的canvas，用于显示检测结果 -->
                    <canvas 
                      ref="canvasDisplay"
                      style="max-width: 100%; max-height: 500px; display: block;"
                    />
                    
                    <!-- 检测框overlay canvas -->
                    <canvas 
                      ref="canvasOverlay"
                      class="absolute"
                      style="pointer-events: none; top: 0; left: 0; z-index: 10;"
                    />
                    
                    <!-- 检测进度显示 -->
                    <div v-if="isVideoDetecting" class="mt-2 w-full px-4">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="text-white text-sm">检测进度:</div>
                        <div class="flex-1">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            :value="videoProgress" 
                            disabled
                            class="w-full"
                          />
                        </div>
                        <div class="text-white text-sm">{{ Math.round(videoProgress) }}%</div>
                      </div>
                      <div class="text-white text-xs text-center">
                        {{ formatVideoTime(currentVideoTime) }} / {{ formatVideoTime(videoDuration) }}
                      </div>
                    </div>
                    
                    <!-- 视频错误提示 -->
                    <div v-if="videoElement && videoElement.error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                      <p class="font-bold">❌ 视频加载失败</p>
                      <p class="text-sm mt-2">错误代码: {{ videoElement.error.code }}</p>
                      <p class="text-sm">错误信息: {{ videoElement.error.message }}</p>
                      <div class="mt-3 text-sm">
                        <p class="font-semibold">可能的原因：</p>
                        <ul class="list-disc list-inside mt-1">
                          <li>视频编码格式不被浏览器支持（如H.265/HEVC）</li>
                          <li>视频文件损坏</li>
                          <li>视频容器格式问题</li>
                        </ul>
                        <p class="mt-2 font-semibold">建议解决方案：</p>
                        <ul class="list-disc list-inside mt-1">
                          <li>使用H.264编码的MP4视频</li>
                          <li>使用视频转换工具转换格式</li>
                          <li>使用手机摄像头直接录制</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <!-- 加载遮罩 - 只在首次加载时显示（修复：确保视频显示时不显示遮罩） -->
                  <div v-if="!currentVideo && !currentImage && isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div class="text-white text-center">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>AI识别中...</p>
                      <p v-if="videoProcessingProgress" class="mt-2 text-sm">{{ videoProcessingProgress }}</p>
                    </div>
                  </div>
                </div>

                <!-- 检测结果表格（桌面端显示，移动端已在上面显示） -->
                <el-card v-if="detectionResults.length > 0" class="mt-4 hidden lg:block">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-semibold">检测结果与位置信息</span>
                      <el-tag type="success">{{ detectionResults.length }} 个目标</el-tag>
                    </div>
                  </template>
                  <el-table 
                    :data="detectionResults" 
                    stripe 
                    style="width: 100%"
                    :max-height="250"
                    size="small"
                  >
                    <el-table-column prop="index" label="序号" width="80" align="center" />
                    <el-table-column prop="filePath" label="文件路径" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="className" label="类别" width="150" align="center" />
                    <el-table-column prop="confidence" label="置信度" width="100" align="center">
                      <template #default="scope">
                        <span class="font-semibold text-green-600">{{ scope.row.confidence }}%</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="coordinates" label="坐标位置" width="200" align="center">
                      <template #default="scope">
                        <div class="text-xs">
                          <div>X: {{ scope.row.coordinates.xmin }}-{{ scope.row.coordinates.xmax }}</div>
                          <div>Y: {{ scope.row.coordinates.ymin }}-{{ scope.row.coordinates.ymax }}</div>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </div>
            </el-card>
          </div>

          <!-- 右侧：控制面板 -->
          <div class="space-y-4 md:space-y-6 order-1 lg:order-2">
            <!-- 文件输入 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">文件导入</span>
              </template>
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <el-button 
                    type="primary" 
                    :icon="Picture" 
                    @click="selectImage"
                    :loading="isProcessing"
                    style="width: 100%"
                  >
                    选择图片
                  </el-button>
                  <el-button 
                    type="success" 
                    :icon="VideoPlay" 
                    @click="selectVideo"
                    :loading="isProcessing"
                    style="width: 100%"
                  >
                    选择视频
                  </el-button>
                  <el-button 
                    type="warning" 
                    :icon="Camera" 
                    @click="toggleCamera"
                    :loading="isProcessing"
                    style="width: 100%"
                  >
                    {{ isCameraOpen ? '关闭摄像头' : '开启摄像头' }}
                  </el-button>
                  <el-button 
                    type="info" 
                    :icon="Folder" 
                    @click="selectFolder"
                    :loading="isProcessing"
                    style="width: 100%"
                  >
                    批量处理
                  </el-button>
                </div>
                
                <!-- 隐藏的文件输入 -->
                <input 
                  ref="imageInput" 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload" 
                  style="display: none"
                />
                <input 
                  ref="videoInput" 
                  type="file" 
                  accept="video/*" 
                  @change="handleVideoUpload" 
                  style="display: none"
                />
                <input 
                  ref="folderInput" 
                  type="file" 
                  webkitdirectory 
                  @change="handleFolderUpload" 
                  style="display: none"
                />
              </div>
            </el-card>

            <!-- 推理参数 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">推理参数</span>
              </template>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">置信度阈值</label>
                  <div class="flex items-center space-x-3">
                    <el-slider 
                      v-model="confidenceThreshold" 
                      :min="0" 
                      :max="1" 
                      :step="0.01" 
                      :format-tooltip="val => `${(val * 100).toFixed(0)}%`"
                      class="flex-1"
                    />
                    <el-input-number 
                      v-model="confidenceThreshold" 
                      :min="0" 
                      :max="1" 
                      :step="0.01" 
                      :precision="2"
                      size="small"
                      style="width: 80px"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">连续推理延时</label>
                  <div class="flex items-center space-x-3">
                    <el-slider 
                      v-model="inferenceDelay" 
                      :min="1" 
                      :max="100" 
                      :step="1"
                      class="flex-1"
                    />
                    <el-input-number 
                      v-model="inferenceDelay" 
                      :min="1" 
                      :max="100" 
                      size="small"
                      style="width: 80px"
                    />
                    <span class="text-sm text-gray-500">ms</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 检测结果 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">检测结果</span>
              </template>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">目标数目</label>
                    <div class="text-2xl font-bold text-blue-600">{{ detectionResults.length }}</div>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">用时</label>
                    <div class="text-lg font-semibold text-green-600">{{ inferenceTime }}s</div>
                  </div>
                </div>
                
                <div v-if="detectionResults.length > 0">
                  <label class="block text-sm text-gray-600 mb-2">目标选择</label>
                  <el-select v-model="selectedTarget" placeholder="选择目标" class="w-full">
                    <el-option label="全部" value="all" />
                    <el-option 
                      v-for="(result, index) in detectionResults" 
                      :key="index"
                      :label="`${result.className}_${index}`"
                      :value="index"
                    />
                  </el-select>
                </div>

                <div v-if="selectedDetection" class="space-y-2">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">置信度</label>
                    <div class="text-lg font-semibold text-red-600">{{ selectedDetection.confidence }}%</div>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">目标位置</label>
                    <div class="text-sm space-y-1">
                      <div>Xmin: <span class="font-semibold text-red-600">{{ selectedDetection.coordinates.xmin }}</span></div>
                      <div>Ymin: <span class="font-semibold text-red-600">{{ selectedDetection.coordinates.ymin }}</span></div>
                      <div>Xmax: <span class="font-semibold text-red-600">{{ selectedDetection.coordinates.xmax }}</span></div>
                      <div>Ymax: <span class="font-semibold text-red-600">{{ selectedDetection.coordinates.ymax }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 视频操作 -->
            <el-card v-if="currentVideo" shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">视频操作</span>
              </template>
              <div class="space-y-3">
                <el-button 
                  type="primary" 
                  @click="startRealtimeDetection"
                  :disabled="isVideoDetecting"
                  class="w-full"
                >
                  {{ isVideoDetecting ? '正在检测中...' : '开始实时检测' }}
                </el-button>
                <el-button 
                  v-if="isVideoDetecting"
                  type="danger" 
                  @click="stopVideoProcessing"
                  class="w-full"
                >
                  停止检测
                </el-button>
                <p v-if="!isVideoDetecting" class="text-sm text-gray-500 text-center">
                  提示：先播放视频，然后点击按钮开始检测
                </p>
              </div>
            </el-card>

            <!-- 操作按钮 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">操作</span>
              </template>
              <div class="space-y-3 operation-buttons">
                <el-button 
                  type="success" 
                  :icon="Download" 
                  @click="saveResults"
                  :disabled="detectionResults.length === 0"
                  style="width: 100%"
                >
                  💾 保存结果
                </el-button>
                <el-button 
                  type="primary" 
                  @click="viewHistory"
                  style="width: 100%"
                >
                  📋 查看历史记录
                </el-button>
                <el-button 
                  type="warning" 
                  :icon="Refresh" 
                  @click="clearResults"
                  style="width: 100%"
                >
                  🔄 清空/刷新
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Picture, 
  VideoPlay, 
  Camera, 
  Folder, 
  Download, 
  Refresh, 
  Close 
} from '@element-plus/icons-vue'
import translationApiService from '@/services/translationApi'

export default {
  name: 'Translate',
  components: {
    Picture,
    VideoPlay,
    Camera,
    Folder,
    Download,
    Refresh,
    Close
  },
  setup() {
    // 响应式数据
    const mobileMenuOpen = ref(false)
    const isMobile = ref(window.innerWidth <= 768)
    const isProcessing = ref(false)
    const isCameraOpen = ref(false)
    const currentImage = ref('')
    const currentVideo = ref('')
    const detectionResults = ref([])
    const confidenceThreshold = ref(0.5)
    const inferenceDelay = ref(10)
    const inferenceTime = ref(0)
    const selectedTarget = ref('all')
    const currentFilePath = ref('')
    const videoProcessingProgress = ref('')
    const videoFPS = ref(30) // 默认30fps，从后端获取实际值
    
    // 摄像头相关
    const videoStream = ref(null)
    const mediaRecorder = ref(null)
    const cameraInterval = ref(null)
    
    // 文件输入引用
    const imageInput = ref(null)
    const videoInput = ref(null)
    const folderInput = ref(null)
    const videoElement = ref(null)
    const canvasOverlay = ref(null)
    const canvasDisplay = ref(null) // 用于显示检测后的视频帧
    const videoWidth = ref(0)
    const videoHeight = ref(0)
    const currentFrameDetections = ref(new Map())
    
    // 视频控制相关
    const isVideoPlaying = ref(false)
    const videoProgress = ref(0)
    const currentVideoTime = ref(0)
    const videoDuration = ref(0)

    // 计算属性
    const selectedDetection = computed(() => {
      if (selectedTarget.value === 'all' || detectionResults.value.length === 0) {
        return null
      }
      return detectionResults.value[selectedTarget.value]
    })

    // 使用API服务
    const apiService = translationApiService

    // 工具函数
    const showMessage = (message, type = 'info') => {
      ElMessage({
        message,
        type,
        duration: 3000
      })
    }

    const formatTime = (seconds) => {
      return seconds.toFixed(3)
    }

    // 文件选择方法
    const selectImage = () => {
      imageInput.value?.click()
    }

    const selectVideo = () => {
      videoInput.value?.click()
    }

    const selectFolder = () => {
      folderInput.value?.click()
    }

    // 摄像头控制
    const toggleCamera = async () => {
      if (isCameraOpen.value) {
        stopCamera()
      } else {
        await startCamera()
      }
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        })
        videoStream.value = stream
        
        // 创建视频元素
        const video = document.createElement('video')
        video.srcObject = stream
        video.play()
        
        isCameraOpen.value = true
        showMessage('摄像头已开启', 'success')
        
        // 开始连续检测
        startContinuousDetection(video)
      } catch (error) {
        showMessage('无法访问摄像头: ' + error.message, 'error')
      }
    }

    const stopCamera = () => {
      if (videoStream.value) {
        videoStream.value.getTracks().forEach(track => track.stop())
        videoStream.value = null
      }
      if (cameraInterval.value) {
        clearInterval(cameraInterval.value)
        cameraInterval.value = null
      }
      isCameraOpen.value = false
      showMessage('摄像头已关闭', 'info')
    }

    const startContinuousDetection = (video) => {
      cameraInterval.value = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0)
          
          const imageData = canvas.toDataURL('image/jpeg')
          await processImage(imageData, 'camera_frame')
        }
      }, inferenceDelay.value)
    }

    // 文件处理方法
    const onVideoLoaded = () => {
      console.log('Video loaded, setting up canvas...')
      if (videoElement.value && canvasOverlay.value) {
        // 延迟一下确保视频渲染完成
        setTimeout(() => {
          // 获取视频的实际显示尺寸
        const videoRect = videoElement.value.getBoundingClientRect()
        videoWidth.value = videoRect.width
        videoHeight.value = videoRect.height
          
          console.log('Video dimensions:', videoRect.width, videoRect.height)
        
        // 设置canvas尺寸，与视频显示尺寸一致
        canvasOverlay.value.width = videoRect.width
        canvasOverlay.value.height = videoRect.height
        
        // 设置Canvas样式，使其覆盖视频
        canvasOverlay.value.style.width = videoRect.width + 'px'
        canvasOverlay.value.style.height = videoRect.height + 'px'
        canvasOverlay.value.style.position = 'absolute'
        canvasOverlay.value.style.top = '0'
        canvasOverlay.value.style.left = '0'
        }, 100)
      }
    }

    const handleVideoPlay = () => {
      if (isVideoDetecting.value) {
        console.log('视频开始播放，检测中...')
      }
    }

    const handleVideoPause = () => {
      console.log('视频暂停')
    }

    const handleVideoError = (e) => {
      console.error('Video error:', e)
      console.error('Video element:', e.target)
      console.error('Video source:', e.target.src)
      
      if (e.target.error) {
        const error = e.target.error
        console.error('Video error code:', error.code)
        console.error('Video error message:', error.message)
        
        let errorMessage = '视频加载失败'
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = '视频加载被中止'
            break
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = '网络错误导致视频加载失败'
            break
          case 3: // MEDIA_ERR_DECODE
            errorMessage = '视频解码失败，请检查视频编码格式'
            break
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = '视频格式不支持，请使用H.264编码的MP4视频'
            break
        }
        
        showMessage(errorMessage, 'error')
      }
    }


    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        await processImage(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    }

    const videoProcessingInterval = ref(null)
    const isVideoDetecting = ref(false)
    const currentVideoFile = ref(null)

    const handleVideoUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) {
        console.log('没有选择文件')
        return
      }

      console.log('视频文件选择:', file.name, file.type, file.size)

      try {
        // 清空之前的显示和检测状态
        currentImage.value = ''
        currentVideo.value = ''
        detectionResults.value = []
        isProcessing.value = false
        isVideoDetecting.value = false
        
        // 停止之前的检测
        stopVideoProcessing()
        
        // 保存文件引用用于实时检测
        currentVideoFile.value = file

        // 检查文件类型
        console.log('文件类型:', file.type)
        console.log('文件大小:', file.size)

        // 立即显示视频 - 使用URL.createObjectURL
        try {
        currentVideo.value = URL.createObjectURL(file)
        console.log('视频URL已设置:', currentVideo.value)
          console.log('currentVideo状态:', currentVideo.value)
          
          // 验证URL是否有效
          fetch(currentVideo.value, {method: 'HEAD'})
            .then(response => {
              console.log('Blob URL验证成功:', response.ok, response.status, response.headers.get('content-type'))
            })
            .catch(err => {
              console.error('Blob URL验证失败:', err)
            })
        } catch (error) {
          console.error('创建Blob URL失败:', error)
          showMessage('创建视频URL失败: ' + error.message, 'error')
        }
        
        // 等待DOM更新
        await nextTick()
        
        console.log('DOM更新完成，检查videoElement:', !!videoElement.value)
        
        // 等待一下让DOM完全渲染
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 再次检查videoElement
        if (videoElement.value) {
          console.log('videoElement存在，设置事件监听器')
          console.log('videoElement src:', videoElement.value.src)
          
          videoElement.value.onloadedmetadata = () => {
            console.log('视频元数据已加载')
            console.log('视频尺寸:', videoElement.value.videoWidth, 'x', videoElement.value.videoHeight)
          }
          
          videoElement.value.onloadeddata = () => {
            console.log('视频数据已加载')
            onVideoLoaded()
          }
          
          videoElement.value.onplay = () => {
            console.log('视频开始播放')
            handleVideoPlay()
          }
          
          videoElement.value.onerror = (e) => {
            console.error('视频加载错误:', e)
            console.error('视频错误代码:', videoElement.value.error?.code)
            console.error('视频错误信息:', videoElement.value.error?.message)
          }
        } else {
          console.error('videoElement不存在！')
        }
        
        showMessage('视频已加载，请播放视频并点击"开始实时检测"', 'success')
        
      } catch (error) {
        console.error('视频处理错误:', error)
        showMessage('视频处理失败: ' + error.message, 'error')
      }
    }

    // 开始实时检测
    const startRealtimeDetection = async () => {
      if (!currentVideoFile.value) {
        showMessage('请先选择视频', 'warning')
        return
      }
      
      if (isVideoDetecting.value) {
        return
      }
      
      // 确保视频元素已加载
      if (!videoElement.value) {
        showMessage('视频元素未加载，请稍候再试', 'error')
          return
        }
        
      // 初始化canvas显示
      if (canvasDisplay.value && videoElement.value) {
        canvasDisplay.value.width = videoElement.value.videoWidth
        canvasDisplay.value.height = videoElement.value.videoHeight
        videoDuration.value = videoElement.value.duration
      }
      
      isVideoDetecting.value = true
      isVideoPlaying.value = false
      isProcessing.value = false
      
      showMessage('点击播放开始检测...', 'info')
      
      // 开始视频帧处理和绘制
      processVideoFrames()
    }

    // 处理视频帧（逐帧检测显示）
    const processVideoFrames = async () => {
      if (!isVideoDetecting.value || !videoElement.value || !canvasDisplay.value) {
        return
      }
      
        const video = videoElement.value
      
      // 检查视频是否结束
      if (video.ended || video.currentTime >= video.duration) {
        isVideoDetecting.value = false
        isVideoPlaying.value = false
        videoProgress.value = 100
        currentVideoTime.value = video.duration
        showMessage('检测完成', 'success')
        return
      }
      
      // 更新进度
      currentVideoTime.value = video.currentTime
      videoProgress.value = video.duration ? (video.currentTime / video.duration * 100) : 0
      
      // 抓取当前帧并检测
      const canvas = canvasDisplay.value
        const ctx = canvas.getContext('2d')
      
      // 绘制当前视频帧
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 进行检测
        try {
          // 等待检测完成后再继续
          await new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
              if (!blob || !isVideoDetecting.value) {
                resolve()
                return
              }
          
          try {
            // 调用API检测当前帧
            const result = await apiService.detectImage(blob, confidenceThreshold.value)
            
                // 更新检测结果
                result.detections.forEach((detection) => {
              detectionResults.value.push({
                index: detectionResults.value.length + 1,
                className: detection.className,
                confidence: detection.confidence,
                coordinates: detection.coordinates,
                    filePath: `${currentVideoFile.value.name}_${video.currentTime.toFixed(2)}s`,
                timestamp: video.currentTime
              })
            })
            
                // 在canvas上绘制检测框
                if (result.detections.length > 0) {
                  drawDetectionsOnCanvas(result.detections, canvas.width, canvas.height)
                }
                
          } catch (error) {
            console.error('检测失败:', error)
              } finally {
                resolve()
          }
        }, 'image/jpeg', 0.9)
          })
      } catch (error) {
          console.error('帧处理错误:', error)
        }
      }
      
      // 移动到下一帧
      if (isVideoDetecting.value && !video.ended) {
        // 使用固定间隔移动到下一帧（例如每100ms跳转一次）
        const nextTime = video.currentTime + 0.1 // 每次增加0.1秒
        
        if (nextTime < video.duration) {
          // 等待当前帧处理完成后再跳到下一帧
          await new Promise((resolve) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked)
              setTimeout(resolve, 100) // 等待100ms后继续
            }
            video.addEventListener('seeked', onSeeked)
            video.currentTime = nextTime
          })
          
          // 处理下一帧
          if (isVideoDetecting.value) {
            processVideoFrames()
          }
        }
      }
    }
    
    // 在canvas上绘制检测框
    const drawDetectionsOnCanvas = (detections, width, height) => {
      if (!canvasDisplay.value || detections.length === 0) return
      
      const ctx = canvasDisplay.value.getContext('2d')
      
      detections.forEach(detection => {
        const coords = detection.coordinates
        const x = coords.xmin
        const y = coords.ymin
        const w = coords.xmax - coords.xmin
        const h = coords.ymax - coords.ymin
        
        // 绘制检测框
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, w, h)
        
        // 绘制标签背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        const label = `${detection.className} ${detection.confidence}%`
        const textMetrics = ctx.measureText(label)
        ctx.fillRect(x, y - 20, textMetrics.width + 10, 20)
        
        // 绘制标签文本
        ctx.fillStyle = '#00ff00'
        ctx.font = '14px Arial'
        ctx.fillText(label, x + 5, y - 5)
      })
    }

    // 在canvas上绘制当前帧的检测框
    const drawFrameDetections = (detections, width, height) => {
      if (!canvasOverlay.value || !videoElement.value || detections.length === 0) return
      
      const canvas = canvasOverlay.value
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // 计算缩放比例（视频原始尺寸 -> 显示尺寸）
      const video = videoElement.value
      const scaleX = canvas.width / width
      const scaleY = canvas.height / height
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      detections.forEach(detection => {
        // 绘制检测框
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.font = '16px Arial'
        
        const coords = detection.coordinates
        const x = coords.xmin * scaleX
        const y = coords.ymin * scaleY
        const w = (coords.xmax - coords.xmin) * scaleX
        const h = (coords.ymax - coords.ymin) * scaleY
        
        // 绘制矩形
        ctx.strokeRect(x, y, w, h)
        
        // 绘制标签背景
        const label = `${detection.className} ${detection.confidence}%`
        const textMetrics = ctx.measureText(label)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(x, y - 25, textMetrics.width + 10, 25)
        
        // 绘制标签文本
        ctx.fillStyle = '#00ff00'
        ctx.fillText(label, x + 5, y - 5)
      })
    }

    const stopDetection = () => {
      videoProcessingProgress.value = ''
    }

    const stopVideoProcessing = () => {
      isVideoDetecting.value = false
      isProcessing.value = false
      
      // 清除定时器
      if (videoProcessingInterval.value) {
        clearInterval(videoProcessingInterval.value)
        videoProcessingInterval.value = null
      }
      
      // 清空canvas
      if (canvasOverlay.value) {
        const ctx = canvasOverlay.value.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasOverlay.value.width, canvasOverlay.value.height)
        }
      }
      
      showMessage('已停止检测', 'info')
    }

    const handleFolderUpload = async (event) => {
      const files = Array.from(event.target.files)
      if (files.length === 0) return

      showMessage(`开始批量处理 ${files.length} 个文件...`, 'info')
      
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = async (e) => {
            await processImage(e.target.result, file.name)
          }
          reader.readAsDataURL(file)
          
          // 添加延迟避免同时处理太多文件
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    // 图像处理方法
    const processImage = async (imageData, filename) => {
      if (isProcessing.value) return
      
      isProcessing.value = true
      const startTime = Date.now()
      
      try {
        // 将base64转换为blob
        const response = await fetch(imageData)
        const blob = await response.blob()
        
        // 使用API服务进行检测
        const result = await apiService.detectImage(blob, confidenceThreshold.value)
        
        // 更新显示图像
        currentImage.value = `data:image/jpeg;base64,${result.image}`
        
        // 更新检测结果
        detectionResults.value = result.detections.map((detection, index) => ({
          index: index + 1,
          className: detection.className,
          confidence: detection.confidence,
          coordinates: detection.coordinates,
          filePath: detection.filePath || filename
        }))
        
        // 更新推理时间
        inferenceTime.value = formatTime(result.inference_time)
        
        // 只有检测到目标时才提示
        if (result.detections.length > 0) {
        showMessage(`检测完成，发现 ${result.detections.length} 个目标`, 'success')
        }
      } catch (error) {
        console.error('检测错误:', error)
        showMessage('检测失败: ' + error.message, 'error')
      } finally {
        isProcessing.value = false
      }
    }

    // 结果处理方法
    const saveResults = async () => {
      if (detectionResults.value.length === 0) {
        showMessage('没有检测结果可保存', 'warning')
        return
      }

      try {
        const saveData = {
          results: detectionResults.value,
          timestamp: Date.now(),
          confidence_threshold: confidenceThreshold.value,
          inference_time: inferenceTime.value
        }

        const result = await apiService.saveResults(saveData)
        showMessage(`结果已保存到: ${result.file_path}`, 'success')
      } catch (error) {
        showMessage('保存失败: ' + error.message, 'error')
      }
    }

    const clearResults = () => {
      ElMessageBox.confirm(
        '确定要清空所有检测结果并刷新页面吗？',
        '确认清空/刷新',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        detectionResults.value = []
        currentImage.value = ''
        currentVideo.value = ''
        currentVideoFile.value = null
        selectedTarget.value = 'all'
        inferenceTime.value = 0
        isVideoDetecting.value = false
        stopVideoProcessing()
        showMessage('页面已刷新', 'success')
      }).catch(() => {
        // 用户取消
      })
    }
    
    // 查看历史记录
    const viewHistory = () => {
      if (detectionResults.value.length === 0) {
        showMessage('暂无历史记录', 'info')
        return
      }
      
      // 在对话框中显示历史记录
      ElMessageBox.alert(
        `共 ${detectionResults.value.length} 条检测记录\n\n` +
        `检测时间: ${new Date().toLocaleString()}\n` +
        `置信度阈值: ${confidenceThreshold.value}\n\n` +
        '点击"保存结果"可以将这些记录保存到文件。',
        '历史记录',
        {
          confirmButtonText: '确定',
          type: 'info'
        }
      )
    }

    const exitApplication = () => {
      ElMessageBox.confirm(
        '确定要退出应用程序吗？',
        '确认退出',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清理资源
        stopCamera()
        window.close()
      }).catch(() => {
        // 用户取消
      })
    }

    // 监听目标选择变化
    const handleTargetChange = () => {
      // 这里可以添加目标选择变化的处理逻辑
      console.log('选择的目标:', selectedTarget.value)
    }

    // 生命周期
    onMounted(() => {
      document.title = '手语识别翻译系统 - 手语教学平台'
      
      // 检查API连接
      checkAPIHealth()
      
      // 监听窗口resize，更新Canvas尺寸
      window.addEventListener('resize', updateCanvasSize)

      // 监听窗口大小变化，更新移动端状态
      const handleResize = () => {
        isMobile.value = window.innerWidth <= 768
      }
      window.addEventListener('resize', handleResize)

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    })

    onUnmounted(() => {
      stopCamera()
      window.removeEventListener('resize', updateCanvasSize)
      if (videoProcessingInterval.value) {
        clearInterval(videoProcessingInterval.value)
      }
    })

    const updateCanvasSize = () => {
      if (videoElement.value && canvasOverlay.value && currentVideo.value) {
        const videoRect = videoElement.value.getBoundingClientRect()
        canvasOverlay.value.width = videoRect.width
        canvasOverlay.value.height = videoRect.height
        canvasOverlay.value.style.width = videoRect.width + 'px'
        canvasOverlay.value.style.height = videoRect.height + 'px'
      }
    }

    // API健康检查
    const checkAPIHealth = async () => {
      try {
        const result = await apiService.checkHealth()
        if (result.model_loaded) {
          showMessage('AI模型已加载，系统就绪', 'success')
        } else {
          showMessage('AI模型未加载，请检查后端服务', 'warning')
        }
      } catch (error) {
        showMessage('无法连接到后端服务，请确保API服务正在运行', 'error')
      }
    }

    // 视频控制：播放/暂停（逐帧检测模式下不使用）
    const toggleVideoPlayPause = () => {
      // 逐帧检测模式下不需要手动播放控制
      // 检测会自动逐帧进行
    }
    
    // 视频进度条跳转（逐帧检测模式下不使用）
    const seekVideo = (e) => {
      // 逐帧检测模式下不能手动跳转
      // 检测会按顺序逐帧进行
    }
    
    // 格式化时间显示
    const formatVideoTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    // 处理图片加载，防止页面缩放
    const handleImageLoad = (event) => {
      // 确保图片不会导致页面缩放
      const img = event.target
      if (img && isMobile.value) {
        // 限制图片最大宽度为屏幕宽度
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
      }
    }

    // 检查视频状态
    const checkVideoStatus = () => {
      console.log('=== 视频状态检查 ===')
      console.log('currentVideo:', currentVideo.value)
      console.log('videoElement:', videoElement.value)
      
      if (videoElement.value) {
        console.log('video.src:', videoElement.value.src)
        console.log('video.readyState:', videoElement.value.readyState)
        console.log('video.duration:', videoElement.value.duration)
        console.log('video.videoWidth:', videoElement.value.videoWidth)
        console.log('video.videoHeight:', videoElement.value.videoHeight)
        console.log('video.error:', videoElement.value.error)
        console.log('video.networkState:', videoElement.value.networkState)
        console.log('video.currentSrc:', videoElement.value.currentSrc)
        
        if (videoElement.value.error) {
          console.error('视频错误代码:', videoElement.value.error.code)
          console.error('视频错误信息:', videoElement.value.error.message)
          showMessage(`视频加载错误: ${videoElement.value.error.message}`, 'error')
        } else {
          showMessage('视频状态正常', 'success')
        }
      } else {
        showMessage('videoElement不存在', 'warning')
      }
    }

    return {
      // 响应式数据
      mobileMenuOpen,
      isMobile,
      isProcessing,
      isCameraOpen,
      currentImage,
      currentVideo,
      detectionResults,
      confidenceThreshold,
      inferenceDelay,
      inferenceTime,
      selectedTarget,
      selectedDetection,
      videoProcessingProgress,
      videoFPS,
      isVideoDetecting,
      currentVideoFile,
      isVideoPlaying,
      videoProgress,
      currentVideoTime,
      videoDuration,
      
      // 引用
      imageInput,
      videoInput,
      folderInput,
      videoElement,
      canvasOverlay,
      canvasDisplay,
      videoWidth,
      videoHeight,
      currentFrameDetections,
      
      // 图标
      Picture,
      VideoPlay,
      Camera,
      Folder,
      Download,
      Refresh,
      Close,
      
      // 方法
      selectImage,
      selectVideo,
      selectFolder,
      toggleCamera,
      handleImageUpload,
      handleVideoUpload,
      handleFolderUpload,
      saveResults,
      clearResults,
      exitApplication,
      handleTargetChange,
      viewHistory,
      stopVideoProcessing,
      startRealtimeDetection,
      handleVideoPlay,
      handleVideoPause,
      handleVideoError,
      checkVideoStatus,
      toggleVideoPlayPause,
      seekVideo,
      formatVideoTime,
      handleImageLoad
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

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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

/* 表格美化 */
:deep(.el-table) {
  border-radius: 12px !important;
  overflow: hidden !important;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600 !important;
}

:deep(.el-table tbody tr:hover) {
  background-color: rgba(102, 126, 234, 0.05) !important;
  transition: all 0.3s ease !important;
}

/* 标签美化 */
:deep(.el-tag) {
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-weight: 500 !important;
}

/* 滑块美化 */
:deep(.el-slider__runway) {
  border-radius: 10px !important;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 10px !important;
}

:deep(.el-slider__button) {
  border-color: #667eea !important;
  width: 18px !important;
  height: 18px !important;
}

/* 输入框美化 */
:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background-color: rgba(102, 126, 234, 0.2) !important;
}

/* 自定义样式 */
.translate-container {
  @apply min-h-screen;
}

/* 图像显示区域样式 */
.image-display-area {
  @apply bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden;
  min-height: 384px;
}

.image-display-area img {
  @apply max-w-full max-h-full object-contain;
}

/* 加载动画 */
.loading-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center;
}

.loading-spinner {
  @apply animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4;
}

/* 控制面板样式 */
.control-panel {
  @apply space-y-6;
}

.control-card {
  @apply bg-white rounded-lg shadow-md p-4;
}

/* 按钮组样式 */
.button-grid {
  @apply grid grid-cols-2 gap-3;
}

/* 参数控制样式 */
.parameter-control {
  @apply space-y-4;
}

.parameter-item {
  @apply space-y-2;
}

.parameter-label {
  @apply block text-sm font-medium text-gray-700;
}

.parameter-control-group {
  @apply flex items-center space-x-3;
}

/* 结果显示样式 */
.result-display {
  @apply space-y-4;
}

.result-stats {
  @apply grid grid-cols-2 gap-4;
}

.stat-item {
  @apply space-y-1;
}

.stat-label {
  @apply block text-sm text-gray-600;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-value-time {
  @apply text-lg font-semibold text-green-600;
}

.stat-value-count {
  @apply text-2xl font-bold text-blue-600;
}

/* 目标选择样式 */
.target-selector {
  @apply space-y-2;
}

.target-select {
  @apply w-full;
}

/* 检测详情样式 */
.detection-details {
  @apply space-y-2;
}

.detail-item {
  @apply space-y-1;
}

.detail-label {
  @apply block text-sm text-gray-600;
}

.detail-value {
  @apply text-lg font-semibold text-red-600;
}

.coordinate-display {
  @apply text-sm space-y-1;
}

.coordinate-line {
  @apply flex justify-between;
}

.coordinate-label {
  @apply text-gray-600;
}

.coordinate-value {
  @apply font-semibold text-red-600;
}

/* 操作按钮样式 */
.action-buttons {
  @apply space-y-3;
}

.action-button {
  @apply w-full;
}

/* 表格样式 */
.result-table {
  @apply w-full;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .translate-container {
    @apply px-4;
  }
  
  .button-grid {
    @apply grid-cols-1;
  }
  
  .result-stats {
    @apply grid-cols-1;
  }
}

@media (max-width: 768px) {
  .image-display-area {
    @apply h-64;
    min-height: 256px;
  }
  
  .parameter-control-group {
    @apply flex-col space-x-0 space-y-2;
  }

  /* 移动端表格优化 */
  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 4px !important;
  }

  /* 移动端卡片优化 */
  :deep(.el-card__body) {
    padding: 12px !important;
  }

  /* 移动端按钮优化 */
  :deep(.el-button) {
    padding: 10px 16px !important;
    font-size: 14px !important;
  }

  /* 移动端输入框优化 */
  :deep(.el-input),
  :deep(.el-textarea) {
    font-size: 16px !important; /* 防止iOS自动缩放 */
  }

  /* 移动端滑块优化 */
  :deep(.el-slider) {
    margin: 10px 0;
  }

  /* 防止图片导致页面缩放 */
  img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
  }

  /* 防止页面自动缩放 */
  body {
    touch-action: pan-y;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* 状态指示器 */
.status-indicator {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.status-ready {
  @apply bg-blue-100 text-blue-800;
}

.status-processing {
  @apply bg-green-100 text-green-800;
}

.status-error {
  @apply bg-red-100 text-red-800;
}

/* 检测结果标签 */
.detection-tag {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.detection-tag-success {
  @apply bg-green-100 text-green-800;
}

.detection-tag-warning {
  @apply bg-yellow-100 text-yellow-800;
}

.detection-tag-danger {
  @apply bg-red-100 text-red-800;
}

/* 按钮对齐修复 */
.grid.grid-cols-2 {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 12px !important;
  align-items: stretch !important;
}

.grid.grid-cols-2 > * {
  grid-column: auto !important;
}

.grid.grid-cols-2 :deep(.el-button) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.grid.grid-cols-2 :deep(.el-button) > * {
  flex-shrink: 0;
}

/* 确保第一列的所有元素在同一位置开始 */
.grid.grid-cols-2 > *:nth-child(odd) {
  grid-column: 1;
}

.grid.grid-cols-2 > *:nth-child(even) {
  grid-column: 2;
}

/* 操作按钮对齐 */
.operation-buttons {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.operation-buttons :deep(.el-button) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}
</style>
