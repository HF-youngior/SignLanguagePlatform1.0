<template>
  <div>
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">手语教学平台</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="text-gray-600 hover:text-blue-600 flex items-center">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              返回学习中心
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="bg-gray-50 p-6 rounded-lg shadow-md">
    <!-- 标题 -->
    <h2 class="text-2xl font-bold text-center mb-6">下面的手语是_____？</h2>
    
    <!-- 图片区域 -->
    <transition name="fade" mode="out-in">
      <div class="mb-8 text-center" :key="currentQuestion ? currentQuestion.id : 'loading'">
        <div class="inline-block p-4 md:p-6 bg-gray-100 rounded-lg shadow-inner w-full max-w-md">
          <transition name="fade" mode="out-in">
            <img 
              v-if="currentQuestion && currentQuestion.image_path && !showExplanationImage" 
              :src="currentQuestion.image_path"
              class="w-full max-h-64 md:max-h-80 object-contain mx-auto"
              alt="手语图片"
              @error="handleImageError"
              :key="'question-' + (currentQuestion ? currentQuestion.id : 'none')"
            />
            <img 
              v-else-if="currentQuestion && currentQuestion.explanation_path && showExplanationImage" 
              :src="currentQuestion.explanation_path"
              class="w-full max-h-64 md:max-h-80 object-contain mx-auto"
              alt="手语教程图片"
              @error="handleImageError"
              :key="'explanation-' + (currentQuestion ? currentQuestion.id : 'none')"
            />
            <div v-else class="w-full h-64 flex items-center justify-center" :key="'loading'">
              <el-icon class="is-loading text-3xl text-blue-600"><Loading /></el-icon>
            </div>
          </transition>
        </div>
      </div>
    </transition>
    
    <!-- 选项按钮 -->
    <transition name="fade" mode="out-in">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8" :key="currentQuestion ? currentQuestion.id : 'loading-options'">
        <button 
          v-for="option in currentQuestion?.options || []" 
          :key="option"
          :class="[
            'py-3 px-4 rounded-lg text-lg md:text-xl font-bold transition-all duration-300 h-14 shadow-sm',
            'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
            getOptionClass(option)
          ]"
          :disabled="showAnswerResult"
          @click="selectAnswer(option)"
        >
          {{ option }}
        </button>
      </div>
    </transition>
    
    <!-- 底部区域 -->
    <div v-if="showAnswerResult" class="mt-6">
      <!-- 结果提示 -->
      <div 
        class="p-4 mb-6 rounded-lg flex items-center" 
        :class="selectedAnswer === currentQuestion.correct_answer ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'"
      >
        <div class="mr-3">
          <div v-if="selectedAnswer === currentQuestion.correct_answer" 
               class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div v-else class="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
        <div>
          <div class="font-bold text-lg" :class="selectedAnswer === currentQuestion.correct_answer ? 'text-green-700' : 'text-red-700'">
            {{ selectedAnswer === currentQuestion.correct_answer ? '正确！' : '答错了' }}
          </div>
          <div :class="selectedAnswer === currentQuestion.correct_answer ? 'text-green-600' : 'text-red-600'">
            正确答案是: <span class="font-bold">{{ currentQuestion.correct_answer }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4">
        <button 
          v-if="showTutorial && !showExplanationImage"
          class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          @click="viewTutorial"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
          </svg>
          查看教程
        </button>
        
        <button 
          class="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          @click="nextQuestion"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          下一题
        </button>
        
        <button 
          v-if="showExplanationImage"
          class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          @click="exitLearning"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          退出学习
        </button>
      </div>
    </div>
    
    <!-- 加载状态：骨架屏 -->
    <div v-if="loading && !currentQuestion" class="text-center py-8">
      <!-- 骨架屏 - 图片占位 -->
      <div class="mb-8 mx-auto w-full max-w-md">
        <div class="bg-gray-200 animate-pulse rounded-lg h-64 w-full"></div>
      </div>
      
      <!-- 骨架屏 - 选项按钮占位 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="h-14 bg-gray-200 animate-pulse rounded-lg"></div>
        <div class="h-14 bg-gray-200 animate-pulse rounded-lg"></div>
        <div class="h-14 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
      
      <p class="text-gray-500 mt-4 flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        加载中...
      </p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="text-center py-8 px-4">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-red-700 font-medium">加载失败</p>
            <p class="text-red-600 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center mx-auto"
        @click="retryLoading"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        重新加载
      </button>
    </div>
  </div>
  </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'
import axios from 'axios'
import apiConfig from '@/config/api.js'

export default {
  name: 'SignLetterQuiz',
  components: {
    Loading
  },
  props: {
    // 自定义API端点，使组件更通用
    apiEndpoint: {
      type: String,
      default: '/quiz/sign-letters/quiz'
    },
    // 组件对象ID，用于标识不同实例
    quizId: {
      type: String,
      default: 'default'
    },
    // 每次测验的题目数量
    questionLimit: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      // 当前问题数据
      currentQuestion: null,
      // 用户选择的答案
      selectedAnswer: null,
      // 是否显示答案结果
      showAnswerResult: false,
      // 是否显示教程按钮
      showTutorial: false,
      // 是否显示教程图片
      showExplanationImage: false,
      // 加载状态
      loading: false,
      // 错误信息
      error: null,
      // API配置
      apiConfig: { ...apiConfig },
      // 测验统计
      questionCount: 0,
      correctCount: 0
    }
  },
  mounted() {
    this.loadQuestion()
  },
  methods: {
    // 加载题目
    async loadQuestion() {
      // 先重置所有状态
      this.resetQuizState()
      
      // 设置加载状态
      this.loading = true
      this.error = null
      this.currentQuestion = null
      
      try {
        // 构建完整的API路径
        const endpoint = this.apiEndpoint.startsWith('/') ? this.apiEndpoint : `/${this.apiEndpoint}`
        const url = `${this.apiConfig.baseURL}${endpoint}`
        console.log(`请求API: ${url}`)
        
        // 创建Axios请求配置
        const axiosConfig = {
          timeout: this.apiConfig.timeout || 10000,
          headers: this.apiConfig.headers || {}
        }
        
        // 发送请求
        const response = await axios.get(url, {
          // 设置超时时间
          timeout: 10000
        })
        
        if (response.data.success) {
          if (!response.data.data) {
            throw new Error('没有找到题目数据')
          }
          
          // 短暂延迟显示新题目，使过渡效果更明显
          setTimeout(() => {
            this.currentQuestion = response.data.data
            this.loading = false
          }, 300)
        } else {
          throw new Error(response.data.message || '加载题目失败')
        }
      } catch (error) {
        console.error('加载题目错误:', error)
        this.loading = false
        
        // 处理不同类型的错误
        if (error.response) {
          // 服务器返回错误状态码
          if (error.response.status === 404) {
            this.error = '没有找到题目数据'
          } else if (error.response.status === 429) {
            this.error = '请求过于频繁，请稍后再试'
          } else {
            this.error = `服务器错误 (${error.response.status})`
          }
        } else if (error.request) {
          // 请求已发出，但没有收到响应
          this.error = '服务器无响应，请检查网络连接'
        } else {
          // 请求设置时出错
          this.error = error.message || '加载题目失败'
        }
        
        this.$message.error(this.error)
      }
    },
    
    // 选择答案
    selectAnswer(answer) {
      // 如果已经选择过答案，不允许再次选择
      if (this.showAnswerResult) {
        return
      }
      
      this.selectedAnswer = answer
      this.showAnswerResult = true
      
      // 判断答案是否正确
      const isCorrect = answer === this.currentQuestion.correct_answer
      if (!isCorrect) {
        this.showTutorial = true
      } else {
        this.correctCount++
      }
      
      // 选择答案后可以播放音效提示（可选功能）
      this.playAnswerSound(isCorrect)
      
      // 增加答题计数
      this.questionCount++
      
      // 触发答题提交事件
      this.$emit('answer-submitted', { 
        questionId: this.currentQuestion.id,
        isCorrect,
        selectedAnswer: answer, 
        correctAnswer: this.currentQuestion.correct_answer,
        questionCount: this.questionCount,
        correctCount: this.correctCount
      })
      
      // 检查是否完成测验
      if (this.questionCount >= this.questionLimit) {
        // 延迟触发事件，等用户看到结果
        setTimeout(() => {
          this.$emit('quiz-completed', {
            questionCount: this.questionCount,
            correctCount: this.correctCount,
            score: this.correctCount
          })
        }, 1500)
      }
    },
    
    // 播放答案音效
    playAnswerSound(isCorrect) {
      // 使用Web Audio API播放简单音效
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        // 设置音效参数
        oscillator.type = isCorrect ? 'sine' : 'sawtooth'
        oscillator.frequency.value = isCorrect ? 800 : 300
        gainNode.gain.value = 0.1
        
        // 连接节点
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // 播放音效
        oscillator.start()
        
        // 音效持续时间
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
        setTimeout(() => {
          oscillator.stop()
        }, 500)
      } catch (e) {
        console.error('播放音效失败:', e)
      }
    },
    
    // 查看教程
    viewTutorial() {
      this.showExplanationImage = true
      // 触发查看教程事件
      this.$emit('view-tutorial', this.currentQuestion.id)
    },
    
    // 退出学习
    exitLearning() {
      // 使用路由导航返回学习中心
      this.$router.push('/learn')
    },
    
    // 获取选项类名
    getOptionClass(option) {
      // 基础样式
      let baseClass = 'border border-gray-300 hover:border-blue-500 bg-white text-gray-800 hover:bg-blue-50 active:bg-blue-100'
      
      // 如果没有显示答案结果，返回基础样式
      if (!this.showAnswerResult) {
        return baseClass
      }
      
      // 正确选项样式
      if (option === this.currentQuestion.correct_answer) {
        return 'bg-green-500 text-white border-green-600 hover:bg-green-600 flex items-center justify-center'
      } 
      // 错误选项样式（只对用户选择的错误答案应用）
      else if (option === this.selectedAnswer) {
        return 'bg-red-500 text-white border-red-600 hover:bg-red-600'
      }
      
      // 其他选项保持原样式
      return 'border border-gray-300 bg-white text-gray-400'
    },
    
    // 下一题
    nextQuestion() {
      this.loadQuestion()
    },
    
    // 重置测验状态
    resetQuizState() {
      this.selectedAnswer = null
      this.showAnswerResult = false
      this.showTutorial = false
      this.showExplanationImage = false
      this.error = null
    },
    
    // 重置整个测验
    resetEntireQuiz() {
      this.resetQuizState()
      this.questionCount = 0
      this.correctCount = 0
      this.loadQuestion()
    },
    
    // 重试加载
    retryLoading() {
      this.loadQuestion()
    },
    
    // 获取选项按钮类型
    getOptionButtonType(option) {
      if (!this.showAnswerResult) return ''
      
      if (option === this.currentQuestion.correct_answer) {
        return 'success'
      } else if (option === this.selectedAnswer) {
        return 'danger'
      }
      return ''
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      console.error('图片加载失败:', event.target.src)
      event.target.src = '/placeholder-image.png' // 可以设置一个占位图片
    }
  }
}
</script>

<style scoped>
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: scale(1.02);
}

button {
  transition: all 0.3s ease;
}

button:hover:not([disabled]) {
  transform: scale(1.02);
}

img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
