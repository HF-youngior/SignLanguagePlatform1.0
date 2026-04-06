<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="/images/default-avatar.png" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <!-- 桌面端导航 -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学堂</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">手语圈</router-link>
            <router-link to="/translate" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">译站</router-link>
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
            to="/learn"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            学堂
          </router-link>
          <router-link
            to="/translate"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-blue-700 bg-blue-50 font-semibold rounded-lg"
          >
            译站
          </router-link>
          <router-link
            to="/community"
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            手语圈
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
        <div class="space-y-4 md:space-y-6">
          <!-- 输入选择（放在最前面） -->
          <el-card shadow="hover" class="w-full">
            <template #header>
              <span class="text-lg font-semibold">📁 输入选择</span>
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <el-button 
                  type="primary" 
                  :icon="Picture" 
                  @click="selectImage"
                  :loading="isProcessing"
                  class="h-16 flex items-center justify-center"
                  style="width: 100%"
                >
                  <span class="text-base">选择图片</span>
                </el-button>
                <el-button 
                  type="success" 
                  :icon="VideoPlay" 
                  @click="selectVideo"
                  :loading="isProcessing"
                  class="h-16 flex items-center justify-center"
                  style="width: 100%"
                >
                  <span class="text-base">选择视频</span>
                </el-button>
                <el-button 
                  type="warning" 
                  :icon="Camera" 
                  @click="toggleCamera"
                  :loading="isProcessing"
                  class="h-16 flex items-center justify-center"
                  style="width: 100%"
                >
                  <span class="text-base">{{ isCameraOpen ? '关闭摄像头' : '开启摄像头' }}</span>
                </el-button>
                <el-button 
                  type="info" 
                  :icon="Folder" 
                  @click="selectFolder"
                  :loading="isProcessing"
                  class="h-16 flex items-center justify-center"
                  style="width: 100%"
                >
                  <span class="text-base">批量处理</span>
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
                accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg" 
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

          <!-- 翻译结果（放在视频框上面） -->
          <el-card shadow="hover" class="w-full">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold">📝 翻译结果</span>
                <div class="flex items-center space-x-2">
                  <el-tag v-if="detectionResults.length > 0" type="success" size="large">{{ detectionResults.length }} 个结果</el-tag>
                  <el-dropdown trigger="click">
                    <el-button type="primary" :icon="Download">
                      操作
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="saveResults" :disabled="detectionResults.length === 0">
                          💾 保存结果
                        </el-dropdown-item>
                        <el-dropdown-item @click="viewHistory">
                          📋 查看历史记录
                        </el-dropdown-item>
                        <el-dropdown-item @click="clearResults">
                          🔄 清空/刷新
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <!-- 翻译结果列表 -->
              <div v-if="detectionResults.length > 0" class="space-y-3">
                <div 
                  v-for="(result, index) in detectionResults" 
                  :key="index"
                  class="p-5 bg-blue-50 rounded-lg border border-blue-200 shadow-sm"
                >
                  <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div class="flex items-center mb-2 md:mb-0">
                      <span class="text-2xl md:text-3xl font-bold text-blue-700 mr-3">{{ result.className }}</span>
                      <el-tag type="success" size="medium">{{ result.confidence }}%</el-tag>
                    </div>
                    <span class="text-sm text-gray-500">{{ result.filePath || '检测结果' }}</span>
                  </div>
                </div>
              </div>
              <!-- 无翻译结果时显示 -->
              <div v-else class="text-center py-8">
                <div class="text-4xl mb-4">📝</div>
                <p class="text-gray-600">无翻译结果</p>
                <p class="text-sm text-gray-500 mt-2">请选择图片、视频或开启摄像头进行翻译</p>
              </div>
            </div>
          </el-card>

          <!-- 视频/图像显示区域 -->
          <el-card shadow="hover" class="w-full">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold">📹 视频/图像显示</span>
                <el-tag :type="isProcessing ? 'success' : 'info'">
                  {{ isProcessing ? '处理中' : '就绪' }}
                </el-tag>
              </div>
            </template>
            <div class="relative">
              <!-- 图像/视频显示区域 -->
              <div class="bg-gray-100 rounded-lg mb-4 relative" :style="{ minHeight: isMobile ? '300px' : '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                <div v-if="!currentImage && !currentVideo" class="text-center py-8">
                  <div class="text-6xl mb-4">📷</div>
                  <p class="text-gray-600">请选择图片、视频或开启摄像头</p>
                  <p class="text-sm text-gray-500">支持格式：JPG, PNG, MP4, WebM</p>
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
                  <!-- 显示的视频元素 -->
                  <video 
                    ref="videoElement"
                    :src="currentVideo" 
                    preload="auto"
                    controls
                    style="max-width: 100%; max-height: 500px; display: block;"
                    @loadeddata="onVideoLoaded"
                    @play="handleVideoPlay"
                    @pause="handleVideoPause"
                    @loadedmetadata="() => { console.log('Video metadata loaded'); }"
                    @error="(e) => handleVideoError(e)"
                  >
                    您的浏览器不支持该视频格式
                  </video>
                  
                  <!-- 检测框overlay canvas -->
                  <canvas 
                    v-if="isVideoDetecting"
                    ref="canvasOverlay"
                    class="absolute"
                    style="pointer-events: none; top: 0; left: 0; z-index: 10;"
                  />
                  
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
                <!-- 加载遮罩 -->
                <div v-if="!currentVideo && !currentImage && isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div class="text-white text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>AI识别中...</p>
                    <p v-if="videoProcessingProgress" class="mt-2 text-sm">{{ videoProcessingProgress }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
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
import apiService from '@/services/api'

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
        // 弹出模型选择弹窗
        ElMessageBox.confirm(
          '请选择摄像头识别模式',
          '选择模型',
          {
            confirmButtonText: 'YOLO模型（单词语识别）',
            cancelButtonText: 'Seq2Seq模型（连续识别）',
            type: 'info',
            customClass: 'model-select-dialog'
          }
        ).then(async () => {
          // 使用YOLO模型
          await startCamera('yolo')
        }).catch(async (action) => {
          // 只有当action不是'cancel'时才使用Seq2Seq模型
          // 当用户点击取消按钮时，action会是'cancel'
          if (action !== 'cancel') {
            await startCamera('seq2seq')
          }
        })
      }
    }

    const startCamera = async (model) => {
      try {
        // 检查浏览器是否支持getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showMessage('您的浏览器不支持摄像头访问', 'error')
          return
        }

        // 移动端兼容的摄像头参数
        const constraints = {
          video: {
            facingMode: 'environment', // 优先使用后置摄像头
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        }

        // 尝试获取摄像头权限
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (error) {
          // 如果后置摄像头失败，尝试前置摄像头
          console.warn('后置摄像头访问失败，尝试前置摄像头:', error)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          })
        }

        videoStream.value = stream
        
        // 创建视频元素
        const video = document.createElement('video')
        video.srcObject = stream
        video.autoplay = true
        video.playsInline = true // 移动端必需
        video.muted = true // 避免音频问题
        
        // 等待视频加载完成
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve()
          }
        })
        
        video.play()
        
        isCameraOpen.value = true
        showMessage('摄像头已开启', 'success')
        
        // 开始连续检测
        startContinuousDetection(video, model)
      } catch (error) {
        console.error('摄像头访问错误:', error)
        
        // 提供更详细的错误信息
        let errorMessage = '无法访问摄像头'
        if (error.name === 'NotAllowedError') {
          errorMessage = '请允许浏览器访问摄像头权限'
        } else if (error.name === 'NotFoundError') {
          errorMessage = '未找到摄像头设备'
        } else if (error.name === 'NotReadableError') {
          errorMessage = '摄像头可能被其他应用占用'
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = '摄像头不支持请求的分辨率'
        }
        
        showMessage(errorMessage + ': ' + error.message, 'error')
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

    const startContinuousDetection = (video, model) => {
      // 增加检测间隔，减少检测频率，提高画面流畅度
      const detectionInterval = 2000 // 每2秒检测一次
      cameraInterval.value = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // 降低分辨率，提高处理速度
          const canvas = document.createElement('canvas')
          canvas.width = Math.min(video.videoWidth, 320) // 降低分辨率
          canvas.height = Math.min(video.videoHeight, 240)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          const imageData = canvas.toDataURL('image/jpeg', 0.7) // 降低图像质量
          await processImage(imageData, 'camera_frame', model)
        }
      }, detectionInterval)
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

      // 检查文件格式，AVI不被浏览器支持
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.avi')) {
        showMessage('❌ AVI格式不支持！请使用MP4格式视频。建议使用H.264编码的MP4文件。', 'error')
        console.error('不支持的文件格式: AVI')
        return
      }

      // 检查文件类型
      if (file.type && !file.type.startsWith('video/')) {
        showMessage('请选择有效的视频文件', 'warning')
        return
      }

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
        await new Promise(resolve => setTimeout(resolve, 500))
        
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
            
            // 自动开始分析视频
            console.log('视频已加载，自动开始分析...')
            // 确保currentVideoFile存在
            if (currentVideoFile.value) {
              // 添加延迟确保模型已经加载完成
              setTimeout(() => {
                startRealtimeDetection()
              }, 1000)
            } else {
              console.error('currentVideoFile不存在，无法开始检测')
              showMessage('视频文件未正确加载，请重新选择', 'error')
            }
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
          
          // 自动播放视频
          try {
            videoElement.value.play()
            console.log('视频自动开始播放')
          } catch (error) {
            console.error('自动播放失败:', error)
            // 自动播放失败时不报错，用户可以手动播放
            // 即使自动播放失败，也尝试开始识别
            console.log('自动播放失败，但尝试开始识别...')
            if (currentVideoFile.value) {
              startRealtimeDetection()
            }
          }
        } else {
          console.error('videoElement不存在！')
        }
        
        showMessage('视频已加载，正在自动识别...', 'success')
        
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
      
      // 视频默认使用Seq2Seq模型
      const model = 'seq2seq'
      
      // Seq2Seq模型：直接上传整个视频进行预测
      isVideoDetecting.value = true
      isProcessing.value = true
      
      showMessage('正在分析视频，请稍候...', 'info')
      
      try {
        // 调用视频检测接口
        const result = await translationApiService.detectVideo(
          currentVideoFile.value,
          confidenceThreshold.value,
          model
        )
        
        // 处理结果
        if (result.detections && result.detections.length > 0) {
          // 清空现有结果
          detectionResults.value = []
          
          // 添加Seq2Seq的识别结果
          result.detections.forEach((detection, index) => {
            detectionResults.value.push({
              index: index + 1,
              className: detection.className,
              confidence: detection.confidence,
              coordinates: detection.coordinates,
              filePath: currentVideoFile.value.name,
              timestamp: 0
            })
          })
          
          showMessage('视频分析完成', 'success')
        } else {
          showMessage('未检测到手语内容', 'info')
        }
      } catch (error) {
        console.error('视频分析失败:', error)
        showMessage('视频分析失败: ' + error.message, 'error')
      } finally {
        isVideoDetecting.value = false
        isProcessing.value = false
      }
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
      
      // 只有在用户主动停止时才显示提示
      // 注释掉自动停止时的提示，避免频繁弹出
      // showMessage('已停止检测', 'info')
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
    const processImage = async (imageData, filename, model = 'yolo') => {
      if (isProcessing.value) return
      
      isProcessing.value = true
      const startTime = Date.now()
      
      try {
        // 清空视频相关状态
        currentVideo.value = ''
        currentVideoFile.value = null
        isVideoDetecting.value = false
        stopVideoProcessing()
        
        // 将base64转换为blob
        const response = await fetch(imageData)
        const blob = await response.blob()
        
        // 使用API服务进行检测，传入指定的模型
        const result = await translationApiService.detectImage(blob, confidenceThreshold.value, model)
        
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
        // 检测失败时不显示提示，避免频繁弹出
      } catch (error) {
        console.error('检测错误:', error)
        // 注释掉错误提示，避免频繁弹出
        // showMessage('检测失败: ' + error.message, 'error')
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
        // 保存到Python后端
        const saveData = {
          results: detectionResults.value,
          timestamp: Date.now(),
          confidence_threshold: confidenceThreshold.value,
          inference_time: inferenceTime.value
        }

        const result = await translationApiService.saveResults(saveData)
        showMessage(`结果已保存到: ${result.file_path}`, 'success')
        
        // 同时保存到MySQL数据库（如果用户已登录）
        try {
          const token = localStorage.getItem('token')
          if (token) {
            const inputType = currentVideo.value ? 'video' : 'image'
            const inputContent = currentVideo.value || currentImage.value
            const resultText = detectionResults.value.map(d => d.className).join(', ')
            const confidence = detectionResults.value.length > 0 ? detectionResults.value[0].confidence : 0
            
            await apiService.saveTranslation({
              inputType,
              inputContent: inputContent.substring(0, 100) + '...', // 截取部分内容
              result: resultText,
              confidence,
              modelUsed: inputType === 'video' ? 'seq2seq' : 'yolo',
              processingTime: inferenceTime.value
            })
            console.log('翻译记录已保存到数据库')
          }
        } catch (dbError) {
          console.log('保存到数据库失败:', dbError)
          // 不影响主要功能
        }
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
    const viewHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // 从数据库获取历史记录
          try {
            const response = await apiService.getTranslationHistory()
            if (response.success && response.data.records.length > 0) {
              const records = response.data.records
              let historyText = `共 ${records.length} 条历史记录\n\n`
              
              records.forEach((record, index) => {
                historyText += `记录 ${index + 1}:\n`
                historyText += `时间: ${new Date(record.created_at).toLocaleString()}\n`
                historyText += `类型: ${record.input_type}\n`
                historyText += `结果: ${record.result}\n`
                historyText += `模型: ${record.model_used}\n`
                historyText += `用时: ${record.processing_time}s\n\n`
              })
              
              ElMessageBox.alert(
                historyText,
                '历史记录',
                {
                  confirmButtonText: '确定',
                  type: 'info',
                  customClass: 'history-dialog',
                  dangerouslyUseHTMLString: false
                }
              )
            } else {
              showMessage('暂无历史记录', 'info')
            }
          } catch (apiError) {
            console.error('API调用失败:', apiError)
            // 显示详细错误信息
            showMessage('获取历史记录失败: ' + (apiError.message || '未知错误'), 'error')
          }
        } else {
          // 未登录时显示当前检测结果
          if (detectionResults.value.length === 0) {
            showMessage('暂无历史记录', 'info')
            return
          }
          
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
      } catch (error) {
        console.error('获取历史记录失败:', error)
        showMessage('获取历史记录失败: ' + error.message, 'error')
      }
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

    // 预加载模型
    const preloadModels = async () => {
      try {
        console.log('开始预加载模型...')
        // 检查API健康状态，触发模型加载
        await translationApiService.checkHealth()
        console.log('模型预加载完成')
      } catch (error) {
        console.error('模型预加载失败:', error)
      }
    }

    // 生命周期
    onMounted(() => {
      document.title = '手语识别翻译系统 - 手语教学平台'
      
      // 预加载模型
      preloadModels()
      
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
        const result = await translationApiService.checkHealth()
        if (result.yolo_model_loaded || result.seq2seq_model_loaded) {
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

/* 模型选择弹窗样式 */
.model-select-dialog {
  max-width: 400px !important;
  width: 90% !important;
}

.model-select-dialog .el-message-box__btns {
  display: flex !important;
  flex-direction: column !important;
  gap: 15px !important;
  padding: 20px !important;
}

.model-select-dialog .el-button {
  width: 100% !important;
  min-height: 50px !important;
  font-size: 16px !important;
  border-radius: 8px !important;
  margin: 0 !important;
}

.model-select-dialog .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}

.model-select-dialog .el-button--default {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
  color: white !important;
}
</style>
