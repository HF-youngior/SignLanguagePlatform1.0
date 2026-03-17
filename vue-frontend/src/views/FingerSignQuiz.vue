<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn/basic-sign" class="text-gray-700 hover:text-blue-600 flex items-center">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              返回基础学习
            </router-link>
            <router-link to="/translate" class="text-gray-700 hover:text-blue-600">翻译</router-link>
            <router-link to="/community" class="text-gray-700 hover:text-blue-600">社区</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8 fade-in">
          <h1 class="text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down">👆 手指语测验</h1>
          <p class="text-xl text-gray-700 font-medium animate-fade-in-up">测试您对手指语的掌握程度</p>
        </div>

        <!-- 进度指示 -->
        <div class="mb-8">
          <el-progress 
            :percentage="quizProgress" 
            :color="getProgressColor(quizProgress)"
            :stroke-width="20"
            :show-text="false"
          />
          <div class="flex justify-between mt-2">
            <span class="text-gray-600">已完成: {{ completedQuestions }} 题</span>
            <span class="text-gray-600">正确率: {{ correctRate }}%</span>
          </div>
        </div>

        <!-- 测验组件 -->
        <SignLetterQuiz 
          ref="quizComponent"
          :apiEndpoint="apiEndpoint"
          :questionLimit="totalQuestions"
          @answer-submitted="handleAnswerSubmit"
          @quiz-completed="handleQuizComplete"
          @view-tutorial="handleViewTutorial"
        />

        <!-- 测验结果 -->
        <el-dialog
          v-model="showResults"
          title="测验完成"
          width="400px"
          :show-close="false"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold mb-2">恭喜完成测验!</h3>
            <p class="text-gray-600 mb-4">您的得分是: {{ score }} / {{ totalQuestions }}</p>
            
            <div class="mb-4">
              <el-progress 
                :percentage="Math.round((score / totalQuestions) * 100)" 
                :color="getProgressColor(Math.round((score / totalQuestions) * 100))"
                :stroke-width="20"
              />
            </div>
            
            <div class="flex justify-between">
              <el-button @click="retakeQuiz" type="primary">重新测验</el-button>
              <el-button @click="goToLearningCenter" type="info">返回学习中心</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </main>
  </div>
</template>

<script>
import SignLetterQuiz from '@/components/SignLetterQuiz.vue'
import apiConfig from '@/config/api.js'

export default {
  name: 'FingerSignQuiz',
  components: {
    SignLetterQuiz
  },
  data() {
    return {
      // API端点 - 注意路径不要在开头加斜杠
      apiEndpoint: 'quiz/finger-signs/quiz',
      // 测验统计
      completedQuestions: 0,
      correctAnswers: 0,
      totalQuestions: 10, // 假设总共10题
      quizProgress: 0,
      score: 0,
      // 结果对话框
      showResults: false
    }
  },
  computed: {
    correctRate() {
      return this.completedQuestions > 0 
        ? Math.round((this.correctAnswers / this.completedQuestions) * 100) 
        : 0
    }
  },
  mounted() {
    document.title = '手指语测验 - 手语教学平台'
  },
  methods: {
    // 处理答题提交
    handleAnswerSubmit(result) {
      this.completedQuestions++
      if (result.isCorrect) {
        this.correctAnswers++
      }
      this.quizProgress = Math.round((this.completedQuestions / this.totalQuestions) * 100)
    },
    
    // 处理测验完成
    handleQuizComplete(results) {
      this.score = results.score || this.correctAnswers
      this.showResults = true
    },
    
    // 处理查看教程
    handleViewTutorial(questionId) {
      console.log('查看教程:', questionId)
      // 可以在这里实现跳转到相应教程的逻辑
    },
    
    // 获取进度条颜色
    getProgressColor(progress) {
      if (progress >= 80) return '#67C23A'
      if (progress >= 50) return '#E6A23C'
      return '#F56C6C'
    },
    
    // 重新测验
    retakeQuiz() {
      this.completedQuestions = 0
      this.correctAnswers = 0
      this.quizProgress = 0
      this.showResults = false
      // 强制重新加载组件
      this.$nextTick(() => {
        // 获取组件实例并调用重置方法
        const quizComponent = this.$refs.quizComponent
        if (quizComponent) {
          quizComponent.resetEntireQuiz()
        }
      })
    },
    
    // 返回学习中心
    goToLearningCenter() {
      this.$router.push('/learn')
    }
  }
}
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  min-height: 100vh;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.fade-in { animation: fadeIn 0.8s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
@keyframes fadeInDown { from { opacity:0; transform: translateY(-20px);} to { opacity:1; transform: translateY(0);} }
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out 0.2s both; }
@keyframes fadeInUp { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: translateY(0);} }

.el-progress {
  margin-bottom: 10px;
}

::deep(.el-card) {
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease !important;
}
::deep(.el-card:hover) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px) !important;
}
::deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 16px 20px !important;
  font-weight: 600 !important;
}

::deep(.el-button) {
  border-radius: 10px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
::deep(.el-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
::deep(.el-button:active) { transform: translateY(0) !important; }
::deep(.el-button--primary) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important; }
::deep(.el-button--info) { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important; border: none !important; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
