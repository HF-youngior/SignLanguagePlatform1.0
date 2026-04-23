<template>
  <div class="learn-page animated-gradient">
    <nav class="top-nav md:block hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="nav-wrap">
          <router-link to="/" class="brand-link">
            <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 rounded-full" />
            <span>掌中语</span>
          </router-link>
          <div class="nav-menu">
            <router-link to="/learn" class="nav-link nav-link--active">学堂</router-link>
            <router-link to="/translate" class="nav-link">译站</router-link>
            <router-link to="/community" class="nav-link">手语圈</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">


      <section class="town-section-card fade-in">
        <div class="town-section-card__header">
          <div class="town-section-card__title">
            <span class="town-section-card__icon">
              <el-icon><Compass /></el-icon>
            </span>
            <div>
              <h2 class="town-section-card__heading">走进小镇学手语</h2>
              <p>选择一个模式，开始今天的练习</p>
            </div>
          </div>
        </div>

        <div class="town-section-card__body">
          <div class="hidden md:grid gap-8 md:grid-cols-2">
            <article
              v-for="mode in learningModes"
              :key="mode.key"
              class="adventure-card"
              :style="{ '--accent-color': mode.accent, '--accent-light': mode.accentLight }"
              @click="goToMode(mode)"
            >
              <header class="adventure-card__header">
                <div class="adventure-card__icon" :style="{ background: mode.iconBg }">{{ mode.icon }}</div>
                <div class="adventure-card__info">
                  <div class="adventure-card__title">
                    <h3>{{ mode.title }}</h3>
                    <span class="adventure-card__badge">{{ mode.badge }}</span>
                  </div>
                </div>
              </header>

              <div class="adventure-card__footer">
                <div class="adventure-card__progress">
                  <div class="adventure-card__progress-bar" :style="{ width: mode.progress + '%' }"></div>
                  <div class="adventure-card__progress-icon">✓</div>
                </div>
                <div class="adventure-card__progress-text">完成进度：{{ mode.progress }}%</div>
                <el-button :type="mode.buttonType" :plain="mode.isDeveloping" size="large" @click="handleModeClick(mode)">
                  {{ mode.actionLabel }}
                </el-button>
              </div>
            </article>
          </div>

          <div class="grid grid-cols-1 gap-4 md:hidden">
            <article
              v-for="mode in learningModes"
              :key="mode.key"
              class="adventure-card-sm"
              :style="{ '--accent-color': mode.accent, '--accent-light': mode.accentLight }"
              @click="goToMode(mode)"
            >
              <div class="adventure-card-sm__title">
                <h3 class="mode-title-text">{{ mode.title }}</h3>
                <span class="adventure-card-sm__badge">{{ mode.badge }}</span>
              </div>
              <div class="adventure-card-sm__footer">
                <div class="adventure-card-sm__progress-container">
                  <div class="adventure-card-sm__progress-text">完成进度：{{ mode.progress }}%</div>
                  <div class="adventure-card-sm__progress">
                    <div class="adventure-card-sm__progress-bar" :style="{ width: mode.progress + '%' }"></div>
                  </div>
                </div>
                <el-button :type="mode.buttonType" :plain="mode.isDeveloping" size="small" @click="handleModeClick(mode)">
                  {{ mode.actionLabel }}
                </el-button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="town-section-card fade-in mt-6 md:mt-10">
        <div class="town-section-card__header town-section-card__header--video">
          <div class="town-section-card__title">
            <span class="town-section-card__icon">
              <el-icon><VideoPlay /></el-icon>
            </span>
            <div>
              <h2 class="town-section-card__heading">轻松一刻</h2>
              <p>看看大家如何把手语融入日常</p>
            </div>
          </div>
          <el-tag class="town-section-card__tag" type="success" effect="dark">精选推荐</el-tag>
        </div>

        <div class="town-section-card__body">
          <div class="video-stream-desktop">
            <div class="video-stream-container">
              <div v-for="(video, index) in videos" :key="index" class="video-card">
                <div class="video-card__thumbnail">
                  <img :src="video.thumbnail" :alt="video.title" />
                  <div class="video-card__play-icon">▶</div>
                </div>
                <div class="video-card__info">
                  <h4 class="video-card__title">{{ video.title }}</h4>
                  <p class="video-card__author">{{ video.author }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="video-stream-mobile">
            <div class="tiktok-frame">
              <div class="tiktok-container">
                <div v-for="(video, index) in videos" :key="index" class="tiktok-item">
                  <div class="tiktok-thumbnail">
                    <img :src="video.thumbnail" :alt="video.title" />
                    <div class="tiktok-play-icon">▶</div>
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
      </section>
    </main>

    <div class="mobile-bottom-nav">
      <router-link to="/learn" class="mobile-nav-item active">
        <el-icon class="mobile-nav-icon"><Reading /></el-icon>
        <span class="mobile-nav-text">学堂</span>
      </router-link>
      <router-link to="/translate" class="mobile-nav-item">
        <el-icon class="mobile-nav-icon"><Position /></el-icon>
        <span class="mobile-nav-text">译站</span>
      </router-link>
      <router-link to="/community" class="mobile-nav-item">
        <el-icon class="mobile-nav-icon"><ChatDotRound /></el-icon>
        <span class="mobile-nav-text">手语圈</span>
      </router-link>
    </div>

    <footer class="learn-footer">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2026 掌中语 · 让沟通更平等</p>
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
          badge: '升级打卡',
          icon: '闯',
          iconBg: 'linear-gradient(135deg, #ecebff 0%, #d9d5ff 100%)',
          accent: '#5e59ea',
          accentLight: 'rgba(94, 89, 234, 0.18)',
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
          icon: '专',
          iconBg: 'linear-gradient(135deg, #edefff 0%, #e3e7ff 100%)',
          accent: '#6a56ef',
          accentLight: 'rgba(106, 86, 239, 0.18)',
          progress: 0,
          actionLabel: '开始探索',
          buttonType: 'primary',
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
          author: '手语故事馆',
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
          message: '专题模式正在开发中，敬请期待。',
          type: 'info'
        })
        return
      }
      this.goToMode(mode)
    },
    loadLearningProgress() {
      const challengeCompleted = Number(localStorage.getItem('challengeCompletedLevels') || 0)
      const challengeTotal = 2
      const challengeProgress = Math.round((challengeCompleted / challengeTotal) * 100)

      const thematicCompleted = Number(localStorage.getItem('thematicCompletedTopics') || 0)
      const thematicTotal = 3
      const thematicProgress = Math.round((thematicCompleted / thematicTotal) * 100)

      this.learningModes.forEach((mode) => {
        if (mode.key === 'challenge') {
          mode.progress = challengeProgress
        } else if (mode.key === 'thematic') {
          mode.progress = thematicProgress
        }
      })
    }
  },
  mounted() {
    document.title = '掌中语 - 学堂'
    this.loadLearningProgress()
    window.addEventListener('challenge-progress-changed', this.loadLearningProgress)
    window.addEventListener('thematic-progress-changed', this.loadLearningProgress)
  },
  beforeUnmount() {
    window.removeEventListener('challenge-progress-changed', this.loadLearningProgress)
    window.removeEventListener('thematic-progress-changed', this.loadLearningProgress)
  }
}
</script>

<style scoped>
.learn-page {
  color: #243556;
}

.top-nav {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.76);
  border-bottom: 1px solid rgba(108, 114, 210, 0.26);
  box-shadow: 0 12px 30px rgba(76, 85, 171, 0.12);
}

.nav-wrap {
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #2f3f74;
  font-size: 1.3rem;
  font-weight: 800;
  text-decoration: none;
}

.nav-menu {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.nav-link--active {
  color: #5d54e8;
  background: rgba(230, 226, 255, 0.9);
}



.town-section-card {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 28px;
  border: 1px solid rgba(112, 118, 209, 0.22);
  box-shadow: 0 22px 54px rgba(80, 88, 172, 0.14);
  overflow: hidden;
}

.town-section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(120deg, rgba(89, 95, 232, 0.96), rgba(126, 84, 247, 0.94));
  color: #fff;
}

.town-section-card__header p {
  margin: 2px 0 0;
  opacity: 0.9;
  font-size: 0.85rem;
}

.town-section-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.town-section-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  display: grid;
  place-items: center;
  font-size: 18px;
}

.town-section-card__heading {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.town-section-card__body {
  padding: 16px;
}

.adventure-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(113, 119, 210, 0.2);
  box-shadow: 0 16px 36px rgba(82, 90, 173, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.adventure-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 42px rgba(82, 90, 173, 0.18);
}

.adventure-card__header {
  display: flex;
  gap: 16px;
  align-items: center;
}

.adventure-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 30px;
  font-weight: 800;
  color: #5955df;
}

.adventure-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adventure-card__title h3 {
  margin: 0;
  font-size: 1.3rem;
}

.adventure-card__badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--accent-color);
  background: var(--accent-light);
}

.adventure-card__progress {
  height: 10px;
  border-radius: 999px;
  background: #e3e7fb;
  position: relative;
  overflow: hidden;
}

.adventure-card__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #8f84ff);
}

.adventure-card__progress-icon {
  position: absolute;
  top: -8px;
  right: 10px;
  color: #5f5adf;
}

.adventure-card__progress-text {
  margin-top: 8px;
  margin-bottom: 14px;
  color: #5d6787;
  font-size: 0.9rem;
}

.adventure-card :deep(.el-button) {
  border: none;
  background: linear-gradient(120deg, #5a5fe8, #7656ef 74%, #9368ff);
  color: #fff;
  box-shadow: 0 10px 24px rgba(93, 88, 220, 0.3);
}

.adventure-card :deep(.el-button.is-plain) {
  background: rgba(244, 246, 255, 0.92);
  color: #5a58e0;
  border: 1px solid rgba(114, 120, 208, 0.3);
  box-shadow: none;
}

.adventure-card-sm {
  display: grid;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(112, 118, 209, 0.2);
  cursor: pointer;
}

.adventure-card-sm__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mode-title-text {
  margin: 0;
  font-size: 1rem;
}

.adventure-card-sm__badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-color);
  background: var(--accent-light);
  border-radius: 6px;
  padding: 3px 6px;
}

.adventure-card-sm__footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adventure-card-sm__progress-container {
  flex: 1;
}

.adventure-card-sm__progress-text {
  margin-bottom: 4px;
  font-size: 0.76rem;
  color: #5c6887;
}

.adventure-card-sm__progress {
  height: 6px;
  border-radius: 999px;
  background: #e3e7fb;
  overflow: hidden;
}

.adventure-card-sm__progress-bar {
  height: 100%;
  background: var(--accent-color);
}

.adventure-card-sm :deep(.el-button) {
  border: none;
  background: linear-gradient(120deg, #5a5fe8, #7656ef 74%, #9368ff);
  color: #fff;
}

.adventure-card-sm :deep(.el-button.is-plain) {
  background: rgba(244, 246, 255, 0.92);
  color: #5a58e0;
  border: 1px solid rgba(114, 120, 208, 0.3);
}

.video-stream-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
}

.video-card {
  flex: 0 0 278px;
  scroll-snap-align: start;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(112, 118, 209, 0.2);
  box-shadow: 0 12px 28px rgba(82, 90, 173, 0.12);
}

.video-card__thumbnail {
  position: relative;
  height: 170px;
}

.video-card__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card__play-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(236, 231, 255, 0.9);
  color: #5f59e4;
  font-size: 16px;
}

.video-card__info {
  padding: 12px;
}

.video-card__title {
  margin: 0;
  color: #2f3f74;
}

.video-card__author {
  margin: 6px 0 0;
  color: #61708e;
  font-size: 0.86rem;
}

.video-stream-mobile {
  display: none;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(114, 120, 208, 0.24);
  z-index: 1000;
}

.mobile-nav-item {
  flex: 1;
  display: grid;
  place-items: center;
  text-decoration: none;
  color: #667694;
}

.mobile-nav-item.active {
  color: #5d54e8;
  font-weight: 700;
}

.mobile-nav-icon {
  font-size: 18px;
  line-height: 1;
}

.mobile-nav-text {
  font-size: 12px;
}

.learn-footer {
  margin-top: 34px;
  padding: 20px 0 80px;
  color: #637792;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }

  .town-section-card__header {
    padding: 16px 24px;
  }

  .town-section-card__heading {
    font-size: 1.4rem;
  }

  .town-section-card__body {
    padding: 24px;
  }

  .hero-panel {
    margin-top: 32px;
    margin-bottom: 24px;
    padding: 32px;
    grid-template-columns: minmax(0, 1.5fr) minmax(210px, 0.7fr);
    align-items: flex-end;
  }

  .hero-badges {
    margin-top: 0;
    justify-content: flex-end;
    align-content: flex-end;
  }

  .hero-badges span {
    text-align: center;
    min-width: 132px;
  }

  .learn-footer {
    padding-bottom: 24px;
  }
}

@media (max-width: 767px) {
  .video-stream-desktop {
    display: none;
  }

  .video-stream-mobile {
    display: block;
  }

  .tiktok-frame {
    width: 100%;
    height: 450px;
    background: #2c2f78;
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
    scroll-snap-align: start;
    position: relative;
  }

  .tiktok-thumbnail,
  .tiktok-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tiktok-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #eef2ff;
    background: rgba(98, 93, 232, 0.6);
  }

  .tiktok-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
    color: #fff;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
  }

  .tiktok-title {
    margin: 0;
    font-size: 1rem;
  }

  .tiktok-author {
    margin: 6px 0 0;
    opacity: 0.86;
    font-size: 0.86rem;
  }
}
</style>
