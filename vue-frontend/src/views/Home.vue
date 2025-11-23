<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/home" class="text-xl sm:text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              👋 手语教学平台
            </router-link>
          </div>
          <!-- 桌面端导航 -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/home" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">首页</router-link>
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
          </div>
          <!-- 移动端菜单按钮 -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label="菜单"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- 移动端菜单 -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 mt-2">
          <router-link 
            to="/" 
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            首页
          </router-link>
          <router-link 
            to="/learn" 
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            学习
          </router-link>
          <router-link 
            to="/translate" 
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            翻译
          </router-link>
          <router-link 
            to="/community" 
            @click="mobileMenuOpen = false"
            class="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            社区
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <!-- 轮播图区域 -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="text-center mb-8 fade-in">
          <h2 class="text-4xl md:text-5xl font-bold text-blue-700 mb-4 animate-fade-in-down">
            探索手语的魅力
          </h2>
          <p class="text-xl text-gray-700 font-medium max-w-2xl mx-auto animate-fade-in-up">
            一个全面的平台，助您轻松学习、翻译和交流手语
          </p>
        </div>
        
        <!-- 轮播图（可点击跳转外部链接，图片来自 public 目录） -->
        <div class="max-w-4xl mx-auto">
          <el-carousel :height="isMobile ? '250px' : '400px'" indicator-position="outside" arrow="hover" class="custom-carousel">
            <el-carousel-item v-for="slide in slides" :key="slide.id">
              <a :href="slide.link" target="_blank" rel="noopener noreferrer" class="block h-full">
                <div class="relative h-full">
                  <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover rounded-xl" />
                  <div class="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4 text-white drop-shadow">
                    <h3 class="text-2xl font-bold mb-1">{{ slide.title }}</h3>
                    <p class="opacity-90 text-sm">点击查看详情（将打开新窗口）</p>
                  </div>
                </div>
              </a>
            </el-carousel-item>
          </el-carousel>
        </div>
      </section>

      <!-- 三个分区入口 -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <!-- 学习模块 -->
          <router-link to="/learn">
            <el-card class="text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer" shadow="hover">
              <div class="text-6xl mb-4">📚</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">学习</h3>
              <p class="text-gray-600 mb-6">系统化学习手语基础知识，从字母到词汇</p>
              <div class="inline-flex items-center text-blue-600 font-medium">
                开始学习
                <el-icon class="ml-2"><ArrowRight /></el-icon>
              </div>
            </el-card>
          </router-link>

          <!-- 翻译模块 -->
          <router-link to="/translate">
            <el-card class="text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer" shadow="hover">
              <div class="text-6xl mb-4">🤖</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">翻译</h3>
              <p class="text-gray-600 mb-6">AI智能翻译，实时手语识别和转换</p>
              <div class="inline-flex items-center text-blue-600 font-medium">
                开始翻译
                <el-icon class="ml-2"><ArrowRight /></el-icon>
              </div>
            </el-card>
          </router-link>

          <!-- 社区模块 -->
          <router-link to="/community">
            <el-card class="text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer" shadow="hover">
              <div class="text-6xl mb-4">👥</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">社区</h3>
              <p class="text-gray-600 mb-6">与其他学习者交流，分享学习心得</p>
              <div class="inline-flex items-center text-blue-600 font-medium">
                进入社区
                <el-icon class="ml-2"><ArrowRight /></el-icon>
              </div>
            </el-card>
          </router-link>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      mobileMenuOpen: false,
      // ============================================
      // 📝 轮播图配置说明
      // ============================================
      // 1. 图片存放位置：vue-frontend/public/images/banners/
      //    例如：vue-frontend/public/images/banners/article-1.jpg
      //
      // 2. 图片路径写法：/images/banners/你的图片文件名
      //    例如：/images/banners/article-1.jpg
      //
      // 3. 公众号文章链接：复制完整的微信公众号文章链接
      //    例如：https://mp.weixin.qq.com/s/xxxxxxxxxxxxx
      //
      // 4. 如何添加新的轮播图：
      //    在下面的 slides 数组中添加新的对象，包含 id、title、image、link
      // ============================================
      
      slides: [
        // 第一张轮播图
        {
          id: 1,
          title: '手语部招新啦!', // 轮播图显示的标题
          image: '/images/banners/banner-1.png', // 图片路径（需要你把图片放在 public/images/banners/ 目录下）
          link: 'https://mp.weixin.qq.com/s/Zg3ntg7vFjfEUdHKzRt1rQ' // 微信公众号文章链接，点击后跳转
        },
        // 第二张轮播图
        {
          id: 2,
          title: '公益 ｜｜ 编剧思言：创作不是“关于”聋人，而是“源于”聋人',
          image: '/images/banners/banner-2.png', // 图片路径
          link: 'https://mp.weixin.qq.com/s/BLDkF6wZxLvXGJW2DKnFeQ' // 微信公众号文章链接
        },
        // 第三张轮播图
        {
          id: 3,
          title: '【活动延期公告】生活因你而特别-生活片段征集计划，更多创意等你来解锁！',
          image: '/images/banners/banner-3.png', // 图片路径
          link: 'https://mp.weixin.qq.com/s/bqG13U76PHX4EXz_bblHpw' // 微信公众号文章链接
        }
        // 如果需要添加更多轮播图，在这里继续添加，例如：
        // {
        //   id: 4,
        //   title: '第四篇文章标题',
        //   image: '/images/banners/banner-4.jpg',
        //   link: 'https://mp.weixin.qq.com/s/你的文章链接4'
        // }
      ]
    }
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768
    }
  },
  mounted() {
    document.title = '手语教学平台 - 让手语学习变得简单有趣'
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      // 强制更新以响应窗口大小变化
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
/* 缩小轮播图控制点 */
:deep(.el-carousel__indicators) {
  margin-top: 8px;
}

:deep(.el-carousel__indicator) {
  width: 8px !important;
  height: 8px !important;
  margin: 0 4px !important;
}

:deep(.el-carousel__button) {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

/* 移动端进一步缩小 */
@media (max-width: 768px) {
  :deep(.el-carousel__indicator) {
    width: 6px !important;
    height: 6px !important;
    margin: 0 3px !important;
  }
  
  :deep(.el-carousel__button) {
    width: 6px !important;
    height: 6px !important;
  }
}
</style>
