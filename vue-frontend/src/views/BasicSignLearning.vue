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
            <router-link to="/home" class="text-gray-700 hover:text-blue-600">首页</router-link>
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
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8 fade-in">
          <h1 class="text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down">🔤 手语基础学习</h1>
          <p class="text-xl text-gray-700 font-medium animate-fade-in-up">掌握手语字母、数字和手指语的基本手势</p>
        </div>

        <!-- 小游戏板块 -->
        <el-card class="mb-8" shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-blue-600">🎮 手语小游戏</span>
              <el-tag type="success">得分: {{ gameScore }}</el-tag>
            </div>
          </template>
          
          <div class="text-center">
            <!-- 游戏题目 -->
            <div class="mb-6">
              <div class="text-6xl mb-4">{{ currentQuestion.signImage }}</div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">这是什么手语？</h3>
              <p class="text-gray-600">类型: {{ getCategoryName(currentQuestion.category) }}</p>
            </div>

            <!-- 选项 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <el-button 
                v-for="option in currentQuestion.options" 
                :key="option"
                :type="selectedAnswer === option ? 'primary' : ''"
                :class="getOptionClass(option)"
                size="large"
                @click="selectAnswer(option)"
                :disabled="gameFinished"
              >
                {{ option }}
              </el-button>
            </div>

            <!-- 游戏控制 -->
            <div class="flex justify-center space-x-4">
              <el-button 
                type="primary" 
                size="large"
                @click="checkAnswer"
                :disabled="!selectedAnswer || gameFinished"
              >
                提交答案
              </el-button>
              <el-button 
                type="info" 
                size="large"
                @click="nextQuestion"
                v-if="gameFinished"
              >
                下一题
              </el-button>
              <el-button 
                type="warning" 
                size="large"
                @click="resetGame"
              >
                重新开始
              </el-button>
            </div>

            <!-- 游戏结果提示 -->
            <div v-if="showResult" class="mt-4">
              <el-alert
                :title="isCorrect ? '🎉 答对了！' : '❌ 答错了'"
                :type="isCorrect ? 'success' : 'error'"
                :description="isCorrect ? `正确答案是: ${currentQuestion.answer}` : `正确答案是: ${currentQuestion.answer}`"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-card>



        <!-- 课程板块 -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- 手指语课程 -->
          <el-card shadow="hover" class="cursor-pointer" @click="startCourse('finger')">
            <div class="text-center">
              <div class="text-6xl mb-4">👆</div>
              <h3 class="text-2xl font-bold text-green-600 mb-4">手指语</h3>
              <p class="text-gray-600 mb-4">学习基本的手指语手势，包括常用词汇和表达</p>
              <div class="mb-4">
                <el-progress :percentage="fingerProgress" color="#67C23A" />
              </div>
              <el-button type="success" size="large" class="w-full">
                开始学习手指语
              </el-button>
            </div>
          </el-card>

          <!-- 字母课程 -->
          <el-card shadow="hover" class="cursor-pointer" @click="startCourse('letter')">
            <div class="text-center">
              <div class="text-6xl mb-4">🔤</div>
              <h3 class="text-2xl font-bold text-blue-600 mb-4">字母手语</h3>
              <p class="text-gray-600 mb-4">掌握26个英文字母的手语表达方式</p>
              <div class="mb-4">
                <el-progress :percentage="letterProgress" color="#409EFF" />
              </div>
              <el-button type="primary" size="large" class="w-full">
                开始学习字母
              </el-button>
            </div>
          </el-card>

          <!-- 数字手语课程 -->
          <el-card shadow="hover" class="cursor-pointer" @click="startCourse('number')">
            <div class="text-center">
              <div class="text-6xl mb-4">🔢</div>
              <h3 class="text-2xl font-bold text-purple-600 mb-4">数字手语</h3>
              <p class="text-gray-600 mb-4">学习0-9数字的手语表达和组合数字</p>
              <div class="mb-4">
                <el-progress :percentage="numberProgress" color="#9C27B0" />
              </div>
              <el-button type="warning" size="large" class="w-full">
                开始学习数字
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'BasicSignLearning',
  components: {
    ArrowLeft
  },
  data() {
    return {
      // 游戏相关数据
      gameScore: 0,
      currentQuestion: {},
      selectedAnswer: '',
      gameFinished: false,
      showResult: false,
      isCorrect: false,
      currentQuestionIndex: 0,
      
      // 学习进度数据
      fingerProgress: 25,
      letterProgress: 40,
      numberProgress: 15,
      
      // 游戏题库
      gameQuestions: [
        // 手指语题目
        {
          signImage: '👋',
          answer: '你好',
          category: 'finger',
          options: ['你好', '再见', '谢谢', '对不起']
        },
        {
          signImage: '👏',
          answer: '谢谢',
          category: 'finger',
          options: ['谢谢', '不客气', '你好', '再见']
        },
        {
          signImage: '🤝',
          answer: '合作',
          category: 'finger',
          options: ['合作', '握手', '帮助', '友谊']
        },
        {
          signImage: '🙏',
          answer: '请',
          category: 'finger',
          options: ['请', '谢谢', '对不起', '不客气']
        },
        
        // 字母题目
        {
          signImage: '✋',
          answer: 'A',
          category: 'letter',
          options: ['A', 'B', 'C', 'D']
        },
        {
          signImage: '✌️',
          answer: 'V',
          category: 'letter',
          options: ['V', 'W', 'Y', 'Z']
        },
        {
          signImage: '👍',
          answer: 'T',
          category: 'letter',
          options: ['T', 'F', 'G', 'H']
        },
        {
          signImage: '👌',
          answer: 'O',
          category: 'letter',
          options: ['O', 'Q', 'P', 'R']
        },
        
        // 数字题目
        {
          signImage: '👆',
          answer: '1',
          category: 'number',
          options: ['1', '2', '3', '4']
        },
        {
          signImage: '✌️',
          answer: '2',
          category: 'number',
          options: ['2', '1', '3', '4']
        },
        {
          signImage: '🤟',
          answer: '3',
          category: 'number',
          options: ['3', '2', '4', '5']
        },
        {
          signImage: '✋',
          answer: '5',
          category: 'number',
          options: ['5', '4', '6', '7']
        }
      ]
    }
  },
  computed: {
    overallProgress() {
      return Math.round((this.fingerProgress + this.letterProgress + this.numberProgress) / 3)
    }
  },
  mounted() {
    this.document.title = '手语基础学习 - 手语教学平台'
    this.generateQuestion()
  },
  methods: {
    // 生成随机题目
    generateQuestion() {
      const randomIndex = Math.floor(Math.random() * this.gameQuestions.length)
      this.currentQuestion = this.gameQuestions[randomIndex]
      this.selectedAnswer = ''
      this.gameFinished = false
      this.showResult = false
    },
    
    // 选择答案
    selectAnswer(answer) {
      if (!this.gameFinished) {
        this.selectedAnswer = answer
      }
    },
    
    // 检查答案
    checkAnswer() {
      if (!this.selectedAnswer) return
      
      this.isCorrect = this.selectedAnswer === this.currentQuestion.answer
      this.gameFinished = true
      this.showResult = true
      
      if (this.isCorrect) {
        this.gameScore += 10
        // 更新对应课程进度
        this.updateProgress(this.currentQuestion.category)
      }
    },
    
    // 下一题
    nextQuestion() {
      this.generateQuestion()
    },
    
    // 重新开始游戏
    resetGame() {
      this.gameScore = 0
      this.generateQuestion()
    },
    
    // 获取选项样式
    getOptionClass(option) {
      if (!this.gameFinished) return ''
      
      if (option === this.currentQuestion.answer) {
        return 'bg-green-500 text-white'
      } else if (option === this.selectedAnswer && !this.isCorrect) {
        return 'bg-red-500 text-white'
      }
      return ''
    },
    
    // 获取类别名称
    getCategoryName(category) {
      const names = {
        'finger': '手指语',
        'letter': '字母',
        'number': '数字'
      }
      return names[category] || '未知'
    },
    
    // 更新学习进度
    updateProgress(category) {
      const increment = 2 // 每次答对增加2%
      
      switch (category) {
        case 'finger':
          this.fingerProgress = Math.min(100, this.fingerProgress + increment)
          break
        case 'letter':
          this.letterProgress = Math.min(100, this.letterProgress + increment)
          break
        case 'number':
          this.numberProgress = Math.min(100, this.numberProgress + increment)
          break
      }
    },
    
    // 获取进度等级
    getProgressLevel() {
      if (this.overallProgress >= 80) return '高级'
      if (this.overallProgress >= 50) return '中级'
      return '初级'
    },
    
    // 获取进度条颜色
    getProgressColor(progress) {
      if (progress >= 80) return '#67C23A'
      if (progress >= 50) return '#E6A23C'
      return '#F56C6C'
    },
    
    // 开始课程学习
    startCourse(courseType) {
      if (courseType === 'finger') {
        // 跳转到手指语测验页面
        this.$router.push('/learn/finger-quiz')
      } else if (courseType === 'letter') {
        // 跳转到手语字母学习页面
        this.$router.push('/learn/sign-letters')
      } else {
        this.$message({
          message: `即将开始${this.getCategoryName(courseType)}课程学习`,
          type: 'info'
        })
        
        // 这里可以跳转到具体的课程页面
        // this.$router.push(`/learn/basic-sign/${courseType}`)
      }
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
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
</style>
