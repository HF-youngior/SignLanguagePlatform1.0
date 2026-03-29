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
        <div class="text-center mb-8 fade-in">
          <h1 class="text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down font-sans tracking-wide">
            指尖学堂开课啦！
          </h1>
        </div>

        <!-- 学习模式选择 - 移到顶部 -->
        <div class="mb-16 fade-in">
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
              <div class="grid gap-8 md:grid-cols-2">
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
              
              <!-- 移动端纵向滑动视频流 -->
              <div class="video-stream-mobile">
                <div
                  v-for="(video, index) in videos"
                  :key="index"
                  class="video-card-mobile"
                >
                  <div class="video-card-mobile__thumbnail">
                    <img :src="video.thumbnail" :alt="video.title" />
                    <div class="video-card-mobile__play-icon">▶️</div>
                  </div>
                  <div class="video-card-mobile__info">
                    <h4 class="video-card-mobile__title">{{ video.title }}</h4>
                    <p class="video-card-mobile__author">{{ video.author }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
::deep(.el-card__body) {
  padding: 20px !important;
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
::deep(.el-button:active) {
  transform: translateY(0) !important;
}
::deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}
::deep(.el-button--info) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
}
::deep(.el-button--success) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
}

::deep(.el-tag) {
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-weight: 500 !important;
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

.town-section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 28px 28px 0 0;
}

.town-section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  position: relative;
}

.town-section-card__header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.town-section-card__heading {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.town-section-card__subheading {
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6px;
  font-size: 1.1rem;
}

.town-section-card__body {
  padding: 40px 32px 32px;
  background: #ffffff;
}

::deep(.town-section-card__tag) {
  border-radius: 9999px !important;
  padding: 8px 20px !important;
  font-weight: 600 !important;
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 冒险卡片样式 */
.adventure-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  background: #ffffff;
  border-radius: 24px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.adventure-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color, #f97316);
  border-radius: 24px 24px 0 0;
}

.adventure-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 28px 60px rgba(59, 130, 246, 0.2);
  border-color: var(--accent-color, #f97316);
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
  box-shadow: inset 0 0 16px rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.9);
  color: var(--accent-color, #f59e0b);
  transition: all 0.3s ease;
}

.adventure-card:hover .adventure-card__icon {
  transform: scale(1.05) rotate(5deg);
}

.adventure-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.adventure-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.adventure-card__title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.adventure-card__badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--accent-light, rgba(99, 102, 241, 0.16));
  color: var(--accent-color, #6366f1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}



.adventure-card__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.adventure-card__progress {
  width: 100%;
  height: 12px;
  border-radius: 9999px;
  background: rgba(226, 232, 240, 0.9);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.adventure-card__progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--accent-light, rgba(99, 102, 241, 0.2)), var(--accent-color, #6366f1));
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
}

.adventure-card__progress-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  z-index: 1;
}

.adventure-card__progress-text {
  font-size: 0.85rem;
  color: var(--accent-color, #6366f1);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: right;
}

.adventure-card__actions {
  display: flex;
  justify-content: flex-end;
}

.adventure-card__actions :deep(.el-button) {
  border-radius: 9999px !important;
  padding: 12px 28px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  font-size: 1rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
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

/* 桌面端横向视频流 */
.video-stream-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.video-stream-container::-webkit-scrollbar {
  display: none;
}

.video-card {
  flex: 0 0 320px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.15);
}

.video-card__thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.video-card__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.video-card:hover .video-card__thumbnail img {
  transform: scale(1.05);
}

.video-card__play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.video-card:hover .video-card__play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-card__info {
  padding: 16px;
}

.video-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.video-card__author {
  font-size: 0.85rem;
  color: #6b7280;
}

/* 移动端纵向视频流 */
.video-card-mobile {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card-mobile:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.15);
}

.video-card-mobile__thumbnail {
  position: relative;
  aspect-ratio: 9 / 16;
  overflow: hidden;
}

.video-card-mobile__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.video-card-mobile:hover .video-card-mobile__thumbnail img {
  transform: scale(1.05);
}

.video-card-mobile__play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.video-card-mobile:hover .video-card-mobile__play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-card-mobile__info {
  padding: 16px;
}

.video-card-mobile__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.video-card-mobile__author {
  font-size: 0.9rem;
  color: #6b7280;
}

::deep(.el-progress__text) {
  color: #374151 !important;
  font-weight: 600 !important;
}
</style>