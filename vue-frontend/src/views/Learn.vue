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
          <p class="text-xl text-gray-600">系统化学习手语基础知识，从文化到实践</p>
        </div>

        <!-- 聋人文化板块 -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">🏛️ 聋人文化</h2>
          <el-card shadow="hover" class="cursor-pointer mb-8">
            <div class="text-center">
              <div class="text-6xl mb-4">🏛️</div>
              <h3 class="text-2xl font-bold mb-3">聋人文化</h3>
              <p class="text-gray-600 mb-4">了解聋人文化的发展历程、艺术表达和社区特色</p>
              <el-button type="primary" size="large">开始了解</el-button>
            </div>
          </el-card>

          <!-- 聋人文化子板块 -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- 发展历程 -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-5xl mb-4">📈</div>
                <h3 class="text-xl font-bold mb-3">发展历程</h3>
                <p class="text-gray-600 mb-4">探索聋人文化的历史发展脉络，了解重要里程碑和变革</p>
                <el-button type="info" size="small">了解历史</el-button>
              </div>
            </el-card>

            <!-- 艺术表达 -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-5xl mb-4">🎨</div>
                <h3 class="text-xl font-bold mb-3">艺术表达</h3>
                <p class="text-gray-600 mb-4">欣赏聋人艺术家的作品，感受视觉语言的独特魅力</p>
                <el-button type="info" size="small">欣赏艺术</el-button>
              </div>
            </el-card>

            <!-- 社区特色 -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-5xl mb-4">🏘️</div>
                <h3 class="text-xl font-bold mb-3">社区特色</h3>
                <p class="text-gray-600 mb-4">体验聋人社区的独特文化氛围和生活方式</p>
                <el-button type="info" size="small">探索社区</el-button>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 学习模块 -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">📖 核心学习模块</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- 手语基础（合并字母和数字） -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-6xl mb-4">🔤</div>
                <h3 class="text-xl font-bold mb-2">手语基础</h3>
                <p class="text-gray-600 mb-4">学习26个手语字母和0-9数字手势</p>
                <el-button type="primary" size="small">开始学习</el-button>
              </div>
            </el-card>

            <!-- 词汇积累 -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-6xl mb-4">📝</div>
                <h3 class="text-xl font-bold mb-2">词汇积累</h3>
                <p class="text-gray-600 mb-4">学习日常生活中的常用手语词汇</p>
                <el-button type="primary" size="small">开始学习</el-button>
              </div>
            </el-card>

            <!-- 手语语法 -->
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-6xl mb-4">📚</div>
                <h3 class="text-xl font-bold mb-2">手语语法</h3>
                <p class="text-gray-600 mb-4">掌握手语的基本语法结构</p>
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
        </div>

        <!-- 学习资源与工具 -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">🛠️ 学习资源与工具</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-4xl mb-3">🎥</div>
                <h3 class="text-lg font-bold mb-2">视频课程</h3>
                <p class="text-gray-600 text-sm">专业手语教学视频</p>
                <el-button type="info" size="small">观看课程</el-button>
              </div>
            </el-card>
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-4xl mb-3">📱</div>
                <h3 class="text-lg font-bold mb-2">移动应用</h3>
                <p class="text-gray-600 text-sm">随时随地学习手语</p>
                <el-button type="info" size="small">下载应用</el-button>
              </div>
            </el-card>
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-4xl mb-3">📖</div>
                <h3 class="text-lg font-bold mb-2">电子书籍</h3>
                <p class="text-gray-600 text-sm">手语学习电子教材</p>
                <el-button type="info" size="small">阅读书籍</el-button>
              </div>
            </el-card>
            <el-card shadow="hover" class="cursor-pointer">
              <div class="text-center">
                <div class="text-4xl mb-3">🎯</div>
                <h3 class="text-lg font-bold mb-2">练习工具</h3>
                <p class="text-gray-600 text-sm">手语练习辅助工具</p>
                <el-button type="info" size="small">使用工具</el-button>
              </div>
            </el-card>
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
