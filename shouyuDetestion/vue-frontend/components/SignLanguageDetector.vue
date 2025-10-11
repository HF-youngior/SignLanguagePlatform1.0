<template>
  <div class="sign-language-detector">
    <!-- 标题栏 -->
    <div class="header">
      <h1>基于YOLOv8的手语翻译系统</h1>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧显示区域 -->
      <div class="display-area">
        <div class="video-container">
          <video 
            v-if="isVideoMode" 
            ref="videoElement" 
            :src="videoSrc" 
            autoplay 
            muted
            @loadeddata="onVideoLoaded"
          ></video>
          <canvas 
            v-else 
            ref="canvasElement" 
            :width="canvasWidth" 
            :height="canvasHeight"
          ></canvas>
          <div v-if="!hasContent" class="placeholder">
            <p>请选择图片、视频或开启摄像头</p>
          </div>
        </div>
      </div>

      <!-- 右侧控制面板 -->
      <div class="control-panel">
        <!-- 文件输入区域 -->
        <div class="input-section">
          <h3>文件输入</h3>
          <div class="input-buttons">
            <button @click="selectImage" class="btn btn-image">
              <i class="icon-image"></i>
              选择图片文件
            </button>
            <button @click="selectVideo" class="btn btn-video">
              <i class="icon-video"></i>
              选择视频文件
            </button>
            <button @click="toggleCamera" class="btn btn-camera" :class="{ active: isCameraActive }">
              <i class="icon-camera"></i>
              开启摄像头
            </button>
            <button @click="selectFolder" class="btn btn-folder">
              <i class="icon-folder"></i>
              选择图片文件夹
            </button>
          </div>
        </div>

        <!-- 推理参数设置 -->
        <div class="params-section">
          <h3>推理参数</h3>
          <div class="param-item">
            <label>置信度阈值：</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="confidenceThreshold" 
                min="0" 
                max="1" 
                step="0.01"
                @input="updateConfidence"
              />
              <span class="value">{{ confidenceThreshold }}</span>
            </div>
          </div>
          <div class="param-item">
            <label>连续推理延时：</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="inferenceDelay" 
                min="1" 
                max="100" 
                step="1"
                @input="updateDelay"
              />
              <span class="value">{{ inferenceDelay }}ms</span>
            </div>
          </div>
        </div>

        <!-- 检测结果区域 -->
        <div class="results-section">
          <h3>检测结果</h3>
          <div class="result-info">
            <div class="info-item">
              <span>目标数目：</span>
              <span class="value">{{ detectionResults.length }}</span>
            </div>
            <div class="info-item">
              <span>目标选择：</span>
              <select v-model="selectedTarget" @change="onTargetChange">
                <option value="all">全部</option>
                <option 
                  v-for="(result, index) in detectionResults" 
                  :key="index" 
                  :value="index"
                >
                  {{ result.className }}_{{ index }}
                </option>
              </select>
            </div>
            <div class="info-item">
              <span>置信度：</span>
              <span class="value">{{ currentConfidence }}%</span>
            </div>
            <div class="info-item">
              <span>用时：</span>
              <span class="value">{{ inferenceTime }}s</span>
            </div>
          </div>
          
          <!-- 坐标信息 -->
          <div class="coordinates">
            <h4>目标位置：</h4>
            <div class="coord-grid">
              <div class="coord-item">
                <span>xmin:</span>
                <span class="coord-value">{{ currentCoords.xmin }}</span>
              </div>
              <div class="coord-item">
                <span>ymin:</span>
                <span class="coord-value">{{ currentCoords.ymin }}</span>
              </div>
              <div class="coord-item">
                <span>xmax:</span>
                <span class="coord-value">{{ currentCoords.xmax }}</span>
              </div>
              <div class="coord-item">
                <span>ymax:</span>
                <span class="coord-value">{{ currentCoords.ymax }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions-section">
          <h3>操作</h3>
          <div class="action-buttons">
            <button @click="saveResults" class="btn btn-save">
              <i class="icon-save"></i>
              保存
            </button>
            <button @click="exitApp" class="btn btn-exit">
              <i class="icon-exit"></i>
              退出
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 检测结果表格 -->
    <div class="results-table">
      <h3>检测结果与位置信息</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>文件路径</th>
            <th>类别</th>
            <th>置信度</th>
            <th>坐标位置</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in detectionResults" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ result.filePath }}</td>
            <td>{{ result.className }}</td>
            <td>{{ result.confidence }}%</td>
            <td>{{ result.coordinates }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="imageInput" 
      type="file" 
      accept="image/*" 
      @change="onImageSelected" 
      style="display: none"
    />
    <input 
      ref="videoInput" 
      type="file" 
      accept="video/*" 
      @change="onVideoSelected" 
      style="display: none"
    />
    <input 
      ref="folderInput" 
      type="file" 
      webkitdirectory 
      @change="onFolderSelected" 
      style="display: none"
    />
  </div>
</template>

<script>
export default {
  name: 'SignLanguageDetector',
  data() {
    return {
      // 显示相关
      isVideoMode: false,
      isCameraActive: false,
      hasContent: false,
      videoSrc: '',
      canvasWidth: 770,
      canvasHeight: 480,
      
      // 参数设置
      confidenceThreshold: 0.5,
      inferenceDelay: 10,
      
      // 检测结果
      detectionResults: [],
      selectedTarget: 'all',
      currentConfidence: 0,
      inferenceTime: 0,
      currentCoords: {
        xmin: 0,
        ymin: 0,
        xmax: 0,
        ymax: 0
      },
      
      // 媒体流
      mediaStream: null,
      detectionInterval: null
    }
  },
  methods: {
    // 文件选择方法
    selectImage() {
      this.$refs.imageInput.click()
    },
    
    selectVideo() {
      this.$refs.videoInput.click()
    },
    
    selectFolder() {
      this.$refs.folderInput.click()
    },
    
    // 摄像头控制
    async toggleCamera() {
      if (this.isCameraActive) {
        this.stopCamera()
      } else {
        await this.startCamera()
      }
    },
    
    async startCamera() {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        })
        this.isCameraActive = true
        this.isVideoMode = true
        this.hasContent = true
        
        // 开始检测
        this.startDetection()
      } catch (error) {
        console.error('无法访问摄像头:', error)
        this.$message.error('无法访问摄像头，请检查权限设置')
      }
    },
    
    stopCamera() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }
      this.isCameraActive = false
      this.stopDetection()
    },
    
    // 文件处理
    onImageSelected(event) {
      const file = event.target.files[0]
      if (file) {
        this.processImage(file)
      }
    },
    
    onVideoSelected(event) {
      const file = event.target.files[0]
      if (file) {
        this.processVideo(file)
      }
    },
    
    onFolderSelected(event) {
      const files = Array.from(event.target.files)
      this.processBatchImages(files)
    },
    
    // 检测相关方法
    async processImage(file) {
      try {
        this.isVideoMode = false
        this.hasContent = true
        
        // 显示图片
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            this.drawImageToCanvas(img)
            // 执行检测
            this.detectImage(file)
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('图片处理失败:', error)
      }
    },
    
    async processVideo(file) {
      try {
        this.isVideoMode = true
        this.hasContent = true
        this.videoSrc = URL.createObjectURL(file)
        
        // 开始视频检测
        this.startVideoDetection()
      } catch (error) {
        console.error('视频处理失败:', error)
      }
    },
    
    async processBatchImages(files) {
      // 批量处理图片
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await this.processImage(file)
          // 添加延迟避免界面卡顿
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    },
    
    // 检测方法
    async detectImage(file) {
      const startTime = Date.now()
      
      try {
        // 调用后端API进行检测
        const formData = new FormData()
        formData.append('image', file)
        formData.append('confidence', this.confidenceThreshold)
        
        const response = await fetch('/api/detect/image', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        this.inferenceTime = ((Date.now() - startTime) / 1000).toFixed(3)
        this.detectionResults = result.detections || []
        
        if (this.detectionResults.length > 0) {
          this.currentConfidence = this.detectionResults[0].confidence
          this.currentCoords = this.detectionResults[0].coordinates
        }
        
        // 绘制检测结果
        this.drawDetectionResults(result.image)
        
      } catch (error) {
        console.error('检测失败:', error)
        this.$message.error('检测失败，请重试')
      }
    },
    
    startDetection() {
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval)
      }
      
      this.detectionInterval = setInterval(async () => {
        if (this.isCameraActive) {
          await this.detectCameraFrame()
        }
      }, this.inferenceDelay)
    },
    
    stopDetection() {
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval)
        this.detectionInterval = null
      }
    },
    
    async detectCameraFrame() {
      // 从摄像头获取帧并检测
      const canvas = this.$refs.canvasElement
      const ctx = canvas.getContext('2d')
      
      // 这里需要实现从摄像头获取帧的逻辑
      // 由于浏览器安全限制，需要特殊处理
    },
    
    startVideoDetection() {
      // 视频检测逻辑
    },
    
    // 绘制相关方法
    drawImageToCanvas(img) {
      const canvas = this.$refs.canvasElement
      const ctx = canvas.getContext('2d')
      
      // 计算缩放比例
      const scale = Math.min(
        this.canvasWidth / img.width,
        this.canvasHeight / img.height
      )
      
      const width = img.width * scale
      const height = img.height * scale
      
      canvas.width = this.canvasWidth
      canvas.height = this.canvasHeight
      
      ctx.drawImage(img, 0, 0, width, height)
    },
    
    drawDetectionResults(imageData) {
      // 绘制检测结果到画布
      const canvas = this.$refs.canvasElement
      const ctx = canvas.getContext('2d')
      
      // 这里需要实现绘制检测框的逻辑
    },
    
    // 参数更新
    updateConfidence() {
      // 更新置信度阈值
    },
    
    updateDelay() {
      // 更新推理延时
      if (this.detectionInterval) {
        this.stopDetection()
        this.startDetection()
      }
    },
    
    // 目标选择
    onTargetChange() {
      if (this.selectedTarget === 'all') {
        // 显示所有检测结果
      } else {
        // 显示选中的目标
        const index = parseInt(this.selectedTarget)
        if (this.detectionResults[index]) {
          this.currentConfidence = this.detectionResults[index].confidence
          this.currentCoords = this.detectionResults[index].coordinates
        }
      }
    },
    
    // 保存结果
    async saveResults() {
      try {
        const response = await fetch('/api/save/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            results: this.detectionResults,
            timestamp: Date.now()
          })
        })
        
        if (response.ok) {
          this.$message.success('保存成功')
        } else {
          this.$message.error('保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败')
      }
    },
    
    // 退出应用
    exitApp() {
      this.stopCamera()
      this.stopDetection()
      // 可以添加路由跳转或其他退出逻辑
      this.$router.push('/')
    }
  },
  
  beforeDestroy() {
    this.stopCamera()
    this.stopDetection()
  }
}
</script>

<style scoped>
.sign-language-detector {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  font-family: 'Microsoft YaHei', sans-serif;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.main-content {
  display: flex;
  height: calc(100vh - 200px);
  gap: 20px;
  padding: 20px;
}

.display-area {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

video, canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder {
  color: #999;
  font-size: 18px;
}

.control-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section, .params-section, .results-section, .actions-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.input-section h3, .params-section h3, .results-section h3, .actions-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.input-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-image { background: #3498db; color: white; }
.btn-video { background: #e74c3c; color: white; }
.btn-camera { background: #f39c12; color: white; }
.btn-folder { background: #9b59b6; color: white; }
.btn-save { background: #27ae60; color: white; }
.btn-exit { background: #e74c3c; color: white; }

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn.active {
  background: #2ecc71;
}

.param-item {
  margin-bottom: 15px;
}

.param-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-container input[type="range"] {
  flex: 1;
}

.value {
  font-weight: bold;
  color: #e74c3c;
  min-width: 50px;
}

.result-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
}

.info-item select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.coordinates {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.coordinates h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.coord-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.coord-value {
  font-weight: bold;
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.results-table {
  margin: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.results-table h3 {
  margin: 0;
  padding: 20px;
  background: #34495e;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

tr:hover {
  background: #f8f9fa;
}
</style>
