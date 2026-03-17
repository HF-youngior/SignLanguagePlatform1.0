<template>
  <div class="living-room-container">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link
              to="/"
              class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300"
            >
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3" />
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/home" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-10 pb-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 状态栏 -->
        <section class="status-bar fade-in">
          <div class="flex justify-between items-center">
            <div class="coin-display">
              <span class="coin-icon">💰</span>
              <span class="coin-count">{{ coins }}</span>
            </div>
            <div class="progress-display">
              <span class="progress-text">客厅进度：{{ completedItems }}/{{ totalItems }}</span>
            </div>
          </div>
        </section>

        <!-- 3D客厅场景 -->
        <section class="room-section fade-in">
          <div class="room-header">
            <h2 class="text-2xl font-semibold text-slate-900">客厅学习</h2>
            <button class="exit-button" @click="exitRoom">
              <span class="exit-icon">🚪</span>
              <span>退出</span>
            </button>
          </div>

          <!-- 3D场景容器 -->
          <div class="room-scene">
            <!-- 墙壁和地板 -->
            <div class="back-wall"></div>
            <div class="floor"></div>

            <!-- 家具轮廓 -->
            <div 
              v-for="(item, index) in furnitureItems" 
              :key="item.id"
              :class="['furniture-outline', item.id, { 
                'active': currentItemIndex === index, 
                'completed': item.completed 
              }]"
              @click="selectFurniture(index)"
            >
              <!-- 家具轮廓 -->
              <div class="furniture-shape"></div>
              <!-- 可学习标记 -->
              <div :class="['learning-marker', { 'completed': item.completed }]"></div>
              <!-- 家具名称 -->
              <div class="furniture-name">{{ item.name }}</div>
            </div>
          </div>

          <!-- 底部学习清单 -->
          <div class="learning-list">
            <div 
              v-for="(item, index) in furnitureItems" 
              :key="item.id"
              :class="['list-item', { 
                'active': currentItemIndex === index, 
                'completed': item.completed 
              }]"
            >
              <div :class="['progress-dot', { 'completed': item.completed }]"></div>
              <span class="item-name">{{ item.name }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 答题窗口 -->
    <div v-if="showQuiz" class="quiz-overlay">
      <div class="quiz-container">
        <div class="quiz-header">
          <h3>哪个手语表示'{{ currentItem.name }}'？</h3>
        </div>
        
        <div v-if="!showAnswer" class="quiz-options">
          <div 
            v-for="(option, idx) in quizOptions" 
            :key="idx"
            :class="['option-item', { 
              'correct': selectedOption === idx && option.correct, 
              'incorrect': selectedOption === idx && !option.correct 
            }]"
            @click="selectOption(idx)"
          >
            <div class="option-image">
              <img 
                :src="`/assets/images/options/option_${getOptionImageName(option.itemName)}.png`" 
                :alt="`选项 ${String.fromCharCode(65 + idx)}`"
                class="option-image-img"
              />
            </div>
            <div class="option-label">{{ String.fromCharCode(65 + idx) }}</div>
          </div>
        </div>
        
        <div v-else class="quiz-answer">
          <div class="answer-image">
            <img 
              :src="`/assets/images/teaching/teaching_${currentItem.name}.jpg`" 
              :alt="`${currentItem.name} 教学图片`"
              class="answer-image-img"
            />
          </div>
          <div class="answer-text">正确手语：{{ currentItem.name }}</div>
        </div>
        
        <div class="quiz-footer">
          <button 
            v-if="selectedOption !== null && !showAnswer" 
            class="next-button"
            @click="showAnswer = true"
          >
            查看答案
          </button>
          <button 
            v-else-if="showAnswer" 
            class="next-button"
            @click="nextItem"
          >
            {{ currentItemIndex === totalItems - 1 ? '完成' : '下一题' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 金币奖励动画 -->
    <div v-if="showCoinAnimation" class="coin-animation">
      <span class="coin-text">金币+10</span>
    </div>

    <!-- 完成动画 -->
    <div v-if="showCompletion" class="completion-overlay">
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <h3>客厅装修完成！</h3>
        <p>本次获得金币：{{ totalCoinsEarned }}</p>
        <p>卧室已解锁！</p>
        <button class="return-button" @click="returnToHomeMap">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LivingRoom',
  data() {
    return {
      coins: 0,
      totalItems: 7,
      completedItems: 0,
      currentItemIndex: 0,
      showQuiz: false,
      showAnswer: false,
      selectedOption: null,
      showCoinAnimation: false,
      showCompletion: false,
      totalCoinsEarned: 0,
      furnitureItems: [
        { id: 'sofa', name: '沙发', completed: false },
        { id: 'tv', name: '电视', completed: false },
        { id: 'coffee-table', name: '茶几', completed: false },
        { id: 'chandelier', name: '吊灯', completed: false },
        { id: 'bookshelf', name: '书柜', completed: false },
        { id: 'carpet', name: '地毯', completed: false },
        { id: 'window', name: '窗', completed: false }
      ],
      quizOptions: []
    }
  },
  computed: {
    currentItem() {
      return this.furnitureItems[this.currentItemIndex]
    }
  },
  mounted() {
    this.loadCoins()
    this.loadFurnitureProgress()
    // 进入房间后自动高亮第一个物品
    this.highlightCurrentItem()
  },
  methods: {
    loadCoins() {
      const storedCoins = Number(localStorage.getItem('userCoins') || 0)
      this.coins = storedCoins
    },
    loadFurnitureProgress() {
      const storedFurniture = localStorage.getItem('livingRoomFurniture')
      if (storedFurniture) {
        const parsedFurniture = JSON.parse(storedFurniture)
        this.furnitureItems = parsedFurniture
        this.completedItems = this.furnitureItems.filter(item => item.completed).length
      }
    },
    saveFurnitureProgress() {
      localStorage.setItem('livingRoomFurniture', JSON.stringify(this.furnitureItems))
    },
    exitRoom() {
      this.$router.push('/learn/challenge/level-2')
    },
    selectFurniture(index) {
      // 允许点击任何物品，无论是否已完成
      // 更新当前物品索引，确保题目显示正确的物品名称
      this.currentItemIndex = index
      
      const currentItem = this.furnitureItems[index]
      
      // 生成符合规则的选项
      const allItems = this.furnitureItems.map(item => item.name)
      const correctItem = currentItem.name
      
      // 过滤出错误选项的物品
      const wrongItems = allItems.filter(item => item !== correctItem)
      
      // 随机选择3个错误选项
      const shuffledWrongItems = wrongItems.sort(() => 0.5 - Math.random())
      const selectedWrongItems = shuffledWrongItems.slice(0, 3)
      
      // 构建选项数组
      this.quizOptions = [
        { correct: true, itemName: correctItem },
        { correct: false, itemName: selectedWrongItems[0] },
        { correct: false, itemName: selectedWrongItems[1] },
        { correct: false, itemName: selectedWrongItems[2] }
      ]
        
      // 随机打乱选项顺序
      this.quizOptions.sort(() => 0.5 - Math.random())
        
      this.showQuiz = true
      this.showAnswer = false
      this.selectedOption = null
    },
    selectOption(index) {
      if (this.selectedOption === null) {
        this.selectedOption = index
      }
    },
    nextItem() {
      // 找到当前正在回答的物品
      const currentItemName = this.quizOptions.find(option => option.correct).itemName
      const currentItemIndex = this.furnitureItems.findIndex(item => item.name === currentItemName)
      
      // 检查物品是否已经完成，只有第一次完成才给金币
      if (!this.furnitureItems[currentItemIndex].completed) {
        // 标记当前物品为已完成
        this.furnitureItems[currentItemIndex].completed = true
        this.completedItems++
        
        // 显示金币奖励动画
        this.showCoinAnimation = true
        setTimeout(() => {
          this.showCoinAnimation = false
        }, 1000)
        
        // 更新金币数量
        this.coins += 10
        this.totalCoinsEarned += 10
        localStorage.setItem('userCoins', this.coins)
        
        // 保存物品完成状态
        this.saveFurnitureProgress()
        
        // 检查是否完成所有物品
        if (this.completedItems === this.totalItems) {
          // 显示完成动画
          setTimeout(() => {
            this.showQuiz = false
            this.showCompletion = true
            // 解锁卧室
            localStorage.setItem('bedroomUnlocked', 'true')
            // 更新HomeMap的完成房间数
            const storedCompleted = Number(localStorage.getItem('homeMapCompletedRooms') || 0)
            if (storedCompleted < 1) {
              localStorage.setItem('homeMapCompletedRooms', '1')
            }
            // 更新completedRooms数组，将living-room添加到已完成房间列表
            const completedRooms = JSON.parse(localStorage.getItem('completedRooms') || '[]')
            if (!completedRooms.includes('living-room')) {
              completedRooms.push('living-room')
              localStorage.setItem('completedRooms', JSON.stringify(completedRooms))
            }
          }, 500)
        } else {
          // 重置状态
          this.showQuiz = false
          this.showAnswer = false
          this.selectedOption = null
          // 重置选项数组
          this.quizOptions = []
        }
      } else {
        // 物品已经完成，直接重置状态
        this.showQuiz = false
        this.showAnswer = false
        this.selectedOption = null
        this.quizOptions = []
      }
    },
    highlightCurrentItem() {
      // 这里可以添加高亮动画逻辑
      console.log('Highlighting item:', this.currentItem.name)
    },
    getOptionImageName(itemName) {
      // 处理图片文件名与itemName的映射
      return itemName
    },
    returnToHomeMap() {
      this.$router.push('/learn/challenge/level-2')
    }
  }
}
</script>

<style scoped>
.living-room-container {
  min-height: 100vh;
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.status-bar {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px 30px;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(129, 140, 248, 0.18);
  margin-bottom: 20px;
}

.coin-display {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffc107;
}

.coin-icon {
  font-size: 1.5rem;
  margin-right: 10px;
}

.progress-display {
  font-size: 1.2rem;
  color: #4a6fa5;
  font-weight: bold;
}

.room-section {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(129, 140, 248, 0.18);
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px 12px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
}

.exit-button {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exit-button:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.exit-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.room-scene {
  position: relative;
  height: 500px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  background: linear-gradient(to bottom, #e0e0e0 0%, #f5f5f5 100%);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.1);
  perspective: 1200px;
}

.room-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #e0e0e0 0%, #f5f5f5 100%);
}

/* 墙壁和地板 */
.wall {
  position: absolute;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  transform-style: preserve-3d;
}

.back-wall {
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.1);
  transform: translateZ(-50px);
}

.floor {
  top: 70%;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(45deg, #d4b896 25%, #c19a6b 25%, #c19a6b 50%, #d4b896 50%, #d4b896 75%, #c19a6b 75%, #c19a6b 100%);
  background-size: 20px 20px;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.15), 0 -2px 10px rgba(0,0,0,0.1);
  transform: rotateX(20deg) translateZ(-50px);
  transform-origin: top;
}

.furniture-outline {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center;
  transform-style: preserve-3d;
  filter: grayscale(100%);
  opacity: 0.7;
}

.furniture-outline.completed {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.05) perspective(800px) rotateX(5deg);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

/* 沙发 - 加大尺寸，增强立体感 */
.furniture-outline.sofa {
  top: 60%;
  left: 35%;
  width: 220px;
  height: 110px;
  transform: perspective(800px) rotateX(5deg);
}

.furniture-outline.sofa .furniture-shape {
  background: linear-gradient(to bottom, #6495ed, #4169e1);
  border: 2px solid #191970;
  border-radius: 15px 15px 0 0;
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.25);
  transform: translateZ(10px);
}

/* 沙发靠背 */
.furniture-outline.sofa .furniture-shape::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  height: 25px;
  background: linear-gradient(to bottom, #191970, #4169e1);
  border: 2px solid #191970;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.15);
  transform: translateZ(5px);
}

/* 沙发座位边缘 */
.furniture-outline.sofa .furniture-shape::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: #191970;
  border-radius: 0 0 4px 4px;
}

/* 沙发扶手 */
.furniture-outline.sofa .furniture-shape::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  height: 25px;
  background: linear-gradient(to bottom, #191970, #4169e1);
  border: 2px solid #191970;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.15);
  transform: translateZ(5px);
}

.furniture-outline.sofa .furniture-shape::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: #191970;
  border-radius: 0 0 4px 4px;
}

/* 电视 - 保持在原位 */
.furniture-outline.tv {
  top: 30%;
  left: 70%;
  width: 120px;
  height: 80px;
  transform: perspective(800px) rotateY(-15deg);
}

.furniture-outline.tv .furniture-shape {
  background: linear-gradient(to bottom, #000, #222);
  border: 3px solid #333;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}

.furniture-outline.tv .furniture-shape::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 15px;
  background: linear-gradient(to bottom, #333, #555);
  border: 2px solid #444;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.furniture-outline.tv .furniture-shape::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background: linear-gradient(to bottom, #1a1a1a, #0d0d0d);
  border-radius: 3px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

/* 茶几 - 放在沙发前面 */
.furniture-outline.coffee-table {
  top: 75%;
  left: 45%;
  width: 140px;
  height: 90px;
  transform: perspective(800px) rotateX(10deg);
}

.furniture-outline.coffee-table .furniture-shape {
  background: linear-gradient(to bottom, #2c3e50, #34495e);
  border: 2px solid #1a252f;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transform: translateZ(5px);
}

.furniture-outline.coffee-table .furniture-shape::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 25px;
  width: 15px;
  height: 10px;
  background: #1a252f;
  border: 2px solid #0f171e;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.furniture-outline.coffee-table .furniture-shape::before {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 25px;
  width: 15px;
  height: 10px;
  background: #1a252f;
  border: 2px solid #0f171e;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 吊灯 - 移动到沙发和茶几区域正上方 */
.furniture-outline.chandelier {
  top: 10%;
  left: 40%;
  width: 80px;
  height: 80px;
  transform: translateX(-50%) perspective(800px) rotateY(5deg);
}

.furniture-outline.chandelier .furniture-shape {
  background: radial-gradient(circle, #ffd700, #ffed4e);
  border: 2px solid #ffc107;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.furniture-outline.chandelier .furniture-shape::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #c8b464, #ffd700);
  border: 1px solid #b8941f;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.furniture-outline.chandelier .furniture-shape::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #ffffff, #ffd700);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

/* 书架 - 高大的立式书架，靠墙放 */
.furniture-outline.bookshelf {
  top: 35%;
  left: 12%;
  width: 80px;
  height: 180px;
  transform: perspective(800px) rotateY(15deg);
}

.furniture-outline.bookshelf .furniture-shape {
  background: linear-gradient(to right, #d2b48c, #bc8f8f);
  border: 2px solid #8b4513;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transform: translateZ(5px);
}

/* 书架隔板 */
.furniture-outline.bookshelf .furniture-shape::before {
  content: '';
  position: absolute;
  top: 25%;
  left: 0;
  width: 100%;
  height: 3px;
  background: #8b4513;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.furniture-outline.bookshelf .furniture-shape::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 3px;
  background: #8b4513;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 书架上书 */
.furniture-outline.bookshelf .furniture-shape {
  background: linear-gradient(to right, #d2b48c, #bc8f8f);
  border: 2px solid #8b4513;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transform: translateZ(5px);
}

/* 第一排书 */
.furniture-outline.bookshelf .furniture-shape::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 10px;
  width: 60px;
  height: 8px;
  background: linear-gradient(to right, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 第二排书 */
.furniture-outline.bookshelf .furniture-shape::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 10px;
  width: 60px;
  height: 8px;
  background: linear-gradient(to right, #a8e6cf, #dcedc1, #ffd3b6, #ffaaa5, #ff8b94);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 第三排书 */
.furniture-outline.bookshelf .furniture-shape {
  background: linear-gradient(to right, #d2b48c, #bc8f8f);
  border: 2px solid #8b4513;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transform: translateZ(5px);
}

.furniture-outline.bookshelf .furniture-shape::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 10px;
  width: 60px;
  height: 8px;
  background: linear-gradient(to right, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.furniture-outline.bookshelf .furniture-shape::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 10px;
  width: 60px;
  height: 8px;
  background: linear-gradient(to right, #a8e6cf, #dcedc1, #ffd3b6, #ffaaa5, #ff8b94);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 书架装饰 */
.furniture-outline.bookshelf .furniture-shape {
  background: linear-gradient(to right, #d2b48c, #bc8f8f);
  border: 2px solid #8b4513;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transform: translateZ(5px);
}

/* 地毯 - 浅灰色，铺在沙发和茶几下方 */
.furniture-outline.carpet {
  top: 55%;
  left: 35%;
  width: 300px;
  height: 180px;
  transform: perspective(800px) rotateX(5deg);
}

.furniture-outline.carpet .furniture-shape {
  background: linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%, #e0e0e0 100%);
  background-size: 30px 30px;
  border: 2px solid #d0d0d0;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* 窗户 - 保持在一面墙上 */
.furniture-outline.window {
  top: 20%;
  left: 25%;
  width: 150px;
  height: 120px;
  transform: perspective(800px) rotateY(-10deg);
}

.furniture-outline.window .furniture-shape {
  background: linear-gradient(to bottom, #add8e6, #87ceeb);
  border: 3px solid #6495ed;
  border-radius: 5px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0,0,0,0.15);
}

.furniture-outline.window .furniture-shape::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 100%;
  background: rgba(100, 149, 237, 0.8);
  transform: translateX(-50%);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.furniture-outline.window .furniture-shape::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(100, 149, 237, 0.8);
  transform: translateY(-50%);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.furniture-shape {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.furniture-outline.active .furniture-shape {
  background: rgba(255, 255, 255, 0.8);
  border-color: #ffffff;
  animation: pulse 2s infinite;
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.25);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.furniture-outline.completed {
  filter: grayscale(0%);
  opacity: 1;
}

.furniture-outline.completed .furniture-shape {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.learning-marker {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  animation: bounce 2s infinite;
}

.learning-marker.completed {
  background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%);
  animation: none;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

.furniture-name {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.learning-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(99, 102, 241, 0.08);
}

.list-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.list-item.active {
  background: rgba(129, 140, 248, 0.1);
  font-weight: bold;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border: 2px solid #94a3b8;
  border-radius: 50%;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.progress-dot.completed {
  background: #10b981;
  border-color: #10b981;
}

.quiz-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.quiz-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: 90vh;
}

.quiz-header {
  margin-bottom: 40px;
  text-align: center;
}

.quiz-header h3 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin-bottom: 15px;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  justify-content: space-between;
}

.option-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.option-item.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.option-item.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.placeholder-image {
  width: 140px;
  height: 140px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: #94a3b8;
  margin-bottom: 15px;
}

.option-label {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 10px;
}

.option-image-img {
  max-width: 100%;
  max-height: 160px;
  border-radius: 8px;
  object-fit: contain;
  margin-bottom: 15px;
}

.answer-image-img {
  max-width: 100%;
  max-height: 350px;
  border-radius: 12px;
  object-fit: contain;
  margin-bottom: 25px;
}

.quiz-answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.answer-image {
  width: 220px;
  height: 220px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 25px;
}

.answer-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 10px;
}

.quiz-footer {
  display: flex;
  justify-content: center;
}

.next-button {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

.coin-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 215, 0, 0.9);
  color: #8b5a00;
  padding: 20px 40px;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 1001;
  animation: coinFloat 1s ease-out forwards;
}

@keyframes coinFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%);
  }
}

.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.completion-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.completion-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.completion-content p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 10px;
}

.return-button {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 30px;
}

.return-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-scene {
    height: 400px;
  }
  
  .furniture-outline {
    width: 80px;
    height: 80px;
  }
  
  .furniture-outline.carpet {
    width: 150px;
    height: 100px;
  }
  
  .furniture-name {
    font-size: 0.8rem;
  }
  
  .learning-list {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .quiz-options {
    grid-template-columns: 1fr;
  }
}
</style>