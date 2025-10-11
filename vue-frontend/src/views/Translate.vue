<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">手语教学平台</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-blue-600">首页</router-link>
            <router-link to="/learn" class="text-gray-600 hover:text-blue-600">学习</router-link>
            <router-link to="/community" class="text-gray-600 hover:text-blue-600">社区</router-link>
            <router-link to="/translate" class="text-blue-600 font-semibold">翻译</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🤖 手语识别翻译系统</h1>
          <p class="text-xl text-gray-600">基于YOLOv8的实时手语识别和智能翻译</p>
        </div>

        <!-- 主界面布局 -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- 左侧：图像显示区域 -->
          <div class="lg:col-span-2">
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
                <!-- 图像显示区域 -->
                <div class="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div v-if="!currentImage" class="text-center">
                    <div class="text-6xl mb-4">📷</div>
                    <p class="text-gray-600">请选择图片、视频或开启摄像头</p>
                    <p class="text-sm text-gray-500">支持格式：JPG, PNG, MP4, AVI</p>
                  </div>
                  <img 
                    v-else 
                    :src="currentImage" 
                    alt="检测结果" 
                    class="max-w-full max-h-full object-contain"
                  />
                  <!-- 加载遮罩 -->
                  <div v-if="isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div class="text-white text-center">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>AI识别中...</p>
                    </div>
                  </div>
                </div>

                <!-- 检测结果表格 -->
                <el-card v-if="detectionResults.length > 0" class="mt-4">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-semibold">检测结果与位置信息</span>
                      <el-tag type="success">{{ detectionResults.length }} 个目标</el-tag>
                    </div>
                  </template>
                  <el-table :data="detectionResults" stripe style="width: 100%">
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
          <div class="space-y-6">
            <!-- 文件输入 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">文件导入</span>
              </template>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <el-button 
                    type="primary" 
                    :icon="Picture" 
                    @click="selectImage"
                    :loading="isProcessing"
                  >
                    选择图片
                  </el-button>
                  <el-button 
                    type="success" 
                    :icon="VideoPlay" 
                    @click="selectVideo"
                    :loading="isProcessing"
                  >
                    选择视频
                  </el-button>
                  <el-button 
                    type="warning" 
                    :icon="Camera" 
                    @click="toggleCamera"
                    :loading="isProcessing"
                  >
                    {{ isCameraOpen ? '关闭摄像头' : '开启摄像头' }}
                  </el-button>
                  <el-button 
                    type="info" 
                    :icon="Folder" 
                    @click="selectFolder"
                    :loading="isProcessing"
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

            <!-- 操作按钮 -->
            <el-card shadow="hover">
              <template #header>
                <span class="text-lg font-semibold">操作</span>
              </template>
              <div class="space-y-3">
                <el-button 
                  type="success" 
                  :icon="Download" 
                  @click="saveResults"
                  :disabled="detectionResults.length === 0"
                  class="w-full"
                >
                  保存结果
                </el-button>
                <el-button 
                  type="warning" 
                  :icon="Refresh" 
                  @click="clearResults"
                  class="w-full"
                >
                  清空结果
                </el-button>
                <el-button 
                  type="danger" 
                  :icon="Close" 
                  @click="exitApplication"
                  class="w-full"
                >
                  退出
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
    const isProcessing = ref(false)
    const isCameraOpen = ref(false)
    const currentImage = ref('')
    const detectionResults = ref([])
    const confidenceThreshold = ref(0.5)
    const inferenceDelay = ref(10)
    const inferenceTime = ref(0)
    const selectedTarget = ref('all')
    const currentFilePath = ref('')
    
    // 摄像头相关
    const videoStream = ref(null)
    const mediaRecorder = ref(null)
    const cameraInterval = ref(null)
    
    // 文件输入引用
    const imageInput = ref(null)
    const videoInput = ref(null)
    const folderInput = ref(null)

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
    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        await processImage(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    }

    const handleVideoUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      showMessage('视频处理功能开发中...', 'info')
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
        
        showMessage(`检测完成，发现 ${result.detections.length} 个目标`, 'success')
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
        '确定要清空所有检测结果吗？',
        '确认清空',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        detectionResults.value = []
        currentImage.value = ''
        selectedTarget.value = 'all'
        inferenceTime.value = 0
        showMessage('结果已清空', 'success')
      }).catch(() => {
        // 用户取消
      })
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
    })

    onUnmounted(() => {
      stopCamera()
    })

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

    return {
      // 响应式数据
      isProcessing,
      isCameraOpen,
      currentImage,
      detectionResults,
      confidenceThreshold,
      inferenceDelay,
      inferenceTime,
      selectedTarget,
      selectedDetection,
      
      // 引用
      imageInput,
      videoInput,
      folderInput,
      
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
      handleTargetChange
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.translate-container {
  @apply min-h-screen bg-gray-50;
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
</style>
