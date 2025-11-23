<template>
  <div class="welcome-container" @click="handleCanvasClick" @contextmenu.prevent="handleRightClick">
    <!-- 画布区域 -->
    <canvas 
      ref="canvas" 
      class="welcome-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    
    <!-- 隐藏的video元素用于MediaPipe检测 -->
    <video 
      ref="video" 
      autoplay 
      playsinline
      muted
      class="hidden-video"
    ></video>
    
    <!-- 摄像头预览窗口（右上角） -->
    <div class="camera-preview" v-if="showCameraPreview && videoStream">
      <div class="camera-preview-header">
        <span class="text-xs text-white">摄像头预览</span>
        <button @click.stop="toggleCameraPreview" class="close-btn">×</button>
      </div>
      <div class="preview-video-wrapper">
        <video 
          ref="previewVideo" 
          autoplay 
          playsinline
          muted
          class="camera-preview-video"
        ></video>
        <canvas 
          ref="previewCanvas" 
          class="preview-overlay-canvas"
        ></canvas>
      </div>
      <!-- 调试信息 -->
      <div class="debug-info" v-if="showDebugInfo">
        <div class="text-xs text-white">摄像头状态: {{ cameraStatus }}</div>
        <div class="text-xs text-white">视频流: {{ videoStream ? '✓' : '✗' }}</div>
        <div class="text-xs text-white">隐藏video: {{ getVideoStatus() }}</div>
        <div class="text-xs text-white">预览video: {{ getPreviewVideoStatus() }}</div>
        <div class="text-xs text-white">MediaPipe: {{ getMediaPipeStatus() }}</div>
        <div class="text-xs text-white">手部检测: {{ isHandDetected ? '✓' : '✗' }}</div>
        <div class="text-xs text-white">光标可见: {{ cursor.visible ? '✓' : '✗' }}</div>
        <div class="text-xs text-white">光标位置: ({{ Math.round(cursor.x) }}, {{ Math.round(cursor.y) }})</div>
        <div class="text-xs text-white">手部状态: {{ getHandStateText() }}</div>
        <div class="text-xs text-white">花朵数量: {{ flowers.length }}</div>
      </div>
    </div>
    
    <!-- 显示摄像头预览按钮 -->
    <button 
      v-if="!showCameraPreview && videoStream" 
      @click.stop="toggleCameraPreview"
      class="show-preview-btn"
    >
      📹 显示摄像头
    </button>
    
    <!-- 鼠标模式切换按钮 -->
    <button 
      @click.stop="toggleMouseMode"
      class="mouse-mode-btn"
      :class="{ 'active': useMockMode }"
    >
      {{ useMockMode ? '🖱️ 鼠标模式' : '👋 手部识别' }}
    </button>
    
    <!-- 提示信息 -->
    <div class="welcome-hint" v-if="!isHandDetected && !useMockMode">
      <p class="text-xl text-white mb-2">请将手放在摄像头前</p>
      <p class="text-sm text-white opacity-80">移动您的手，握拳放置花苞，张开手让花苞绽放</p>
      <p class="text-xs text-white opacity-60 mt-2">点击右上角按钮查看摄像头预览</p>
    </div>
    
    <div class="welcome-hint" v-else-if="useMockMode">
      <p class="text-xl text-white mb-2">🎨 欢迎来到掌中语（鼠标模式）</p>
      <p class="text-sm text-white opacity-80">移动鼠标，右键放置花苞，再次右键让花苞绽放</p>
      <p class="text-xs text-white opacity-60 mt-2">左键点击进入平台</p>
    </div>
    
    <div class="welcome-hint" v-else>
      <p class="text-sm text-white opacity-60">点击画布进入平台</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
// MediaPipe Hands 需要通过动态导入或全局对象访问

export default {
  name: 'Welcome',
  setup() {
    const router = useRouter()
    const canvas = ref(null)
    const video = ref(null) // 用于MediaPipe检测的隐藏video
    const previewVideo = ref(null) // 用于预览窗口的video
    const previewCanvas = ref(null) // 用于在预览视频上绘制手部骨架
    const canvasWidth = ref(window.innerWidth)
    const canvasHeight = ref(window.innerHeight)
    
    let hands = null
    let animationFrameId = null
    let isHandDetected = ref(false)
    let useMockMode = ref(false)
    let videoStream = ref(null)
    let showCameraPreview = ref(false)
    let showDebugInfo = ref(true)
    let isActive = ref(true) // 页面是否激活
    let cameraStatus = ref('初始化中...')
    
    // 花朵数据
    const flowers = ref([])
    const cursor = ref({ x: 0, y: 0, visible: false })
    const lastHandState = ref('open') // 'open' or 'closed'
    let handDetectionInterval = null
    
    // 初始化MediaPipe Hands（使用npm安装的依赖）
    const initMediaPipe = () => {
      return new Promise((resolve, reject) => {
        // MediaPipe不是ES模块，需要通过动态导入或script标签加载
        // 检查是否已经加载
        if (window.Hands) {
          createHandsInstance()
          resolve()
          return
        }
        
        // 使用script标签加载MediaPipe（MediaPipe不是ES模块）
        const existingScript = document.querySelector('script[data-mediapipe-hands]')
        if (existingScript) {
          // 如果script已存在，等待加载完成
          const checkHands = setInterval(() => {
            if (window.Hands) {
              clearInterval(checkHands)
              createHandsInstance()
              resolve()
            }
          }, 100)
          setTimeout(() => {
            clearInterval(checkHands)
            if (!window.Hands) {
              reject(new Error('MediaPipe加载超时'))
            }
          }, 5000)
          return
        }
        
        // 直接使用CDN加载MediaPipe（更可靠）
        loadMediaPipeFromCDN(resolve, reject)
      })
    }
    
    // 使用script标签加载MediaPipe（备用方案）
    const loadMediaPipeViaScript = (resolve, reject) => {
      // 检查是否已经加载过script
      if (document.querySelector('script[src*="@mediapipe/hands"]')) {
        if (window.Hands) {
          createHandsInstance()
          resolve()
        } else {
          reject(new Error('MediaPipe已加载但Hands类不存在'))
        }
        return
      }
      
      const script = document.createElement('script')
      script.type = 'module'
      script.src = '/node_modules/@mediapipe/hands/hands.js'
      script.onload = () => {
        console.log('MediaPipe script加载成功')
        setTimeout(() => {
          if (window.Hands) {
            createHandsInstance()
            resolve()
          } else {
            reject(new Error('MediaPipe加载后Hands类不存在'))
          }
        }, 500)
      }
      script.onerror = () => {
        console.error('MediaPipe script加载失败，尝试使用CDN')
        // 如果本地加载失败，使用CDN
        loadMediaPipeFromCDN(resolve, reject)
      }
      document.head.appendChild(script)
    }
    
    // 从CDN加载MediaPipe（最后备用方案）
    const loadMediaPipeFromCDN = (resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js'
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        console.log('MediaPipe从CDN加载成功')
        setTimeout(() => {
          if (window.Hands) {
            createHandsInstance()
            resolve()
          } else {
            reject(new Error('MediaPipe CDN加载后Hands类不存在'))
          }
        }, 500)
      }
      script.onerror = () => {
        reject(new Error('所有MediaPipe加载方式都失败'))
      }
      document.head.appendChild(script)
    }
    
    const createHandsInstance = () => {
      try {
        console.log('创建MediaPipe Hands实例...')
        
        if (!window.Hands) {
          throw new Error('window.Hands未定义')
        }
        
        // 使用全局的Hands类
        hands = new window.Hands({
          locateFile: (file) => {
            // 在开发环境中，使用node_modules路径
            // 在生产环境中，文件会被复制到public目录
            if (import.meta.env.DEV) {
              return `/node_modules/@mediapipe/hands/${file}`
            } else {
              return `/@mediapipe/hands/${file}`
            }
          }
        })
        
        // 检查API兼容性
        if (!hands.setOptions || !hands.onResults || !hands.send) {
          throw new Error('MediaPipe API不完整，可能版本不兼容')
        }
        
        console.log('MediaPipe Hands实例创建成功')
        
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })
        
        console.log('MediaPipe选项已设置')
        
        // 设置结果回调
        hands.onResults(onResults)
        console.log('MediaPipe结果回调已设置')
        
        // 添加错误回调（如果支持）
        if (typeof hands.onError === 'function') {
          hands.onError((error) => {
            console.error('MediaPipe处理错误:', error)
            // 如果MediaPipe持续出错，切换到模拟模式
            console.warn('MediaPipe出错，切换到模拟模式')
            useMockMode.value = true
            initMockMode()
          })
        }
        
        // 等待一小段时间确保MediaPipe完全初始化
        setTimeout(() => {
          // 开始检测
          startHandDetection()
          console.log('MediaPipe Hands 初始化成功，开始检测')
        }, 500)
      } catch (error) {
        console.error('创建Hands实例失败:', error)
        console.error('错误堆栈:', error.stack)
        useMockMode.value = true
        initMockMode()
      }
    }
    
    const startHandDetection = () => {
      if (handDetectionInterval) {
        clearInterval(handDetectionInterval)
      }
      
      console.log('开始手部检测循环...')
      let frameCount = 0
      let lastErrorTime = 0
      
      handDetectionInterval = setInterval(() => {
        if (!isActive.value) {
          return // 如果页面已关闭，停止检测
        }
        
        if (!video.value) {
          if (Date.now() - lastErrorTime > 2000) {
            console.warn('video元素不存在')
            lastErrorTime = Date.now()
          }
          return
        }
        
        if (!hands) {
          if (Date.now() - lastErrorTime > 2000) {
            console.warn('MediaPipe Hands实例不存在')
            lastErrorTime = Date.now()
          }
          return
        }
        
        // 检查视频是否准备好
        const readyState = video.value.readyState
        const hasEnoughData = readyState >= video.value.HAVE_CURRENT_DATA
        
        if (hasEnoughData && video.value.videoWidth > 0 && video.value.videoHeight > 0) {
          try {
            frameCount++
            
            // 每30帧打印一次详细日志
            if (frameCount % 30 === 0) {
              console.log('发送图像到MediaPipe:', {
                帧数: frameCount,
                视频尺寸: `${video.value.videoWidth}x${video.value.videoHeight}`,
                readyState: readyState,
                paused: video.value.paused,
                MediaPipe实例: !!hands,
                MediaPipe方法: typeof hands.send
              })
            }
            
            // 确保使用正确的API
            if (typeof hands.send === 'function') {
              hands.send({ image: video.value })
            } else if (typeof hands.process === 'function') {
              // 某些版本的MediaPipe使用process方法
              hands.process(video.value)
            } else {
              console.error('MediaPipe没有send或process方法:', hands)
            }
          } catch (error) {
            if (Date.now() - lastErrorTime > 2000) {
              console.error('发送图像到MediaPipe失败:', error)
              console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                video状态: {
                  readyState: video.value.readyState,
                  videoWidth: video.value.videoWidth,
                  videoHeight: video.value.videoHeight
                }
              })
              lastErrorTime = Date.now()
            }
          }
        } else {
          if (frameCount === 0 || frameCount % 50 === 0) {
            console.warn('视频未准备好:', {
              readyState: readyState,
              videoWidth: video.value.videoWidth,
              videoHeight: video.value.videoHeight,
              paused: video.value.paused,
              srcObject: !!video.value.srcObject
            })
          }
        }
      }, 100) // 每100ms检测一次
    }
    
    // 鼠标模式事件监听器引用（用于清理）
    let mouseModeHandlers = {
      mousemove: null,
      contextmenu: null
    }
    
    // 模拟模式（鼠标控制）
    const initMockMode = () => {
      console.log('使用鼠标模式')
      useMockMode.value = true
      
      // 清理旧的事件监听器
      cleanupMouseMode()
      
      // 鼠标移动 - 更新光标位置
      const handleMouseMove = (e) => {
        cursor.value = {
          x: e.clientX,
          y: e.clientY,
          visible: true
        }
        isHandDetected.value = true
        drawCanvas()
      }
      
      // 右键点击 - 放置花苞或让花苞绽放
      const handleRightClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const clickX = e.clientX
        const clickY = e.clientY
        
        // 检查是否点击在已存在的花苞上
        const clickedBud = flowers.value.find(flower => {
          const distance = Math.sqrt(
            Math.pow(flower.x - clickX, 2) + Math.pow(flower.y - clickY, 2)
          )
          return flower.state === 'bud' && distance < flower.maxSize
        })
        
        if (clickedBud) {
          // 点击在花苞上，让花苞绽放
          bloomLastBud()
          console.log('花苞绽放')
        } else {
          // 点击在空白处，创建新花苞
          if (lastHandState.value === 'open') {
            lastHandState.value = 'closed'
            createBud(clickX, clickY)
            console.log('创建花苞:', clickX, clickY)
          }
        }
        
        drawCanvas()
      }
      
      // 添加事件监听器
      window.addEventListener('mousemove', handleMouseMove)
      mouseModeHandlers.mousemove = handleMouseMove
      mouseModeHandlers.contextmenu = handleRightClick
      
      // 初始化光标位置
      cursor.value = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        visible: true
      }
      isHandDetected.value = true
      drawCanvas()
    }
    
    // 清理鼠标模式事件监听器
    const cleanupMouseMode = () => {
      if (mouseModeHandlers.mousemove) {
        window.removeEventListener('mousemove', mouseModeHandlers.mousemove)
        mouseModeHandlers.mousemove = null
      }
      if (mouseModeHandlers.contextmenu) {
        window.removeEventListener('contextmenu', mouseModeHandlers.contextmenu)
        mouseModeHandlers.contextmenu = null
      }
    }
    
    // 切换鼠标模式
    const toggleMouseMode = () => {
      if (useMockMode.value) {
        // 关闭鼠标模式，切换到手部识别模式
        useMockMode.value = false
        cleanupMouseMode()
        cursor.value.visible = false
        isHandDetected.value = false
        
        // 如果MediaPipe已初始化，重新开始检测
        if (hands && video.value && video.value.readyState >= video.value.HAVE_CURRENT_DATA) {
          startHandDetection()
          console.log('已切换到手部识别模式')
        } else if (!hands) {
          // 如果MediaPipe未初始化，尝试初始化
          console.log('MediaPipe未初始化，尝试初始化...')
          initMediaPipe().then(() => {
            console.log('MediaPipe初始化成功，开始检测')
          }).catch((error) => {
            console.warn('MediaPipe初始化失败，但保持手部识别模式:', error)
            // 即使初始化失败，也保持手部识别模式，让用户可以等待MediaPipe加载
          })
        } else {
          console.log('已切换到手部识别模式，等待视频准备就绪')
        }
      } else {
        // 开启鼠标模式
        initMockMode()
        console.log('已切换到鼠标模式')
      }
    }
    
    // 存储当前手部关键点（用于绘制骨架）
    const currentLandmarks = ref(null)
    
    // MediaPipe结果处理
    const onResults = (results) => {
      if (!isActive.value) {
        return // 如果页面已关闭，不处理结果
      }
      
      // 添加调试日志（每30次打印一次）
      if (Math.random() < 0.033) {
        console.log('MediaPipe结果回调被调用:', {
          有结果: !!results,
          结果类型: results ? typeof results : 'null',
          多手标记: results?.multiHandLandmarks ? results.multiHandLandmarks.length : 0,
          结果键: results ? Object.keys(results) : []
        })
      }
      
      // 添加调试日志
      if (!results) {
        if (Math.random() < 0.1) {
          console.warn('MediaPipe返回空结果')
        }
        currentLandmarks.value = null
        isHandDetected.value = false
        cursor.value.visible = false
        drawCanvas()
        drawPreviewSkeleton(null) // 清除预览骨架
        return
      }
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        isHandDetected.value = true
        const landmarks = results.multiHandLandmarks[0]
        currentLandmarks.value = landmarks // 保存用于绘制骨架
        
        // 在预览视频上绘制手部骨架
        drawPreviewSkeleton(landmarks)
        
        // 计算手部中心位置（使用手腕和手指的平均值）
        const wrist = landmarks[0]
        const middleFinger = landmarks[12]
        const indexFinger = landmarks[8]
        
        const handCenterX = (wrist.x + middleFinger.x + indexFinger.x) / 3
        const handCenterY = (wrist.y + middleFinger.y + indexFinger.y) / 3
        
        // 转换到画布坐标
        const cursorX = handCenterX * canvasWidth.value
        const cursorY = handCenterY * canvasHeight.value
        
        cursor.value = {
          x: cursorX,
          y: cursorY,
          visible: true
        }
        
        // 每10次检测打印一次日志
        if (Math.random() < 0.1) {
          console.log('检测到手部! 位置:', {
            normalized: { x: handCenterX, y: handCenterY },
            canvas: { x: cursorX, y: cursorY },
            landmarks: landmarks.length
          })
        }
        
        // 检测手是否握拳
        const isFist = checkIfFist(landmarks)
        
        if (isFist && lastHandState.value === 'open') {
          // 从张开变为握拳，创建花苞
          lastHandState.value = 'closed'
          createBud(cursor.value.x, cursor.value.y)
          console.log('创建花苞:', cursor.value.x, cursor.value.y)
        } else if (!isFist && lastHandState.value === 'closed') {
          // 从握拳变为张开，花苞绽放
          lastHandState.value = 'open'
          bloomLastBud()
          console.log('花苞绽放')
        }
      } else {
        // 没有检测到手部
        currentLandmarks.value = null
        isHandDetected.value = false
        cursor.value.visible = false
        drawPreviewSkeleton(null) // 清除预览骨架
      }
      
      drawCanvas()
    }
    
    // 在预览视频上绘制手部骨架
    const drawPreviewSkeleton = (landmarks) => {
      if (!previewCanvas.value || !previewVideo.value) return
      
      const ctx = previewCanvas.value.getContext('2d')
      if (!ctx) return
      
      // 设置canvas尺寸与视频一致
      if (previewCanvas.value.width !== previewVideo.value.videoWidth || 
          previewCanvas.value.height !== previewVideo.value.videoHeight) {
        previewCanvas.value.width = previewVideo.value.videoWidth || 240
        previewCanvas.value.height = previewVideo.value.videoHeight || 180
      }
      
      // 清空画布
      ctx.clearRect(0, 0, previewCanvas.value.width, previewCanvas.value.height)
      
      if (!landmarks || landmarks.length === 0) return
      
      // 手部关键点连接关系
      const connections = [
        // 拇指
        [0, 1], [1, 2], [2, 3], [3, 4],
        // 食指
        [0, 5], [5, 6], [6, 7], [7, 8],
        // 中指
        [0, 9], [9, 10], [10, 11], [11, 12],
        // 无名指
        [0, 13], [13, 14], [14, 15], [15, 16],
        // 小指
        [0, 17], [17, 18], [18, 19], [19, 20],
        // 手指之间的连接
        [5, 9], [9, 13], [13, 17]
      ]
      
      // 绘制连接线
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
      ctx.lineWidth = 2
      connections.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
          const startX = landmarks[start].x * previewCanvas.value.width
          const startY = landmarks[start].y * previewCanvas.value.height
          const endX = landmarks[end].x * previewCanvas.value.width
          const endY = landmarks[end].y * previewCanvas.value.height
          
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      })
      
      // 绘制关键点
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * previewCanvas.value.width
        const y = landmark.y * previewCanvas.value.height
        
        // 手腕用更大的点
        const radius = index === 0 ? 5 : 3
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        
        // 指尖用不同颜色
        if ([4, 8, 12, 16, 20].includes(index)) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.9)'
          ctx.beginPath()
          ctx.arc(x, y, radius + 1, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
        }
      })
    }
    
    // 检测是否握拳
    const checkIfFist = (landmarks) => {
      const wrist = landmarks[0]
      const thumbTip = landmarks[4]
      const indexTip = landmarks[8]
      const middleTip = landmarks[12]
      const ringTip = landmarks[16]
      const pinkyTip = landmarks[20]
      
      // 计算手腕到各指尖的距离
      const distances = [
        Math.sqrt(Math.pow(thumbTip.x - wrist.x, 2) + Math.pow(thumbTip.y - wrist.y, 2)),
        Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)),
        Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2)),
        Math.sqrt(Math.pow(ringTip.x - wrist.x, 2) + Math.pow(ringTip.y - wrist.y, 2)),
        Math.sqrt(Math.pow(pinkyTip.x - wrist.x, 2) + Math.pow(pinkyTip.y - wrist.y, 2))
      ]
      
      // 计算平均距离
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
      
      // 如果平均距离较小，认为是握拳
      return avgDistance < 0.15
    }
    
    // 创建花苞
    const createBud = (x, y) => {
      flowers.value.push({
        x,
        y,
        state: 'bud', // 'bud', 'blooming', or 'bloomed'
        size: 0,
        maxSize: 30 + Math.random() * 20,
        petals: 5 + Math.floor(Math.random() * 4), // 5-8片花瓣
        color: `hsl(${Math.random() * 60 + 300}, 70%, 60%)`, // 粉色到紫色
        bloomProgress: 0,
        rotation: Math.random() * Math.PI * 2,
        createdAt: Date.now()
      })
    }
    
    // 花苞绽放（找到最后一个花苞）
    const bloomLastBud = () => {
      // 找到最后一个花苞（最近创建的）
      const buds = flowers.value.filter(f => f.state === 'bud')
      if (buds.length > 0) {
        // 按创建时间排序，找到最后一个
        buds.sort((a, b) => b.createdAt - a.createdAt)
        const lastBud = buds[0]
        lastBud.state = 'blooming'
        lastBud.bloomStartTime = Date.now()
        console.log('花苞绽放:', lastBud.x, lastBud.y)
      }
    }
    
    // 绘制画布
    const drawCanvas = () => {
      const ctx = canvas.value.getContext('2d')
      if (!ctx) return
      
      // 清空画布
      ctx.fillStyle = '#B0E0E6' // 浅蓝色
      ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
      
      // 绘制花朵
      flowers.value.forEach(flower => {
        if (flower.state === 'bud') {
          drawBud(ctx, flower)
        } else if (flower.state === 'blooming' || flower.state === 'bloomed') {
          drawFlower(ctx, flower)
          
          // 更新绽放进度
          if (flower.state === 'blooming') {
            const elapsed = Date.now() - flower.bloomStartTime
            flower.bloomProgress = Math.min(elapsed / 1000, 1) // 1秒完成绽放
            
            if (flower.bloomProgress >= 1) {
              flower.state = 'bloomed'
            }
          }
        }
      })
      
      // 绘制手部骨架（如果检测到手部）
      if (currentLandmarks.value && currentLandmarks.value.length > 0) {
        drawHandSkeleton(ctx, currentLandmarks.value)
      }
      
      // 绘制光标
      if (cursor.value.visible) {
        drawCursor(ctx, cursor.value.x, cursor.value.y)
      }
    }
    
    // 绘制手部骨架
    const drawHandSkeleton = (ctx, landmarks) => {
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.fillStyle = 'rgba(100, 150, 255, 0.6)'
      
      // 手部关键点连接关系
      const connections = [
        // 手腕到手指
        [0, 1], [1, 2], [2, 3], [3, 4], // 拇指
        [0, 5], [5, 6], [6, 7], [7, 8], // 食指
        [0, 9], [9, 10], [10, 11], [11, 12], // 中指
        [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
        [0, 17], [17, 18], [18, 19], [19, 20], // 小指
        // 手指之间的连接
        [5, 9], [9, 13], [13, 17]
      ]
      
      // 绘制连接线
      connections.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
          const startX = landmarks[start].x * canvasWidth.value
          const startY = landmarks[start].y * canvasHeight.value
          const endX = landmarks[end].x * canvasWidth.value
          const endY = landmarks[end].y * canvasHeight.value
          
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      })
      
      // 绘制关键点
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvasWidth.value
        const y = landmark.y * canvasHeight.value
        
        // 手腕用更大的点
        const radius = index === 0 ? 6 : 4
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        
        // 指尖用不同颜色
        if ([4, 8, 12, 16, 20].includes(index)) {
          ctx.fillStyle = 'rgba(255, 200, 100, 0.8)'
          ctx.beginPath()
          ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(100, 150, 255, 0.6)'
        }
      })
      
      ctx.restore()
    }
    
    // 绘制花苞
    const drawBud = (ctx, bud) => {
      ctx.save()
      ctx.translate(bud.x, bud.y)
      
      // 花苞主体（椭圆形）
      const gradient = ctx.createLinearGradient(0, -bud.maxSize, 0, bud.maxSize)
      gradient.addColorStop(0, bud.color)
      gradient.addColorStop(1, `hsl(${parseInt(bud.color.match(/\d+/)?.[0] || '300') + 20}, 70%, 50%)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(0, 0, bud.maxSize * 0.4, bud.maxSize * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // 花苞顶部（更小的椭圆）
      ctx.fillStyle = `hsl(${parseInt(bud.color.match(/\d+/)?.[0] || '300') + 30}, 80%, 70%)`
      ctx.beginPath()
      ctx.ellipse(0, -bud.maxSize * 0.3, bud.maxSize * 0.3, bud.maxSize * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // 花苞轮廓
      ctx.strokeStyle = `hsl(${parseInt(bud.color.match(/\d+/)?.[0] || '300')}, 60%, 40%)`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, 0, bud.maxSize * 0.4, bud.maxSize * 0.6, 0, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.restore()
    }
    
    // 绘制花朵
    const drawFlower = (ctx, flower) => {
      ctx.save()
      ctx.translate(flower.x, flower.y)
      ctx.rotate(flower.rotation)
      
      const size = flower.maxSize * (0.3 + flower.bloomProgress * 0.7)
      
      // 绘制花瓣
      for (let i = 0; i < flower.petals; i++) {
        const angle = (Math.PI * 2 / flower.petals) * i
        const petalSize = size * (0.8 + Math.random() * 0.4)
        
        ctx.save()
        ctx.rotate(angle)
        ctx.translate(0, -size * 0.3)
        
        // 花瓣（圆形）
        const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize * 0.5)
        petalGradient.addColorStop(0, flower.color)
        petalGradient.addColorStop(1, `hsl(${parseInt(flower.color.match(/\d+/)?.[0] || '300') - 20}, 70%, 50%)`)
        
        ctx.fillStyle = petalGradient
        ctx.beginPath()
        ctx.arc(0, 0, petalSize * 0.5, 0, Math.PI * 2)
        ctx.fill()
        
        // 花瓣高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(-petalSize * 0.2, -petalSize * 0.2, petalSize * 0.2, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }
      
      // 花心
      const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.2)
      centerGradient.addColorStop(0, '#FFD700') // 金色
      centerGradient.addColorStop(1, '#FFA500') // 橙色
      
      ctx.fillStyle = centerGradient
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
      ctx.fill()
      
      // 花心细节
      ctx.fillStyle = '#FF8C00'
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    }
    
    // 绘制光标
    const drawCursor = (ctx, x, y) => {
      ctx.save()
      ctx.translate(x, y)
      
      // 外圈（脉冲效果）
      const time = Date.now() * 0.005
      const pulseSize = 15 + Math.sin(time) * 3
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time) * 0.2})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2)
      ctx.stroke()
      
      // 内圈
      ctx.fillStyle = 'rgba(100, 150, 255, 0.6)'
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.fill()
      
      // 中心点
      ctx.fillStyle = '#4A90E2'
      ctx.beginPath()
      ctx.arc(0, 0, 3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    }
    
    // 处理画布点击（左键）
    const handleCanvasClick = (e) => {
      // 在鼠标模式下，左键点击进入主页
      if (useMockMode.value) {
        // 标记页面为非激活状态
        isActive.value = false
        
        // 清理所有资源
        cleanup()
        
        // 跳转到主页
        router.push('/home')
      } else {
        // 在手部识别模式下，点击画布也进入主页
        isActive.value = false
        cleanup()
        router.push('/home')
      }
    }
    
    // 处理右键点击
    const handleRightClick = (e) => {
      // 只在鼠标模式下处理右键
      if (useMockMode.value) {
        e.preventDefault()
        e.stopPropagation()
        
        const clickX = e.clientX
        const clickY = e.clientY
        
        // 检查是否点击在已存在的花苞上
        const clickedBud = flowers.value.find(flower => {
          const distance = Math.sqrt(
            Math.pow(flower.x - clickX, 2) + Math.pow(flower.y - clickY, 2)
          )
          return flower.state === 'bud' && distance < flower.maxSize
        })
        
        if (clickedBud) {
          // 点击在花苞上，让花苞绽放
          bloomLastBud()
          console.log('花苞绽放')
        } else {
          // 点击在空白处，创建新花苞
          if (lastHandState.value === 'open') {
            lastHandState.value = 'closed'
            createBud(clickX, clickY)
            console.log('创建花苞:', clickX, clickY)
          }
        }
        
        drawCanvas()
      }
    }
    
    // 绑定视频流到预览窗口
    const bindPreviewVideo = async () => {
      await nextTick() // 等待DOM更新
      
      if (previewVideo.value && videoStream.value) {
        console.log('绑定视频流到预览窗口...')
        console.log('预览video元素:', previewVideo.value)
        console.log('视频流:', videoStream.value)
        
        previewVideo.value.srcObject = videoStream.value
        
        // 添加事件监听
        previewVideo.value.addEventListener('loadedmetadata', () => {
          console.log('预览视频元数据加载完成')
          console.log('预览视频尺寸:', previewVideo.value.videoWidth, 'x', previewVideo.value.videoHeight)
        })
        
        previewVideo.value.addEventListener('loadeddata', () => {
          console.log('预览视频数据加载完成')
        })
        
        previewVideo.value.addEventListener('play', () => {
          console.log('预览视频开始播放')
        })
        
        previewVideo.value.addEventListener('error', (e) => {
          console.error('预览视频错误:', e)
        })
        
        // 确保视频播放
        try {
          await previewVideo.value.play()
          console.log('预览视频播放成功')
        } catch (err) {
          console.error('预览视频播放失败:', err)
        }
      } else {
        console.warn('预览video元素或视频流不存在:', {
          previewVideo: !!previewVideo.value,
          videoStream: !!videoStream.value
        })
      }
    }
    
    // 切换摄像头预览
    const toggleCameraPreview = async () => {
      showCameraPreview.value = !showCameraPreview.value
      
      // 当显示预览时，绑定视频流
      if (showCameraPreview.value) {
        await bindPreviewVideo()
      }
    }
    
    // 监听预览窗口显示状态
    watch(showCameraPreview, async (newVal) => {
      if (newVal && videoStream.value) {
        await bindPreviewVideo()
      }
    })
    
    // 获取手部状态文本
    const getHandStateText = () => {
      return lastHandState.value === 'closed' ? '握拳' : '张开'
    }
    
    // 获取隐藏video状态
    const getVideoStatus = () => {
      if (!video.value) return '✗ 不存在'
      if (!video.value.srcObject) return '✗ 无视频流'
      if (video.value.readyState === 0) return '✗ 无数据'
      if (video.value.readyState === 1) return '✓ 有元数据'
      if (video.value.readyState === 2) return '✓ 有当前数据'
      if (video.value.readyState === 3) return '✓ 有未来数据'
      if (video.value.readyState === 4) return '✓ 有足够数据'
      return `? ${video.value.readyState}`
    }
    
    // 获取预览video状态
    const getPreviewVideoStatus = () => {
      if (!previewVideo.value) return '✗ 不存在'
      if (!previewVideo.value.srcObject) return '✗ 无视频流'
      if (previewVideo.value.readyState === 0) return '✗ 无数据'
      if (previewVideo.value.readyState === 1) return '✓ 有元数据'
      if (previewVideo.value.readyState === 2) return '✓ 有当前数据'
      if (previewVideo.value.readyState === 3) return '✓ 有未来数据'
      if (previewVideo.value.readyState === 4) return '✓ 有足够数据'
      return `? ${previewVideo.value.readyState}`
    }
    
    // 获取MediaPipe状态
    const getMediaPipeStatus = () => {
      if (!window.Hands) return '✗ 库未加载'
      if (!hands) return '✗ 实例未创建'
      return '✓ 已初始化'
    }
    
    // 清理资源
    const cleanup = () => {
      console.log('清理欢迎页面资源...')
      
      // 停止动画
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      
      // 停止手部检测
      if (handDetectionInterval) {
        clearInterval(handDetectionInterval)
        handDetectionInterval = null
      }
      
      // 清理鼠标模式事件监听器
      cleanupMouseMode()
      
      // 停止摄像头
      if (videoStream.value) {
        videoStream.value.getTracks().forEach(track => {
          track.stop()
          console.log('停止摄像头轨道:', track.kind)
        })
        videoStream.value = null
      }
      
      // 清理MediaPipe
      if (hands) {
        try {
          if (typeof hands.close === 'function') {
            hands.close()
          }
        } catch (error) {
          console.error('关闭MediaPipe失败:', error)
        }
        hands = null
      }
      
      // 清空视频元素
      if (video.value) {
        video.value.srcObject = null
      }
      
      console.log('资源清理完成')
    }
    
    // 动画循环
    const animate = () => {
      drawCanvas()
      animationFrameId = requestAnimationFrame(animate)
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      canvasWidth.value = window.innerWidth
      canvasHeight.value = window.innerHeight
    }
    
    onMounted(async () => {
      // 添加全局错误处理，捕获MediaPipe WASM加载错误
      const originalErrorHandler = window.onerror
      window.onerror = (message, source, lineno, colno, error) => {
        if (message && typeof message === 'string' && (
          message.includes('mediapipe') || 
          message.includes('wasm') || 
          message.includes('hands_solution') ||
          message.includes('Aborted') ||
          message.includes('Assertion failed')
        )) {
          console.error('检测到MediaPipe WASM加载错误:', message)
          // 如果MediaPipe持续出错，切换到模拟模式
          if (!useMockMode.value) {
            console.warn('MediaPipe WASM加载失败，自动切换到模拟模式')
            useMockMode.value = true
            initMockMode()
            cameraStatus.value = 'MediaPipe加载失败，已切换到鼠标模式'
          }
          return true // 阻止默认错误处理
        }
        // 其他错误使用原来的处理
        if (originalErrorHandler) {
          return originalErrorHandler(message, source, lineno, colno, error)
        }
        return false
      }
      
      // 请求摄像头权限
      cameraStatus.value = '请求摄像头权限...'
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          } 
        })
        
        console.log('摄像头权限获取成功，视频流:', stream)
        console.log('视频轨道数量:', stream.getVideoTracks().length)
        console.log('视频轨道状态:', stream.getVideoTracks().map(t => ({
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        })))
        
        videoStream.value = stream
        cameraStatus.value = '摄像头已连接'
        
        // 绑定到用于MediaPipe检测的隐藏video
        await nextTick() // 确保video元素已渲染
        if (video.value) {
          video.value.srcObject = stream
          console.log('隐藏video元素已绑定视频流')
          
          // 等待视频加载后初始化MediaPipe
          video.value.addEventListener('loadeddata', async () => {
            console.log('视频加载完成，开始初始化MediaPipe')
            cameraStatus.value = '视频已加载，初始化MediaPipe...'
            try {
              await initMediaPipe()
              cameraStatus.value = 'MediaPipe已初始化'
            } catch (error) {
              console.warn('MediaPipe初始化失败，使用模拟模式:', error)
              cameraStatus.value = 'MediaPipe初始化失败'
              useMockMode.value = true
              initMockMode()
            }
          })
          
          video.value.addEventListener('loadedmetadata', () => {
            console.log('视频元数据加载完成')
            console.log('视频尺寸:', video.value.videoWidth, 'x', video.value.videoHeight)
            if (video.value.videoWidth > 0 && video.value.videoHeight > 0) {
              cameraStatus.value = `视频已就绪 (${video.value.videoWidth}x${video.value.videoHeight})`
            }
          })
          
          video.value.addEventListener('play', () => {
            console.log('视频开始播放')
            cameraStatus.value = '视频正在播放'
          })
          
          video.value.addEventListener('playing', () => {
            console.log('视频正在播放中')
            cameraStatus.value = '视频正在播放中'
          })
          
          video.value.addEventListener('error', (e) => {
            console.error('视频加载错误:', e)
            cameraStatus.value = '视频加载错误'
            useMockMode.value = true
            initMockMode()
          })
          
          // 尝试播放视频
          try {
            await video.value.play()
            console.log('隐藏video播放成功')
            
            // 等待视频真正开始播放并获取尺寸
            let checkCount = 0
            const maxChecks = 50 // 最多等待5秒
            const checkPlaying = setInterval(() => {
              checkCount++
              if (!video.value.paused && video.value.readyState >= video.value.HAVE_CURRENT_DATA && video.value.videoWidth > 0) {
                console.log('视频正在播放，尺寸:', video.value.videoWidth, 'x', video.value.videoHeight)
                clearInterval(checkPlaying)
              } else if (checkCount >= maxChecks) {
                console.warn('视频播放检查超时')
                clearInterval(checkPlaying)
              }
            }, 100)
          } catch (err) {
            console.error('视频播放失败:', err)
            cameraStatus.value = '视频播放失败: ' + err.message
          }
        } else {
          console.error('隐藏video元素不存在！')
        }
        
      } catch (error) {
        console.error('无法访问摄像头:', error)
        cameraStatus.value = '摄像头访问失败: ' + error.message
        // 如果无法访问摄像头，使用模拟模式
        useMockMode.value = true
        initMockMode()
      }
      
      // 启动动画循环
      animate()
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      console.log('Welcome组件卸载，清理资源')
      cleanup()
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      canvas,
      video,
      previewVideo,
      canvasWidth,
      canvasHeight,
      isHandDetected,
      useMockMode,
      videoStream,
      showCameraPreview,
      showDebugInfo,
      cameraStatus,
      cursor,
      flowers,
      currentLandmarks,
      previewCanvas,
      handleCanvasClick,
      handleRightClick,
      toggleCameraPreview,
      toggleMouseMode,
      getHandStateText,
      getVideoStatus,
      getPreviewVideoStatus,
      getMediaPipeStatus
    }
  }
}
</script>

<style scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #B0E0E6; /* 浅蓝色背景 */
  cursor: pointer;
}

.welcome-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

/* 隐藏的video元素用于MediaPipe检测 */
.hidden-video {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 640px;
  height: 480px;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}

/* 摄像头预览窗口 */
.camera-preview {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 240px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 8px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.camera-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 8px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-video-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.camera-preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.debug-info {
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  font-family: monospace;
}

.debug-info div {
  margin: 2px 0;
}

/* 显示摄像头预览按钮 */
.show-preview-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  z-index: 100;
  font-size: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.show-preview-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* 鼠标模式切换按钮 */
.mouse-mode-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  z-index: 100;
  font-size: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mouse-mode-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.mouse-mode-btn.active {
  background: rgba(66, 153, 225, 0.8);
  border-color: rgba(66, 153, 225, 1);
}

.mouse-mode-btn.active:hover {
  background: rgba(66, 153, 225, 0.9);
}

@media (max-width: 768px) {
  .camera-preview {
    width: 180px;
    top: 10px;
    right: 10px;
  }
  
  .camera-preview-video {
    height: 135px;
  }
  
  .show-preview-btn {
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .mouse-mode-btn {
    top: 10px;
    left: 10px;
    padding: 8px 12px;
    font-size: 12px;
  }
}

.welcome-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
  padding: 20px 30px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .welcome-hint {
    bottom: 20px;
    padding: 16px 24px;
    font-size: 14px;
  }
}
</style>
