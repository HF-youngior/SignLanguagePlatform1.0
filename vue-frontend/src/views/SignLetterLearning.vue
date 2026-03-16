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
            <router-link to="/learn" class="text-gray-700 hover:text-blue-600">
              <el-icon><ArrowLeft /></el-icon>
              返回学习中心
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
          <h1 class="text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down">🔤 手语字母学习</h1>
          <p class="text-xl text-gray-700 font-medium animate-fade-in-up">学习A-J手语字母的正确手势</p>
        </div>



        <!-- 学习题目 -->
        <el-card v-if="currentQuestion" class="mb-8" shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-blue-600">第 {{ currentLetterIndex + 1 }} 题</span>
              <el-tag type="success" v-if="answerSubmitted && isCorrect">答对了！</el-tag>
              <el-tag type="danger" v-if="answerSubmitted && !isCorrect">答错了</el-tag>
            </div>
          </template>
          
          <div class="text-center">
            <!-- 手语图片 -->
            <div class="mb-8">
              <div class="inline-block p-8 bg-gray-100 rounded-lg">
                <img 
                  :src="getImageUrl(currentQuestion.image_path)" 
                  :alt="`手语字母 ${currentQuestion.letter}`"
                  class="w-48 h-48 object-contain"
                  @error="handleImageError"
                />
              </div>
              <p class="text-gray-600 mt-4">这是什么手语字母？</p>
            </div>

            <!-- 选项 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <el-button 
                v-for="option in currentQuestion.options" 
                :key="option"
                :type="getOptionButtonType(option)"
                :class="getOptionClass(option)"
                size="large"
                @click="selectAnswer(option)"
                :disabled="answerSubmitted"
                class="h-16 text-xl font-bold"
              >
                {{ option }}
              </el-button>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-center space-x-4">
              <el-button 
                v-if="!answerSubmitted"
                type="primary" 
                size="large"
                @click="submitAnswer"
                :disabled="!selectedAnswer"
              >
                提交答案
              </el-button>
              
              <el-button 
                v-if="answerSubmitted && !isCorrect"
                type="warning" 
                size="large"
                @click="showExplanation"
              >
                查看说明
              </el-button>
              
              <el-button 
                v-if="answerSubmitted"
                type="success" 
                size="large"
                @click="nextQuestion"
              >
                {{ isLastQuestion ? '完成学习' : '下一题' }}
              </el-button>
              
              <el-button 
                type="info" 
                size="large"
                @click="exitLearning"
              >
                退出学习
              </el-button>
            </div>

            <!-- 答案提示 -->
            <div v-if="answerSubmitted" class="mt-6">
              <el-alert
                :title="isCorrect ? '🎉 答对了！' : '❌ 答错了'"
                :type="isCorrect ? 'success' : 'error'"
                :description="isCorrect ? `正确答案是: ${currentQuestion.correct_answer}` : `正确答案是: ${currentQuestion.correct_answer}`"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-card>

        <!-- 加载状态 -->
        <el-card v-if="loading" class="text-center" shadow="hover">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p class="mt-4">加载中...</p>
        </el-card>

        <!-- 错误状态 -->
        <el-card v-if="error" class="text-center" shadow="hover">
          <el-icon><Warning /></el-icon>
          <p class="mt-4 text-red-600">{{ error }}</p>
          <el-button type="primary" @click="loadQuestion" class="mt-4">重试</el-button>
        </el-card>
      </div>
    </main>

    <!-- 说明图片对话框 -->
    <el-dialog
      v-model="showExplanationDialog"
      title="手语字母说明"
      width="80%"
      :before-close="closeExplanation"
    >
      <div class="text-center">
        <img 
          :src="getImageUrl(currentQuestion?.explanation_path)" 
          :alt="`手语字母 ${currentQuestion?.letter} 说明`"
          class="w-full max-w-md mx-auto object-contain"
          @error="handleExplanationImageError"
        />
        <p class="mt-4 text-lg font-semibold">手语字母 {{ currentQuestion?.letter }} 的正确手势</p>
        <p class="text-gray-600">请仔细观察手势的细节，包括手指的位置和形状</p>
      </div>
      <template #footer>
        <el-button @click="closeExplanation">关闭</el-button>
        <el-button type="primary" @click="nextQuestion">继续学习</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowLeft, Loading, Warning } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'SignLetterLearning',
  components: {
    ArrowLeft,
    Loading,
    Warning
  },
  data() {
    return {
      // 学习状态
      currentQuestion: null,
      currentLetterIndex: 0,
      totalLetters: 10, // A-J共10个字母
      selectedAnswer: '',
      answerSubmitted: false,
      isCorrect: false,
      loading: false,
      error: null,
      
      // 对话框状态
      showExplanationDialog: false,
      
      // API基础URL
      apiBaseUrl: 'http://localhost:8000/api'
    }
  },
  computed: {
    isLastQuestion() {
      return this.currentLetterIndex >= this.totalLetters - 1
    }
  },
  mounted() {
    this.document.title = '手语字母学习 - 手语教学平台'
    this.loadQuestion()
  },
  methods: {
    // 加载题目
    async loadQuestion() {
      this.loading = true
      this.error = null
      this.answerSubmitted = false
      this.selectedAnswer = ''
      
      try {
        const response = await axios.get(`${this.apiBaseUrl}/sign-letters/question`, {
          params: {
            currentId: this.currentLetterIndex + 1
          }
        })
        
        if (response.data.success) {
          this.currentQuestion = response.data.data
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('加载题目失败:', error)
        this.error = error.response?.data?.message || '加载题目失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    // 选择答案
    selectAnswer(answer) {
      if (!this.answerSubmitted) {
        this.selectedAnswer = answer
      }
    },
    
    // 提交答案
    async submitAnswer() {
      if (!this.selectedAnswer) return
      
      try {
        const response = await axios.post(`${this.apiBaseUrl}/sign-letters/answer`, {
          letterId: this.currentQuestion.id,
          selectedAnswer: this.selectedAnswer,
          userId: null // 暂时不传用户ID
        })
        
        if (response.data.success) {
          this.isCorrect = response.data.data.isCorrect
          this.answerSubmitted = true
          
          // 显示结果提示
          this.$message({
            message: this.isCorrect ? '答对了！' : '答错了，请继续学习',
            type: this.isCorrect ? 'success' : 'error'
          })
        }
      } catch (error) {
        console.error('提交答案失败:', error)
        this.$message.error('提交答案失败，请重试')
      }
    },
    
    // 下一题
    async nextQuestion() {
      if (this.isLastQuestion) {
        this.$message.success('恭喜！您已完成所有手语字母的学习！')
        this.$router.push('/learn')
        return
      }
      
      this.currentLetterIndex++
      this.showExplanationDialog = false
      await this.loadQuestion()
    },
    
    // 显示说明
    showExplanation() {
      this.showExplanationDialog = true
    },
    
    // 关闭说明对话框
    closeExplanation() {
      this.showExplanationDialog = false
    },
    
    // 退出学习
    exitLearning() {
      this.$confirm('确定要退出学习吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push('/learn')
      }).catch(() => {
        // 用户取消
      })
    },
    
    // 获取图片URL
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // 如果是相对路径，添加API基础URL
      if (imagePath.startsWith('images/')) {
        return `${this.apiBaseUrl.replace('/api', '')}/${imagePath}`
      }
      return imagePath
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      console.error('图片加载失败:', event.target.src)
      event.target.src = '/placeholder-image.png' // 可以设置一个占位图片
    },
    
    // 处理说明图片加载错误
    handleExplanationImageError(event) {
      console.error('说明图片加载失败:', event.target.src)
      event.target.src = '/placeholder-explanation.png'
    },
    
    // 获取选项按钮类型
    getOptionButtonType(option) {
      if (!this.answerSubmitted) return ''
      
      if (option === this.currentQuestion.correct_answer) {
        return 'success'
      } else if (option === this.selectedAnswer && !this.isCorrect) {
        return 'danger'
      }
      return ''
    },
    
    // 获取选项样式类
    getOptionClass(option) {
      if (!this.answerSubmitted) return ''
      
      if (option === this.currentQuestion.correct_answer) {
        return 'correct-answer'
      } else if (option === this.selectedAnswer && !this.isCorrect) {
        return 'wrong-answer'
      }
      return ''
    },
    
    // 获取进度条颜色
    getProgressColor(progress) {
      if (progress >= 80) return '#67C23A'
      if (progress >= 50) return '#E6A23C'
      return '#F56C6C'
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
::deep(.el-card__body) { padding: 20px !important; }

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
::deep(.el-button--success) { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important; border: none !important; }
::deep(.el-button--warning) { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important; border: none !important; }
::deep(.el-button--info) { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important; border: none !important; }

.correct-answer {
  background-color: #67C23A !important;
  color: white !important;
  border-color: #67C23A !important;
}

.wrong-answer {
  background-color: #F56C6C !important;
  color: white !important;
  border-color: #F56C6C !important;
}

.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: scale(1.05);
}

.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}
</style>
