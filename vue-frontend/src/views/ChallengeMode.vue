<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg md:block hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link
              to="/"
              class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300"
            >
              <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">手语圈</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section class="challenge-banner fade-in">
          <div class="banner-content">
            <div class="banner-left">
              <div class="banner-icon">🌟</div>
              <div class="banner-text">
                <h1 class="banner-title">闯关模式</h1>
                <p class="banner-description">循序渐进，逐章点亮手语旅程，让学习像冒险闯关一样充满期待。</p>
              </div>
            </div>
            <div class="banner-buttons">
              <button @click="showBagDialog" class="bag-button">
                <span class="bag-icon">💼</span>
                <span class="bag-text">我的锦囊</span>
              </button>
              <router-link to="/learn" class="back-button">
                <span class="back-button__icon">←</span>
                <span class="back-button__text">返回学堂</span>
              </router-link>
            </div>
          </div>
          <div class="banner-hand-illustration" aria-hidden="true"></div>
        </section>



        <section class="map-section fade-in relative" style="min-height: 70vh;">
          <div class="map-section__header bg-white rounded-t-2xl p-6 shadow-sm z-10 relative">
            <div>
              <h2 class="text-2xl font-semibold text-slate-900">章节地图</h2>
              <p class="text-slate-600 text-sm mt-2">沿着路径前进，点亮篇章，更多故事正等待你解锁。</p>
            </div>
          </div>

          <div 
              class="town-map-container relative bg-white rounded-b-2xl shadow-sm overflow-hidden w-full h-[550px] sm:h-[700px] lg:h-[800px]"
            >
              <!-- 背景图 -->
              <img src="@/assets/custom-map-background.jpg" alt="Sign Town Map" class="absolute top-0 left-0 w-full h-full object-cover object-center" />
              
              <!-- 节点容器 -->
            <div class="absolute top-0 left-0 w-full h-full">
              <div
                v-for="(level, index) in levels"
                :key="level.id"
                class="map-node absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col items-center rounded-full"
                :class="[`status-${level.status}`, { 'is-current': index === completedLevels }]"
                :style="[getPinStyle(index), { width: windowWidth < 768 ? '50px' : '80px', height: windowWidth < 768 ? '50px' : '80px' }]"
                :data-level-id="level.id"
                @mouseenter="hoveredLevel = level.id"
                @mouseleave="hoveredLevel = null"
                @click="handleNodeClick(level)"
              >
                <!-- 透明交互热区，附带状态光环 -->
                <div 
                  class="absolute inset-0 rounded-full transition-all duration-500"
                  :class="{
                    'ring-4 ring-blue-400 ring-opacity-50 animate-pulse bg-blue-400/10': index === completedLevels,
                    'bg-gray-800/40': level.status === 'locked',
                    'hover:bg-white/20': level.status !== 'locked'
                  }"
                ></div>

                <!-- 关卡图标 -->
                <div v-if="level.icon" class="flex items-center justify-center w-full h-full text-2xl sm:text-3xl">
                  {{ level.icon }}
                </div>

                <!-- 状态标记（仅锁和完成的小图标） -->
                <div v-if="level.status === 'locked'" class="absolute -top-1 -right-1 bg-gray-800/80 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-sm backdrop-blur-sm z-20">
                  🔒
                </div>
                <div v-if="level.status === 'completed'" class="absolute -top-1 -right-1 bg-green-500/90 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-20">
                  ✓
                </div>
                
                <!-- Tooltip -->
                <transition name="tooltip">
                  <div v-if="hoveredLevel === level.id" class="pin-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none">
                    <span v-if="level.status === 'locked'">解锁条件：完成上一章节</span>
                    <span v-else-if="!level.routeName">该章节内容即将上线，敬请期待！</span>
                    <span v-else><strong>{{ level.title }}：{{ level.subtitle }}</strong><br/>{{ level.description }}</span>
                    <!-- 小箭头 -->
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          
          <!-- 章节详情对话框 -->
          <el-dialog
            v-model="levelDialogVisible"
            :width="windowWidth < 768 ? '90%' : '500px'"
            align-center
            class="level-dialog"
            :show-close="false"
          >
            <template #header>
              <div class="level-dialog__header">
                <div class="level-dialog__title">
                  <span class="level-dialog__icon">{{ selectedLevel?.icon }}</span>
                  <h3>{{ selectedLevel?.title }}：{{ selectedLevel?.subtitle }}</h3>
                </div>
                <button class="level-dialog__close" @click="closeLevelDialog">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </template>

            <div class="level-dialog__body">
              <p class="level-dialog__description">{{ selectedLevel?.description }}</p>
              <div v-if="selectedLevel?.status === 'completed'" class="level-dialog__achievement">
                <span class="achievement-icon">🏆</span>
                <span class="achievement-text">已完成学习</span>
              </div>
            </div>

            <template #footer>
              <div class="level-dialog__footer">
                <el-button @click="closeLevelDialog">关闭</el-button>
                <el-button 
                  type="primary" 
                  @click="startLevel(selectedLevel)"
                  :disabled="!selectedLevel?.routeName"
                >
                  {{ selectedLevel?.status === 'completed' ? '复习本章' : '开始挑战' }}
                </el-button>
              </div>
            </template>
          </el-dialog>
        </section>

        <!-- 锦囊对话框 -->
        <el-dialog
          v-model="bagDialogVisible"
          :width="windowWidth < 768 ? '95%' : '600px'"
          align-center
          class="bag-dialog"
          :show-close="false"
        >
          <template #header>
            <div class="bag-dialog__header">
              <div class="bag-dialog__title">💼 我的锦囊</div>
              <button class="bag-dialog__close" @click="closeBagDialog">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </template>

          <div class="bag-dialog__body">
            <div v-if="isLessonSaved || isGrammarBagSaved" class="bag-items">
              <div v-if="isLessonSaved" class="bag-item">
                <div class="bag-item__header">
                  <h3 class="bag-item__title">🎯 小课堂｜用手语"说"出年月日</h3>
                  <span class="bag-item__source">来自：篇章一 · 数字与日历</span>
                </div>
                <div class="bag-item__content">
                  <p class="bag-item__text">
                    恭喜你学会了手语数字！现在，我们现在来总结一下如何用手语表达日期。
                  </p>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">📅 年​份</h4>
                    <p class="bag-item__section-content">
                      右手食指从左拳关节（象征四季）向下划——一年就这样"划"出来啦。想表示几年右手就摆数字几。
                    </p>
                  </div>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">🌙 月​份</h4>
                    <p class="bag-item__section-content">
                      左手食指横伸，手背向外，右手食指指尖沿左手下向左一撇，模拟"月"字的第一个笔画。要表达几个月，左手就摆数字几。
                    </p>
                  </div>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">☀️ 日期</h4>
                    <p class="bag-item__section-content">
                      左手在上表月份（比数字），右手在下列日期（比数字），比如左手"6"+右手"8"，就是 6月8日。
                    </p>
                  </div>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">💡 试试看</h4>
                    <p class="bag-item__section-content">
                      用你学到的数字，搭配上面的手势和位置规则，就能组合出任意日期啦！快去日历里挑几个日子，用手语"说"出来吧～✋💬
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="isGrammarBagSaved" class="bag-item">
                <div class="bag-item__header">
                  <h3 class="bag-item__title">🎒 手语语法学习锦囊1</h3>
                  <span class="bag-item__source">来自：篇章一 · 数字与日历</span>
                </div>
                <div class="bag-item__content">
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">⭐ 核心规则：时间词句首</h4>
                    <p class="bag-item__section-content">
                      手语中，先表述时间，再表述主体。手语是视觉语言，先建立时间背景，再传达核心信息，让对方第一时间知道 "什么时候"。
                    </p>
                  </div>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">📝 规则对比</h4>
                    <div class="bag-item__table-container">
                      <table class="bag-item__table">
                        <thead>
                          <tr>
                            <th>场景</th>
                            <th>口语表达</th>
                            <th>手语表达</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>今天</td>
                            <td>我今天去学校</td>
                            <td>今天我去学校</td>
                          </tr>
                          <tr>
                            <td>明天</td>
                            <td>我明天买苹果</td>
                            <td>明天我买苹果</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bag-item__section">
                    <h4 class="bag-item__section-title">💭 记忆口诀</h4>
                    <p class="bag-item__section-content">
                      时间词，放句首，<br>先说时间后说事。<br>今天明天和昨天，<br>统统放到最前面！
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="bag-empty">
              <div class="bag-empty__icon">📭</div>
              <h3 class="bag-empty__title">锦囊是空的</h3>
              <p class="bag-empty__text">完成关卡并保存小课堂内容到锦囊，这里就会显示你收集的学习资料啦！</p>
            </div>
          </div>

          <template #footer>
            <div class="bag-dialog__footer">
              <el-button type="primary" round @click="closeBagDialog">关闭</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'ChallengeMode',
  data() {
    return {
      windowWidth: window.innerWidth,
      totalLevels: 7,
      completedLevels: 0,
      progressPercent: 0,
      hoveredLevel: null,
      bagDialogVisible: false,
      selectedLevel: null,
      levelDialogVisible: false,
      levels: [
        {
          id: 1,
          title: '篇章一',
          subtitle: '数字与日历',
          status: 'available',
          routeName: 'ChallengeLevelCalendar',
          description: '把数字和日期编进生活日常，每天的日历都是一次手语练习。',
          icon: '📅'
        },
        {
          id: 2,
          title: '篇章二',
          subtitle: '我的新家',
          status: 'available',
          routeName: 'HomeMap',
          description: '探索家中每个房间，学习日常生活用品的手语表达。'
        },
        {
          id: 3,
          title: '篇章三',
          subtitle: '公共出行',
          status: 'locked',
          routeName: null,
          description: '学习乘坐公交、地铁等公共交通工具时的实用手语。'
        },
        {
          id: 5,
          title: '篇章五',
          subtitle: '志愿服务',
          status: 'locked',
          routeName: null,
          description: '掌握志愿服务场景中的沟通技巧与专业手语。',
          icon: '🙋'
        },
        {
          id: 4,
          title: '篇章四',
          subtitle: '社交与礼仪',
          status: 'locked',
          routeName: null,
          description: '学习基本社交场合的手语表达，包括问候、介绍等。',
          icon: '🤝'
        },
        {
          id: 6,
          title: '篇章六',
          subtitle: '职业技能',
          status: 'locked',
          routeName: null,
          description: '学习职场相关的手语表达，提升职业沟通能力。',
          icon: '💼'
        },
        {
          id: 7,
          title: '篇章七',
          subtitle: '外出购物',
          status: 'locked',
          routeName: null,
          description: '掌握购物相关的手语词汇，轻松应对各种购物场景。',
          icon: '🛍️'
        }
      ]
    }
  },
  computed: {
    isLessonSaved() {
      return localStorage.getItem('lessonSavedToBag') === 'true'
    },
    isGrammarBagSaved() {
       return localStorage.getItem('grammarBagSaved') === 'true'
     },
    progressDashOffset() {
      const circumference = 2 * Math.PI * 52
      return circumference * (1 - this.progressPercent / 100)
    }
  },
  mounted() {
    this.loadProgress()
    window.addEventListener('challenge-progress-changed', this.loadProgress)
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('challenge-progress-changed', this.loadProgress)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },
    getPinStyle(index) {
      const isMobile = this.windowWidth < 768;
      
      const desktopPositions = [
        { top: '14.5%', left: '38%' },   // 篇章一：数字与日历
        { top: '55%', left: '59.5%' },   // 篇章二：我的新家
        { top: '29%', left: '60%' },     // 篇章三：公共出行
        { top: '43.5%', left: '44.5%' }, // 篇章五：志愿服务
        { top: '45.5%', left: '75.5%' }, // 篇章四：社交与礼仪
        { top: '69%', left: '38.5%' },   // 篇章六：职业技能
        { top: '60.5%', left: '83%' }    // 篇章七：外出购物
      ];

      // 移动端由于宽度变窄（高度为500px左右），按比例重新计算热区，并往中间靠拢
      const mobilePositions = [
        { top: '10%', left: '40%' },   // 篇章一：数字与日历
        { top: '65%', left: '45%' },   // 篇章二：我的新家
        { top: '25%', left: '65%' },   // 篇章三：公共出行
        { top: '40%', left: '35%' },   // 篇章五：志愿服务
        { top: '50%', left: '70%' },   // 篇章四：社交与礼仪
        { top: '78%', left: '25%' },   // 篇章六：职业技能
        { top: '85%', left: '75%' }    // 篇章七：外出购物
      ];

      const positions = isMobile ? mobilePositions : desktopPositions;
      return positions[index] || { top: '50%', left: '50%' };
    },
    loadProgress() {
      // 初始设置为完成第一关，以便测试第二关解锁
      const storedCompleted = Number(localStorage.getItem('challengeCompletedLevels') || 1)
      this.completedLevels = Math.min(storedCompleted, this.totalLevels)
      this.progressPercent = Math.round((this.completedLevels / this.totalLevels) * 100)
      this.updateLevelStatuses()
    },
    updateLevelStatuses() {
      this.levels = this.levels.map((level, index) => {
        if (index < this.completedLevels) {
          return { ...level, status: 'completed' }
        }
        if (index === this.completedLevels) {
          return { ...level, status: 'available' }
        }
        return { ...level, status: 'locked' }
      })
    },
    handleNodeClick(level) {
      if (level.status === 'locked') {
        // 添加晃动效果
        const node = document.querySelector(`.map-node[data-level-id="${level.id}"]`)
        if (node) {
          node.classList.add('shake-animation')
          setTimeout(() => {
            node.classList.remove('shake-animation')
          }, 500)
        }
        this.$message({
          message: '完成上一章节后即可解锁这一关卡哦！',
          type: 'warning'
        })
        return
      }
      
      // 显示章节详情对话框
      this.selectedLevel = level
      this.levelDialogVisible = true
    },
    startLevel(level) {
      if (level.routeName) {
        this.levelDialogVisible = false
        this.$router.push({ name: level.routeName })
      } else {
        this.$message({
          message: '该章节内容即将上线，敬请期待！',
          type: 'info'
        })
      }
    },
    closeLevelDialog() {
      this.levelDialogVisible = false
      this.selectedLevel = null
    },
    showBagDialog() {
      this.bagDialogVisible = true
    },
    closeBagDialog() {
      this.bagDialogVisible = false
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

.challenge-banner {
  background: linear-gradient(135deg, #8a2be2 0%, #9370db 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(138, 43, 226, 0.2);
  position: relative;
  overflow: hidden;
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.banner-icon {
  width: 60px;
  height: 60px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-description {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.4;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.banner-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.bag-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  width: 100%;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  width: 100%;
}

/* 桌面端样式 */
@media (min-width: 768px) {
  .challenge-banner {
    padding: 25px 40px;
  }
  
  .banner-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .banner-buttons {
    flex-direction: row;
    width: auto;
  }
  
  .bag-button,
  .back-button {
    width: auto;
  }
}

.banner-hand-illustration {
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  opacity: 0.5;
  filter: blur(0.8px);
}

.progress-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 20px 50px rgba(59, 130, 246, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(96, 165, 250, 0.18);
}
.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}
.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.progress-ring__background {
  fill: none;
  stroke: rgba(148, 163, 184, 0.25);
  stroke-width: 10;
}
.progress-ring__value {
  fill: none;
  stroke: url(#progressGradient);
  stroke-linecap: round;
  stroke-width: 10;
  stroke-dasharray: 327;
  transition: stroke-dashoffset 0.6s ease;
  stroke: #6366f1;
}
.progress-ring__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #4338ca;
}

.map-section {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(129, 140, 248, 0.18);
  overflow: hidden;
  position: relative;
}
.map-section__header {
  padding: 28px 32px 12px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
}

.back-button__icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.back-button__text {
  white-space: nowrap;
}

.bag-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.bag-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.bag-icon {
  font-size: 18px;
}

.bag-text {
  white-space: nowrap;
}

/* 复习按钮样式 */
.review-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.review-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 172, 254, 0.4);
}

.review-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.map-container {
  position: relative;
  min-height: 80vh;
  height: 80vh;
  overflow: auto;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  transition: all 0.3s ease;
}

/* 背景图层 */
.map-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../assets/sign-town-background.svg');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* 地图内容容器 */
.map-content {
  position: relative;
  min-height: 1600px;
  height: auto;
  z-index: 1;
  padding: 20px 0;
}

/* 主路径 - 街道星光效果 */
.main-path {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.path-path {
  position: absolute;
  width: 24px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.8) 100%);
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.15);
  z-index: 2;
  height: 1500px;
  top: 300px;
  left: 50%;
  transform: translateX(-50%);
}

/* 路径上的星光效果 */
.path-path::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 10px;
}

/* 背景装饰 */
.map-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration {
  position: absolute;
  opacity: 0.6;
}

/* 手绘风格装饰 */
.decoration-cloud-1 {
  top: 100px;
  left: 100px;
  width: 120px;
  height: 60px;
  background: #ffffff;
  border-radius: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-cloud-1::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 10px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-cloud-1::after {
  content: '';
  position: absolute;
  top: -25px;
  right: 15px;
  width: 50px;
  height: 50px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-cloud-2 {
  top: 150px;
  right: 100px;
  width: 100px;
  height: 50px;
  background: #ffffff;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-cloud-2::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 10px;
  width: 35px;
  height: 35px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-cloud-2::after {
  content: '';
  position: absolute;
  top: -20px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.decoration-star-1 {
  top: 200px;
  left: 200px;
  width: 12px;
  height: 12px;
  background: #ffd700;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 3s infinite;
}

.decoration-star-2 {
  top: 250px;
  right: 200px;
  width: 10px;
  height: 10px;
  background: #ffd700;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 4s infinite;
}

.decoration-light-1 {
  top: 400px;
  left: 300px;
  width: 8px;
  height: 8px;
  background: #8a2be2;
  border-radius: 50%;
  animation: float 4s infinite;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
}

.decoration-light-2 {
  top: 500px;
  right: 300px;
  width: 6px;
  height: 6px;
  background: #8a2be2;
  border-radius: 50%;
  animation: float 5s infinite;
  box-shadow: 0 0 8px rgba(138, 43, 226, 0.6);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
}

/* 聚光灯效果 */
.spotlight {
  position: absolute;
  top: 300px;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0) 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: spotlight-pulse 3s infinite;
  z-index: 0;
}

@keyframes spotlight-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.map-scroll-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

.map-path {
  position: absolute;
  inset: 0;
}
.map-path__line {
  position: absolute;
  top: 300px;
  height: 1500px;
  left: 50%;
  width: 4px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(129, 140, 248, 0.4), rgba(129, 140, 248, 0));
  z-index: 1;
}

.map-path__line__progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  z-index: 2;
  transition: height 1.5s ease-in-out;
  height: 0%;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.map-path__gradient-mask {
  position: absolute;
  bottom: -100px;
  left: 0;
  right: 0;
  height: 220px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0));
}

.map-node {
  position: absolute;
  width: 280px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  user-select: none;
  z-index: 10;
}

.map-node:hover:not(.status-locked) {
  transform: translateY(-8px) scale(1.05);
}

.map-node.status-locked:hover {
  animation: shake 0.5s ease-in-out;
}

.map-node.is-current .map-node__circle {
  animation: pulse 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(-2deg); }
  75% { transform: translateX(-50%) rotate(2deg); }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 25px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

/* 节点底座 */
.map-node__base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: -1;
}

/* 当前节点底座 */
.map-node.is-current .map-node__base {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
  animation: base-glow 2s infinite;
}

@keyframes base-glow {
  0%, 100% {
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
  }
  50% {
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  }
}

/* 锁定节点底座 */
.map-node.status-locked .map-node__base {
  background: rgba(248, 250, 252, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 完成节点底座 */
.map-node.status-completed .map-node__base {
  background: rgba(240, 253, 244, 0.9);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
}

/* 发光地标设计 */
.map-node__circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #ffffff;
  margin: 0 auto 20px;
  border: 4px solid #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
  color: #4338ca;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

/* 当前节点 - 发光地标 */
.map-node.is-current .map-node__circle {
  width: 100px;
  height: 100px;
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
  animation: crystal-pulse 2s infinite;
  color: #4338ca;
}

@keyframes crystal-pulse {
  0%, 100% {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
  }
  50% {
    box-shadow: 0 0 35px rgba(99, 102, 241, 1);
  }
}

/* 锁定状态 */
.map-node.status-locked .map-node__circle {
  border-color: #e2e8f0;
  color: #94a3b8;
  background: #f8fafc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0.7;
  filter: grayscale(100%);
}

/* 完成状态 */
.map-node.status-completed .map-node__circle {
  border-color: #10b981;
  color: #059669;
  background: #ffffff;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  animation: node-glow 2s infinite;
}

@keyframes node-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
  }
}

.map-node__icon {
  font-size: 32px;
}

.map-node__check {
  font-size: 28px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #10b981;
}

.map-node__lock {
  font-size: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
}

/* 节点标签 */
.map-node__label {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #1e293b;
  transition: all 0.3s ease;
  border: 2px solid #e0e7ff;
}

/* 节点标题容器 */
.node-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.node-icon {
  font-size: 20px;
  opacity: 0.9;
}

.node-title-content {
  text-align: center;
}

.map-node__label strong {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
  line-height: 1.2;
}

.map-node__label span {
  font-size: 1rem;
  color: #64748b;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
  line-height: 1.3;
}

/* 锁定状态标签 */
.map-node.status-locked .map-node__label {
  color: #94a3b8;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border-color: #e2e8f0;
}

.map-node.status-locked .map-node__label strong {
  color: #64748b;
}

.map-node.status-locked .map-node__label span {
  color: #94a3b8;
}

/* 完成状态标签 */
.map-node.status-completed .map-node__label {
  color: #047857;
  box-shadow: 0 10px 24px rgba(16, 185, 129, 0.15);
  border-color: #d1fae5;
}

.map-node.status-completed .map-node__label strong {
  color: #065f46;
}

.map-node.status-completed .map-node__label span {
  color: #059669;
}

/* 节点工具提示 */
.map-node__tooltip {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  white-space: nowrap;
  margin-left: 20px;
  z-index: 20;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e7ff;
}

.map-node__tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(255, 255, 255, 0.95);
}

/* 完成状态标记 */
.map-node.status-completed .map-node__circle::after {
  content: '✓';
  position: absolute;
  top: -12px;
  right: -12px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: pop-in 0.3s ease;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 开始按钮 - 手绘风格 */
.start-button {
  margin-top: 16px;
  border-radius: 28px;
  font-size: 15px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  margin-right: auto;
  cursor: pointer;
  min-width: 140px;
}

.start-button .start-icon,
.start-button .start-text {
  color: white !important;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.start-button:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.start-button::before {
  content: '▶';
  font-size: 14px;
  font-weight: bold;
}

.map-overlay-top,
.map-overlay-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 2;
}

/* 章节详情对话框样式 */
.level-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 90%;
  max-width: 500px;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.level-dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.level-dialog-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.level-dialog-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.level-dialog-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.level-dialog-achievements {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
}

.level-dialog-achievements h4 {
  margin-top: 0;
  color: #333;
  font-size: 1rem;
}

.level-dialog-stars {
  color: #FFD700;
  font-size: 1.2rem;
  margin-top: 10px;
}

.level-dialog-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.level-dialog-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.level-dialog-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.level-dialog-button.secondary {
  background: #f0f0f0;
  color: #333;
}

.level-dialog-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 章节详情对话框美化 */
.level-dialog {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
  animation: dialog-slide-in 0.3s ease-out;
}

@keyframes dialog-slide-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.level-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 24px 32px;
  background: linear-gradient(135deg, #8a2be2 0%, #9370db 100%);
  color: white;
  border-bottom: none;
}

.level-dialog__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-dialog__icon {
  font-size: 28px;
  animation: pulse 2s infinite;
}

.level-dialog__title h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.level-dialog__close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.level-dialog__close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.level-dialog__body {
  padding: 32px;
  background: #f8f9ff;
}

.level-dialog__description {
  font-size: 16px;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 24px;
  text-align: center;
}

.level-dialog__achievement {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  animation: bounce 0.5s ease;
}

.achievement-icon {
  font-size: 20px;
}

.level-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 32px;
  background: #f8f9ff;
  border-top: 1px solid #e2e8f0;
}

.level-dialog__footer .el-button {
  border-radius: 25px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.level-dialog__footer .el-button:first-child {
  background: #f0f0f0;
  color: #333;
  border: none;
}

.level-dialog__footer .el-button:first-child:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level-dialog__footer .el-button--primary {
  background: linear-gradient(135deg, #8a2be2 0%, #9370db 100%);
  border: none;
  color: white !important;
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);
}

.level-dialog__footer .el-button--primary:hover {
  background: linear-gradient(135deg, #9370db 0%, #8a2be2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(138, 43, 226, 0.4);
}

.level-dialog__footer .el-button:disabled {
  background: #e0e0e0;
  color: #909090;
  box-shadow: none;
}

.level-dialog__footer .el-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 锦囊对话框样式 */
.bag-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.bag-dialog__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4338ca;
}

.bag-dialog__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.bag-dialog__close:hover {
  color: #475569;
}

.bag-dialog__body {
  padding: 20px 0;
}

.bag-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bag-item {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.bag-item__table-container {
  overflow-x: auto;
  margin: 12px 0;
}

.bag-item__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.bag-item__table th,
.bag-item__table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.bag-item__table th {
  background-color: rgba(102, 126, 234, 0.1);
  font-weight: 600;
  color: #4338ca;
}

.bag-item__table tr:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

.bag-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.bag-item__header {
  margin-bottom: 16px;
}

.bag-item__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4338ca;
  margin-bottom: 4px;
}

.bag-item__source {
  font-size: 0.875rem;
  color: #94a3b8;
}

.bag-item__content {
  line-height: 1.6;
  color: #475569;
}

.bag-item__text {
  margin-bottom: 16px;
}

.bag-item__section {
  margin-bottom: 16px;
}

.bag-item__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4338ca;
  margin-bottom: 8px;
}

.bag-item__section-content {
  font-size: 0.875rem;
  color: #64748b;
}

.bag-empty {
  text-align: center;
  padding: 40px 0;
}

.bag-empty__icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.bag-empty__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.bag-empty__text {
  font-size: 0.875rem;
  color: #94a3b8;
  max-width: 80%;
  margin: 0 auto;
}

.bag-dialog__footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.map-overlay-top {
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.map-overlay-bottom {
  bottom: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(10px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .challenge-banner {
    padding: 28px;
  }
  
  .banner-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  
  .map-section__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .map-section__header > div {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .back-button {
    align-self: flex-start;
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .map-node {
    left: 50% !important;
    transform: translateX(-50%);
  }
  
  .map-node:hover:not(.status-locked) {
    transform: translateX(-50%) translateY(-6px) scale(1.05);
  }
  
  .map-node.status-locked:hover {
    transform: translateX(-50%) rotate(0deg);
  }
  
  .map-node__tooltip {
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    margin-left: 0;
    margin-top: 16px;
  }
  
  .map-node__tooltip::before {
    top: -12px;
    right: 50%;
    transform: translateX(50%);
    border-right-color: transparent;
    border-bottom-color: rgba(0, 0, 0, 0.8);
  }
  
  .level-dialog-buttons {
    flex-direction: column;
  }
  
  .button-container {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    justify-content: center;
    margin-top: 20px;
  }
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .map-node:hover {
    transform: translateX(-50%);
  }
  
  .map-node:hover:not(.status-locked) {
    transform: translateX(-50%);
  }
  
  .map-node:hover .map-node__halo {
    opacity: 0;
  }
  
  .map-node:hover .map-node__label span {
    opacity: 0;
    transform: translateY(10px);
  }
  
  .bag-item:hover {
    transform: none;
    box-shadow: none;
    animation: none;
  }
}
</style>

