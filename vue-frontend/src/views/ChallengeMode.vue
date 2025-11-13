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
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3" />
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
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

        <section class="progress-card fade-in">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 class="text-2xl font-semibold text-slate-900 mb-2">学习进度</h2>
              <p class="text-slate-600">已点亮 {{ progressPercent }}% 的学习旅程</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="progress-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" class="progress-ring__background" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    class="progress-ring__value"
                    :style="{ strokeDashoffset: progressDashOffset }"
                  />
                </svg>
                <span class="progress-ring__text">{{ progressPercent }}%</span>
              </div>
              <div class="flex flex-col text-sm text-slate-500 leading-relaxed">
                <span>完成章节：{{ completedLevels }}/{{ totalLevels }}</span>
                <span>下一章节解锁条件：完成当前篇章</span>
              </div>
            </div>
          </div>
          <el-progress :percentage="progressPercent" :stroke-width="18" striped striped-flow color="#6366f1" />
        </section>

        <section class="map-section fade-in">
          <div class="map-section__header">
            <h2 class="text-2xl font-semibold text-slate-900">章节地图</h2>
            <p class="text-slate-600 text-sm">沿着路径前进，点亮篇章，更多故事正等待你解锁。</p>
          </div>

          <div class="map-container">
            <div class="map-path">
              <div
                v-for="(level, index) in levels"
                :key="level.id"
                class="map-node"
                :class="[`status-${level.status}`, { 'is-first': index === 0 }]"
                :style="{ top: `${index * 140}px`, left: index % 2 === 0 ? '12%' : '58%' }"
                @mouseenter="hoveredLevel = level.id"
                @mouseleave="hoveredLevel = null"
                @click="handleNodeClick(level)"
              >
                <div class="map-node__halo"></div>
                <div class="map-node__circle">
                  <span v-if="level.status === 'locked'" class="map-node__lock">🔒</span>
                  <span v-else-if="level.status === 'completed'" class="map-node__check">✨</span>
                  <span v-else class="map-node__index">{{ level.id }}</span>
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
                    >
                      {{ level.status === 'completed' ? '回顾' : '开始' }}
                    </el-button>
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
      levels: [
        {
          id: 1,
          title: '篇章一',
          subtitle: '过日子',
          status: 'available',
          routeName: 'ChallengeLevelCalendar'
        },
        {
          id: 2,
          title: '篇章二',
          subtitle: '即将开启',
          status: 'locked',
          routeName: null
        }
      ]
    }
  },
  computed: {
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

.map-container {
  position: relative;
  height: 520px;
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
  width: 160px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.map-node:hover {
  transform: translateY(-6px);
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
  width: 70px;
  height: 70px;
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
}
.map-node__index {
  transform: translateY(2px);
}
.map-node__check {
  font-size: 28px;
}
.map-node__lock {
  font-size: 22px;
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
}
.map-node__label strong {
  font-size: 1rem;
}
.map-node__label span {
  font-size: 0.85rem;
  color: #4c1d95;
}
.map-node.status-locked .map-node__circle {
  border-color: rgba(148, 163, 184, 0.4);
  color: rgba(148, 163, 184, 0.8);
  background: rgba(248, 250, 252, 0.92);
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

.map-overlay-top,
.map-overlay-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 2;
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

@media (max-width: 768px) {
  .challenge-banner {
    padding: 28px;
  }
  .banner-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  .map-node {
    left: 50% !important;
    transform: translateX(-50%);
  }
  .map-node:hover {
    transform: translate(-50%, -6px);
  }
}
</style>

