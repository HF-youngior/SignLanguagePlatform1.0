<template>
  <div class="min-h-screen animated-gradient">
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link
              to="/"
              class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300"
            >
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
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
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section class="challenge-banner fade-in">
          <div class="flex items-center gap-5">
            <div class="banner-icon">🌟</div>
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">闯关模式</h1>
              <p class="text-lg text-white/85">循序渐进，逐章点亮手语旅程，让学习像冒险闯关一样充满期待。</p>
            </div>
          </div>
          <div class="banner-hand-illustration" aria-hidden="true"></div>
        </section>



        <section class="map-section fade-in">
          <div class="map-section__header">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-semibold text-slate-900">章节地图</h2>
                <p class="text-slate-600 text-sm">沿着路径前进，点亮篇章，更多故事正等待你解锁。</p>
              </div>
              <div class="flex items-center space-x-4">
                <button @click="showBagDialog" class="bag-button">
                  <span class="bag-icon">💼</span>
                  <span class="bag-text">我的锦囊</span>
                </button>
                <router-link to="/learn" class="back-button">
                  <span class="back-button__icon">←</span>
                  <span class="back-button__text">返回学习模式</span>
                </router-link>
              </div>
            </div>
          </div>

          <div class="map-container">
            <div class="map-path">
              <div
                v-for="(level, index) in levels"
                :key="level.id"
                class="map-node"
                :class="[`status-${level.status}`, { 'is-first': index === 0 }]"
                :style="{ top: `${index * 280}px`, left: '50%', transform: 'translateX(-50%)' }"
                @mouseenter="hoveredLevel = level.id"
                @mouseleave="hoveredLevel = null"
                @click="handleNodeClick(level)"
              >
                <div class="map-node__halo"></div>
                <div class="map-node__circle" :class="{ 'calendar-shape': index === 0, 'house-shape': index === 1 }">
                  <span v-if="level.status === 'locked' && index === 1" class="map-node__lock">🔒</span>
                  <span v-else-if="level.status === 'completed'" class="map-node__check">✨</span>
                  <span v-else-if="index === 0" class="map-node__icon calendar-icon">📅</span>
                  <span v-else-if="index === 1" class="map-node__icon house-icon">🏠</span>
                </div>
                <transition name="fade">
                  <div v-if="hoveredLevel === level.id" class="map-node__label">
                    <strong>{{ level.title }}</strong>
                    <span>{{ level.subtitle }}</span>
                    <el-button
                      v-if="level.status !== 'locked'"
                      size="small"
                      type="primary"
                      plain
                      @click.stop="handleNodeClick(level)"
                      class="start-button"
                    >
                      {{ level.status === 'completed' ? '回顾' : '开始' }}
                    </el-button>
                  </div>
                </transition>
                <transition name="tooltip">
                  <div v-if="hoveredLevel === level.id" class="map-node__tooltip">
                    <span v-if="index === 0">篇章一：数字与日历 学习主题：认识数字和日历</span>
                    <span v-else-if="level.status === 'locked'">篇章二：我的新家 解锁条件：完成篇章一（数字与日历）</span>
                    <span v-else>篇章二：我的新家 学习主题：认识日常物品</span>
                  </div>
                </transition>
              </div>

              <div class="map-path__line"></div>
              <div class="map-path__gradient-mask" aria-hidden="true"></div>
            </div>
            <div class="map-overlay-top" aria-hidden="true"></div>
            <div class="map-overlay-bottom" aria-hidden="true"></div>
          </div>
        </section>

        <!-- 锦囊对话框 -->
        <el-dialog
          v-model="bagDialogVisible"
          width="600px"
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
      totalLevels: 2,
      completedLevels: 0,
      progressPercent: 0,
      hoveredLevel: null,
      bagDialogVisible: false,
      levels: [
        {
          id: 1,
          title: '篇章一',
          subtitle: '数字与日历',
          status: 'available',
          routeName: 'ChallengeLevelCalendar'
        },
        {
          id: 2,
          title: '篇章二',
          subtitle: '我的新家',
          status: 'locked',
          routeName: 'HomeMap'
        }
      ]
    }
  },
  computed: {
    isLessonSaved() {
      return localStorage.getItem('lessonSavedToBag') === 'true'
    },
    progressDashOffset() {
      const circumference = 2 * Math.PI * 52
      return circumference * (1 - this.progressPercent / 100)
    }
  },
  mounted() {
    this.loadProgress()
    window.addEventListener('challenge-progress-changed', this.loadProgress)
  },
  beforeUnmount() {
    window.removeEventListener('challenge-progress-changed', this.loadProgress)
  },
  methods: {
    loadProgress() {
      const storedCompleted = Number(localStorage.getItem('challengeCompletedLevels') || 0)
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
        this.$message({
          message: '完成上一章节后即可解锁这一关卡哦！',
          type: 'warning'
        })
        return
      }
      if (level.routeName) {
        this.$router.push({ name: level.routeName })
      } else {
        this.$message({
          message: '该章节内容即将上线，敬请期待！',
          type: 'info'
        })
      }
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
  position: relative;
  padding: 36px 40px;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 40%, #c026d3 100%);
  border-radius: 28px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 32px 70px rgba(79, 70, 229, 0.2);
}
.banner-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.25);
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

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
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

  /* 锦囊按钮样式 */
  .bag-button {
    display: flex;
    align-items: center;
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

.map-container {
  position: relative;
  height: 800px;
  overflow: hidden;
  padding: 20px 0;
}
.map-path {
  position: absolute;
  inset: 0;
}
.map-path__line {
  position: absolute;
  top: 60px;
  bottom: -120px;
  left: 50%;
  width: 4px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(129, 140, 248, 0.4), rgba(129, 140, 248, 0));
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
  width: 180px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.map-node:hover:not(.status-locked) {
  transform: translateY(-6px) scale(1.05);
}
.map-node.status-locked:hover {
  animation: shake 0.5s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(-2deg); }
  75% { transform: translateX(-50%) rotate(2deg); }
}
.map-node__halo {
  position: absolute;
  inset: 12px -12px -12px;
  border-radius: 30px;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.16), rgba(129, 140, 248, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.map-node:hover .map-node__halo {
  opacity: 1;
}
.map-node__circle {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: #ffffff;
  margin: 0 auto;
  border: 4px solid rgba(129, 140, 248, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 22px;
  color: #4338ca;
  box-shadow: 0 12px 30px rgba(129, 140, 248, 0.18);
  position: relative;
  transition: all 0.3s ease;
}
.map-node__circle.calendar-shape {
  background: linear-gradient(135deg, #7c3aed, #c026d3);
  border-color: #7c3aed;
  color: white;
}
.map-node__circle.house-shape {
  background: #ffffff;
  border-color: rgba(129, 140, 248, 0.35);
  color: #4338ca;
}
.map-node__icon {
  font-size: 32px;
}
.map-node__check {
  font-size: 28px;
}
.map-node__lock {
  font-size: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.map-node__label {
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.16);
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4338ca;
  transition: all 0.3s ease;
}
.map-node__label strong {
  font-size: 1rem;
}
.map-node__label span {
  font-size: 0.85rem;
  color: #4c1d95;
}
.map-node__tooltip {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
  margin-left: 16px;
  z-index: 10;
}
.map-node__tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
}
.map-node.status-locked .map-node__circle {
  border-color: rgba(148, 163, 184, 0.4);
  color: rgba(148, 163, 184, 0.8);
  background: rgba(248, 250, 252, 0.92);
  box-shadow: none;
  opacity: 0.7;
}
.map-node.status-locked .map-node__label {
  color: rgba(148, 163, 184, 0.8);
  box-shadow: none;
}
.map-node.status-completed .map-node__circle {
  border-color: rgba(16, 185, 129, 0.4);
  color: #059669;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0));
}
.map-node.status-completed .map-node__label {
  color: #047857;
}
.start-button {
  margin-top: 8px;
  transition: all 0.3s ease;
}
.start-button:hover {
  background-color: #6366f1;
  color: white;
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

.bag-item {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
}
</style>

