<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">手语教学平台</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-blue-600">首页</router-link>
            <router-link to="/translate" class="text-gray-600 hover:text-blue-600">翻译</router-link>
            <router-link to="/community" class="text-gray-600 hover:text-blue-600">社区</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 页面标题 -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">📚 手语学习中心</h1>
          <p class="text-xl text-gray-600">系统化学习手语基础知识，从字母到词汇</p>
        </div>

        <!-- 学习模块 -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <!-- 字母学习 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">🔤</div>
              <h3 class="text-xl font-bold mb-2">手语字母</h3>
              <p class="text-gray-600 mb-4">学习26个手语字母的基础手势</p>
              <el-button type="primary" size="small">开始学习</el-button>
            </div>
          </el-card>

          <!-- 数字学习 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">🔢</div>
              <h3 class="text-xl font-bold mb-2">手语数字</h3>
              <p class="text-gray-600 mb-4">掌握0-9的手语数字表达</p>
              <el-button type="primary" size="small">开始学习</el-button>
            </div>
          </el-card>

          <!-- 基础词汇 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">📝</div>
              <h3 class="text-xl font-bold mb-2">基础词汇</h3>
              <p class="text-gray-600 mb-4">学习日常生活中的常用手语词汇</p>
              <el-button type="primary" size="small">开始学习</el-button>
            </div>
          </el-card>

          <!-- 句子练习 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">💬</div>
              <h3 class="text-xl font-bold mb-2">句子练习</h3>
              <p class="text-gray-600 mb-4">练习简单的手语句子表达</p>
              <el-button type="primary" size="small">开始学习</el-button>
            </div>
          </el-card>

          <!-- 情景对话 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">🎭</div>
              <h3 class="text-xl font-bold mb-2">情景对话</h3>
              <p class="text-gray-600 mb-4">在不同场景下的手语对话练习</p>
              <el-button type="primary" size="small">开始学习</el-button>
            </div>
          </el-card>

          <!-- 测试评估 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">📊</div>
              <h3 class="text-xl font-bold mb-2">测试评估</h3>
              <p class="text-gray-600 mb-4">检验学习成果，获得学习建议</p>
              <el-button type="success" size="small">开始测试</el-button>
            </div>
          </el-card>
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
                <span>字母学习</span>
                <span>5/26</span>
              </div>
              <el-progress :percentage="19" color="#409EFF"></el-progress>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>数字学习</span>
                <span>3/10</span>
              </div>
              <el-progress :percentage="30" color="#67C23A"></el-progress>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>基础词汇</span>
                <span>12/50</span>
              </div>
              <el-progress :percentage="24" color="#E6A23C"></el-progress>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 手语教学平台. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Learn',
  mounted() {
    document.title = '手语学习中心 - 手语教学平台'
  }
}
</script>
