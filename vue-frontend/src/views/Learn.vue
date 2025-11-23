<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
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

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-12 fade-in">
          <h1 class="text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down">
            📚 手语学习中心
          </h1>
          <p class="text-xl text-gray-700 font-medium animate-fade-in-up">系统化学习手语基础知识，从文化到实践</p>
        </div>

        <!-- 博主推荐 -->
        <div class="mb-12 fade-in">
          <div class="section-card">
            <div class="section-card__header">
              <div class="section-card__title">
                <span class="section-card__icon">🎥</span>
                <div>
                  <h2 class="section-card__heading">博主推荐</h2>
                  <p class="section-card__subheading">关注优秀的创作者，感受无声世界的多彩故事与灵感。</p>
                </div>
              </div>
              <el-tag class="section-card__tag" type="success" effect="dark">灵感不断</el-tag>
            </div>
            <div class="section-card__body">
              <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <a
                  v-for="blogger in featuredBloggers"
                  :key="blogger.name"
                  :href="blogger.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="blogger-card group"
                >
                  <div class="blogger-card__header">
                    <h3>{{ blogger.name }}</h3>
                    <span class="blogger-card__label">{{ blogger.tag }}</span>
                  </div>
                  <div class="blogger-card__media">
                    <img :src="blogger.avatar" :alt="`${blogger.name} 头像`" />
                    <div class="blogger-card__overlay">
                      <span>点击前往主页</span>
                    </div>
                  </div>
                  <div class="blogger-card__content">
                    <p>{{ blogger.bio }}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习模式选择 -->
        <div class="mb-12 fade-in">
          <div class="section-card">
            <div class="section-card__header">
              <div class="section-card__title">
                <span class="section-card__icon">🌟</span>
                <div>
                  <h2 class="section-card__heading">学习模式选择</h2>
                  <p class="section-card__subheading">闯关升级或专题探索，总有一种节奏让手语学习保持热情。</p>
                </div>
              </div>
            </div>
            <div class="section-card__body">
              <div class="grid gap-6 md:grid-cols-2">
                <button
                  v-for="mode in learningModes"
                  :key="mode.key"
                  class="mode-card"
                  :style="{
                    '--accent-color': mode.accent,
                    '--accent-light': mode.accentLight
                  }"
                  @click="goToMode(mode)"
                >
                  <div class="mode-card__header">
                    <div class="mode-card__icon" :style="{ background: mode.iconBg }">{{ mode.icon }}</div>
                    <div class="mode-card__info">
                      <div class="mode-card__title">
                        <h3>{{ mode.title }}</h3>
                        <span class="mode-card__badge">{{ mode.badge }}</span>
                      </div>
                      <p>{{ mode.description }}</p>
                    </div>
                  </div>
                  <div class="mode-card__footer">
                    <div class="mode-card__progress">
                      <div class="mode-card__progress-bar" :style="{ width: mode.progress + '%' }"></div>
                    </div>
                    <div class="mode-card__progress-text">已点亮 {{ mode.progress }}% 的学习旅程</div>
                    <div class="mode-card__actions">
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
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习进度 -->
        <el-card class="mb-8">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold">学习进度</span>
              <el-tag type="info">初级</el-tag>
            </div>
          </template>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-2">
                <span>手语基础</span>
                <span>8/36</span>
              </div>
              <el-progress :percentage="22" color="#409EFF"></el-progress>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>词汇积累</span>
                <span>12/50</span>
              </div>
              <el-progress :percentage="24" color="#67C23A"></el-progress>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>手语语法</span>
                <span>3/20</span>
              </div>
              <el-progress :percentage="15" color="#E6A23C"></el-progress>
            </div>
          </div>
        </el-card>
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
export default {
  name: 'Learn',
  data() {
    return {
      featuredBloggers: [
        {
          name: '小果灵灵',
          tag: '聋听文化探索者',
          tagType: 'primary',
          link: 'https://xhslink.com/m/5eX0aIPeT7c',
          avatar: 'https://sns-avatar-qc.xhscdn.com/avatar/625431e4bed126b0ed7db512.jpg?imageView2/2/w/540/format/webp|imageMogr2/strip2',
          bio: '华威大学戏剧研究博士在读，专注于手语与口语的对比研究。在这里分享手语的语言之美、聋听文化的碰撞，以及作为“都市野人”的学术与生活日常。欢迎一起打开无声世界的精彩。'
        },
        {
          name: '特爱吃荷包蛋',
          tag: '听障女孩的精彩日常',
          tagType: 'success',
          link: 'https://xhslink.com/m/1fAYSsSh1q9',
          avatar: 'https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31nr55fid58005okkiu28dap3jqpqmi8?imageView2/2/w/540/format/webp|imageMogr2/strip2',
          bio: '爱荷包蛋，更爱生活！在这里，你会发现听障群体的世界同样多彩。分享美妆护肤、穿搭Vlog，也用行动为群体发声。看我用日常点滴，大声表达！'
        },
        {
          name: '听障访谈录',
          tag: '看见听障群体的千百种人生',
          tagType: 'warning',
          link: 'https://xhslink.com/m/1O9SOG8j9e',
          avatar: 'https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31mgvvvqalm005pn54o87cdgnq04gb58?imageView2/2/w/540/format/webp|imageMogr2/strip2',
          bio: '一档专注记录听障人士故事的访谈栏目。深入各行各业，聆听真实经历与心声，打破刻板印象，让每一份别样人生都被看见、被理解。'
        }
      ],
      learningModes: [
        {
          key: 'challenge',
          title: '闯关模式',
          badge: '升级打怪',
          description: '循序渐进的关卡设计，从基础手势到日常对话，每完成一关都会解锁新奖励。',
          icon: '🚀',
          iconBg: 'linear-gradient(135deg, #fff1d6 0%, #ffe4b5 100%)',
          accent: '#f97316',
          accentLight: 'rgba(249, 115, 22, 0.18)',
          progress: 65,
          actionLabel: '开始闯关',
          buttonType: 'primary',
          isDeveloping: false,
          route: { name: 'ChallengeMode' }
        },
        {
          key: 'thematic',
          title: '专题模式',
          badge: '沉浸探索',
          description: '按主题深入学习文化、职场、社交等场景故事，配套视听材料让学习更具代入感。',
          icon: '🎯',
          iconBg: 'linear-gradient(135deg, #ffe8d6 0%, #ffd6a5 100%)',
          accent: '#f59e0b',
          accentLight: 'rgba(245, 158, 11, 0.18)',
          progress: 42,
          actionLabel: '开始探索',
          buttonType: 'warning',
          isDeveloping: true,
          route: { name: 'Learn', query: { mode: 'thematic' } }
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
    }
  },
  mounted() {
    document.title = '手语学习中心 - 手语教学平台'
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

.blogger-section {
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 45%, #c026d3 100%);
  position: relative;
  overflow: hidden;
}

.blogger-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.35), transparent 55%),
              radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.45), transparent 55%);
  pointer-events: none;
}

.blogger-section > * {
  position: relative;
  z-index: 1;
}

.blogger-card {
  backdrop-filter: blur(10px);
}

.section-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-shadow: 0 24px 65px rgba(79, 70, 229, 0.1);
  overflow: hidden;
}

.section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.section-card__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 30px;
}

.section-card__heading {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.section-card__subheading {
  color: rgba(255, 255, 255, 0.82);
  margin-top: 6px;
  font-size: 1rem;
}

.section-card__body {
  padding: 28px 32px 32px;
  background: #ffffff;
}

::deep(.section-card__tag) {
  border-radius: 9999px !important;
  padding: 6px 16px !important;
  font-weight: 600 !important;
  background: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border: none !important;
}

.blogger-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.12);
  box-shadow: 0 20px 45px rgba(99, 102, 241, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blogger-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 60px rgba(99, 102, 241, 0.14);
}

.blogger-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  background: #ffffff;
  color: #1f2937;
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  flex-wrap: nowrap;
}

.blogger-card__header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  color: #1f2937;
}

.blogger-card__label {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.12);
  color: #4338ca;
  white-space: nowrap;
}

.blogger-card__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
}

.blogger-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.blogger-card:hover .blogger-card__media img {
  transform: scale(1.06);
}

.blogger-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0), rgba(102, 126, 234, 0.7));
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.blogger-card__overlay span {
  padding: 10px 20px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  color: #4c1d95;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.blogger-card:hover .blogger-card__overlay {
  opacity: 1;
}

.blogger-card__content {
  padding: 22px;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.7;
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px 28px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 50px rgba(79, 70, 229, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.mode-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 60px rgba(59, 130, 246, 0.16);
}

.mode-card__header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.mode-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: var(--accent-color, #f59e0b);
}

.mode-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mode-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mode-card__title h3 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2937;
}

.mode-card__badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--accent-light, rgba(99, 102, 241, 0.16));
  color: var(--accent-color, #6366f1);
}

.mode-card__info p {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
}

.mode-card__footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mode-card__progress {
  width: 100%;
  height: 10px;
  border-radius: 9999px;
  background: rgba(226, 232, 240, 0.9);
  overflow: hidden;
}

.mode-card__progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--accent-light, rgba(99, 102, 241, 0.2)), var(--accent-color, #6366f1));
}

.mode-card__progress-text {
  font-size: 0.85rem;
  color: var(--accent-color, #6366f1);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.mode-card__actions {
  display: flex;
  justify-content: flex-end;
}

.mode-card__actions :deep(.el-button) {
  border-radius: 9999px !important;
  padding: 10px 24px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
}

::deep(.el-progress__text) {
  color: #374151 !important;
  font-weight: 600 !important;
}
</style>