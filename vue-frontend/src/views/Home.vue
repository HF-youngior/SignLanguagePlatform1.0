<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">手语教学平台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/auth/login" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              登录
            </router-link>
            <router-link to="/auth/register" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              注册
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <!-- 轮播图区域 -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="text-center mb-8">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            探索手语的魅力
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            一个全面的平台，助您轻松学习、翻译和交流手语
          </p>
        </div>
        
        <!-- 轮播图 -->
        <div class="max-w-4xl mx-auto">
          <el-carousel height="400px" indicator-position="outside" arrow="hover">
            <el-carousel-item>
              <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl h-full flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-8xl mb-6">👐</div>
                  <h3 class="text-3xl font-bold mb-4">学习手语基础</h3>
                  <p class="text-xl opacity-90">从字母到词汇，系统化学习手语知识</p>
                </div>
              </div>
            </el-carousel-item>
            <el-carousel-item>
              <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl h-full flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-8xl mb-6">🤖</div>
                  <h3 class="text-3xl font-bold mb-4">AI智能翻译</h3>
                  <p class="text-xl opacity-90">实时手语识别和智能翻译功能</p>
                </div>
              </div>
            </el-carousel-item>
            <el-carousel-item>
              <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl h-full flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-8xl mb-6">👥</div>
                  <h3 class="text-3xl font-bold mb-4">社区交流</h3>
                  <p class="text-xl opacity-90">与其他学习者交流，分享学习心得</p>
                </div>
              </div>
            </el-carousel-item>
            <el-carousel-item>
              <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl h-full flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-8xl mb-6">🎯</div>
                  <h3 class="text-3xl font-bold mb-4">个性化学习</h3>
                  <p class="text-xl opacity-90">根据您的进度定制专属学习计划</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </section>

      <!-- 三个分区入口 -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="grid md:grid-cols-3 gap-8">
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
    <footer class="bg-gray-800 text-white py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    document.title = '手语教学平台 - 让手语学习变得简单有趣'
  }
}
</script>
