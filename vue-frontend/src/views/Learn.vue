<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg md:block hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
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

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-8 fade-in md:block hidden">
          <h1 class="text-4xl md:text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down font-sans tracking-wide">
            指尖学堂开课啦！
          </h1>
        </div>

        <!-- 学习模式选择 - 移到顶部 -->
        <div class="mb-8 fade-in">
          <div class="town-section-card">
            <div class="town-section-card__header">
              <div class="town-section-card__title">
                  <span class="town-section-card__icon">🏰</span>
                  <div>
                    <h2 class="town-section-card__heading">走进小镇学手语</h2>
                  </div>
                </div>
            </div>
            <div class="town-section-card__body">
              <!-- 电脑端布局 -->
              <div class="hidden md:grid gap-8 md:grid-cols-2">
                <div
                  v-for="mode in learningModes"
                  :key="mode.key"
                  class="adventure-card"
                  :style="{
                    '--accent-color': mode.accent,
                    '--accent-light': mode.accentLight
                  }"
                  @click="goToMode(mode)"
                >
                  <div class="adventure-card__header">
                    <div class="adventure-card__icon" :style="{ background: mode.iconBg }">{{ mode.icon }}</div>
                    <div class="adventure-card__info">
                      <div class="adventure-card__title">
                        <h3>{{ mode.title }}</h3>
                        <span class="adventure-card__badge">{{ mode.badge }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="adventure-card__footer">
                    <div class="adventure-card__progress">
                      <div class="adventure-card__progress-bar" :style="{ width: mode.progress + '%' }"></div>
                      <div class="adventure-card__progress-icon">🎯</div>
                    </div>
                    <div class="adventure-card__progress-text">已完成 {{ mode.progress }}%</div>
                    <div class="adventure-card__actions">
                      <el-button
                        :type="mode.buttonType"
                        :plain="mode.isDeveloping"
                        size="large"
                        @click="handleModeClick(mode)"
                      >
                        {{ mode.actionLabel }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 手机端布局 -->
              <div class="grid grid-cols-1 gap-4 md:hidden">
                <div
                  v-for="mode in learningModes"
                  :key="mode.key"
                  class="adventure-card-sm"
                  :style="{
                    '--accent-color': mode.accent,
                    '--accent-light': mode.accentLight
                  }"
                  @click="goToMode(mode)"
                >
                  <div class="adventure-card-sm__header">
                    <div class="adventure-card-sm__info">
                      <div class="adventure-card-sm__title">
                        <h3 class="mode-title-text">{{ mode.title }}</h3>
                        <span class="adventure-card-sm__badge">{{ mode.badge }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="adventure-card-sm__footer">
                    <div class="adventure-card-sm__progress-container">
                      <div class="adventure-card-sm__progress-text">已完成 {{ mode.progress }}%</div>
                      <div class="adventure-card-sm__progress">
                        <div class="adventure-card-sm__progress-bar" :style="{ width: mode.progress + '%' }"></div>
                      </div>
                    </div>
                    <el-button
                      :type="mode.buttonType"
                      :plain="mode.isDeveloping"
                      size="small"
                      @click="handleModeClick(mode)"
                    >
                      {{ mode.actionLabel }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频流板块 - 移到底部 -->
        <div class="mb-12 fade-in">
          <div class="town-section-card">
            <div class="town-section-card__header">
              <div class="town-section-card__title">
                  <span class="town-section-card__icon">🎬</span>
                  <div>
                    <h2 class="town-section-card__heading">轻松一刻</h2>
                  </div>
                </div>
              <el-tag class="town-section-card__tag" type="success" effect="dark">持续更新</el-tag>
            </div>
            <div class="town-section-card__body">
              <!-- 电脑端横向滑动视频流 -->
              <div class="video-stream-desktop">
                <div class="video-stream-container">
                  <div
                    v-for="(video, index) in videos"
                    :key="index"
                    class="video-card"
                  >
                    <div class="video-card__thumbnail">
                      <img :src="video.thumbnail" :alt="video.title" />
                      <div class="video-card__play-icon">▶️</div>
                    </div>
                    <div class="video-card__info">
                      <h4 class="video-card__title">{{ video.title }}</h4>
                      <p class="video-card__author">{{ video.author }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 移动端抖音风格视频流 -->
              <div class="video-stream-mobile">
                <div class="tiktok-frame">
                  <div class="tiktok-container">
                    <div
                      v-for="(video, index) in videos"
                      :key="index"
                      class="tiktok-item"
                    >
                      <div class="tiktok-thumbnail">
                        <img :src="video.thumbnail" :alt="video.title" />
                        <div class="tiktok-play-icon">▶️</div>
                      </div>
                      <div class="tiktok-info">
                        <h4 class="tiktok-title">{{ video.title }}</h4>
                        <p class="tiktok-author">@{{ video.author }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 移动端底部导航栏 -->
    <div class="mobile-bottom-nav">
      <router-link to="/learn" class="mobile-nav-item active">
        <span class="mobile-nav-icon">📚</span>
        <span class="mobile-nav-text">学堂</span>
      </router-link>
      <router-link to="/translate" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔤</span>
        <span class="mobile-nav-text">译站</span>
      </router-link>
      <router-link to="/community" class="mobile-nav-item">
        <span class="mobile-nav-icon">💬</span>
        <span class="mobile-nav-text">手语圈</span>
      </router-link>
    </div>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 掌中语-手语小镇. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Learn',
  data() {
    return {
      learningModes: [
        {
          key: 'challenge',
          title: '闯关模式',
          badge: '升级打怪',
          icon: '🚀',
          iconBg: 'linear-gradient(135deg, #fff1d6 0%, #ffe4b5 100%)',
          accent: '#f97316',
          accentLight: 'rgba(249, 115, 22, 0.18)',
          progress: 0,
          actionLabel: '开始闯关',
          buttonType: 'primary',
          isDeveloping: false,
          route: { name: 'ChallengeMode' }
        },
        {
          key: 'thematic',
          title: '专题模式',
          badge: '沉浸探索',
          icon: '🎯',
          iconBg: 'linear-gradient(135deg, #ffe8d6 0%, #ffd6a5 100%)',
          accent: '#f59e0b',
          accentLight: 'rgba(245, 158, 11, 0.18)',
          progress: 0,
          actionLabel: '开始探索',
          buttonType: 'warning',
          isDeveloping: true,
          route: { name: 'Learn', query: { mode: 'thematic' } }
        }
      ],
      videos: [
        {
          title: '日常手语对话基础',
          author: '手语达人',
          thumbnail: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sign%20language%20daily%20conversation%20teaching&size=1024x768'
        },
        {
          title: '手语故事：小兔子的一天',
          author: '手语故事汇',
          thumbnail: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sign%20language%20story%20about%20rabbit&size=1024x768'
        },
        {
          title: '职场手语常用表达',
          author: '职场手语指南',
          thumbnail: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sign%20language%20for%20workplace&size=1024x768'
        },
        {
          title: '手语文化小知识',
          author: '手语文化探索',
          thumbnail: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sign%20language%20culture%20knowledge&size=1024x768'
        },
        {
          title: '手语歌曲表演',
          author: '手语艺术团',
          thumbnail: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sign%20language%20song%20performance&size=1024x768'
        }
      ]
    }
  },
  methods: {
    goToMode(mode) {
      if (mode.route) {
        this.$router.push(mode.route)
      }
    },
    handleModeClick(mode) {
      if (mode.isDeveloping) {
        this.$message({
          message: '专题模式正在开发中，敬请期待！',
          type: 'info'
        })
        return
      }
      this.goToMode(mode)
    },
    loadLearningProgress() {
      // 加载闯关模式进度
      const challengeCompleted = Number(localStorage.getItem('challengeCompletedLevels') || 0)
      const challengeTotal = 2 // 总关卡数
      const challengeProgress = Math.round((challengeCompleted / challengeTotal) * 100)
      
      // 加载专题模式进度
      const thematicCompleted = Number(localStorage.getItem('thematicCompletedTopics') || 0)
      const thematicTotal = 3 // 总专题数（假设）
      const thematicProgress = Math.round((thematicCompleted / thematicTotal) * 100)
      
      // 更新学习模式进度
      this.learningModes.forEach(mode => {
        if (mode.key === 'challenge') {
          mode.progress = challengeProgress
        } else if (mode.key === 'thematic') {
          mode.progress = thematicProgress
        }
      })
    }
  },
  mounted() {
    document.title = '手语小镇 - 手语教学平台'
    this.loadLearningProgress()
    // 监听进度变化事件
    window.addEventListener('challenge-progress-changed', this.loadLearningProgress)
    window.addEventListener('thematic-progress-changed', this.loadLearningProgress)
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('challenge-progress-changed', this.loadLearningProgress)
    window.removeEventListener('thematic-progress-changed', this.loadLearningProgress)
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

/* 移动端底部导航栏 */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  text-decoration: none;
  color: #6b7280;
}

.mobile-nav-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.mobile-nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.mobile-nav-text {
  font-size: 12px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}

@media (max-width: 767px) {
  main {
    padding-bottom: 70px;
  }
  footer {
    margin-bottom: 60px;
  }
}

/* 小镇风格板块卡片 */
.town-section-card {
  background: #ffffff;
  border-radius: 28px;
  border: 2px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 24px 65px rgba(79, 70, 229, 0.12);
  overflow: hidden;
  position: relative;
}

.town-section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

@media (min-width: 768px) {
  .town-section-card__header {
    padding: 16px 24px;
  }
}

.town-section-card__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.town-section-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 22px;
}

@media (min-width: 768px) {
  .town-section-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-size: 26px;
  }
}

.town-section-card__heading {
  font-size: 1.1rem;
  font-weight: 700;
}

@media (min-width: 768px) {
  .town-section-card__heading {
    font-size: 1.6rem;
  }
}

.town-section-card__body {
  padding: 20px 16px;
}

@media (min-width: 768px) {
  .town-section-card__body {
    padding: 40px 32px;
  }
}

/* 冒险卡片样式 (PC) */
.adventure-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  background: #ffffff;
  border-radius: 24px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15);
  cursor: pointer;
}

.adventure-card__header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.adventure-card__icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.adventure-card__title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.adventure-card__badge {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--accent-light);
  color: var(--accent-color);
}

/* 手机端冒险卡片样式 */
.adventure-card-sm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.adventure-card-sm__title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap; /* 强制不换行 */
}

.mode-title-text {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

.adventure-card-sm__badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-color);
  background: var(--accent-light);
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.adventure-card-sm__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.adventure-card-sm__progress-container {
  flex: 1;
}

.adventure-card-sm__progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.adventure-card-sm__progress {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.adventure-card-sm__progress-bar {
  height: 100%;
  background: var(--accent-color);
}

/* 视频流样式 */
.video-stream-desktop {
  display: block;
}

.video-stream-mobile {
  display: none;
}

@media (max-width: 768px) {
  .video-stream-desktop {
    display: none;
  }
  .video-stream-mobile {
    display: block;
  }
}

.video-stream-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.video-card {
  flex: 0 0 300px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 抖音风格容器 */
.tiktok-frame {
  width: 100%;
  height: 450px; /* 展示框固定高度 */
  background: #000;
  border-radius: 16px;
  overflow: hidden;
}

.tiktok-container {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tiktok-container::-webkit-scrollbar {
  display: none;
}

.tiktok-item {
  height: 100%;
  width: 100%;
  scroll-snap-align: start;
  position: relative;
}

.tiktok-thumbnail {
  width: 100%;
  height: 100%;
}

.tiktok-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tiktok-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: rgba(255,255,255,0.3);
}

.tiktok-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

.tiktok-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.tiktok-author {
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
