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
            <router-link to="/learn" class="text-gray-600 hover:text-blue-600">学习</router-link>
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🤖 AI智能翻译</h1>
          <p class="text-xl text-gray-600">实时手语识别和智能翻译功能</p>
        </div>

        <!-- 翻译功能区域 -->
        <div class="grid lg:grid-cols-2 gap-8 mb-12">
          <!-- 手语识别 -->
          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center">
                <span class="text-lg font-semibold">📹 手语识别</span>
                <el-tag type="success" class="ml-2">实时</el-tag>
              </div>
            </template>
            <div class="text-center">
              <div class="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                <div class="text-center">
                  <div class="text-6xl mb-4">📷</div>
                  <p class="text-gray-600">摄像头区域</p>
                  <p class="text-sm text-gray-500">请允许访问摄像头</p>
                </div>
              </div>
              <div class="space-y-2">
                <el-button type="primary" size="large" class="w-full">开始识别</el-button>
                <el-button size="large" class="w-full">停止识别</el-button>
              </div>
            </div>
          </el-card>

          <!-- 翻译结果 -->
          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center">
                <span class="text-lg font-semibold">📝 翻译结果</span>
                <el-tag type="info" class="ml-2">AI分析</el-tag>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">识别文本</label>
                <el-input
                  type="textarea"
                  :rows="4"
                  placeholder="手语识别结果将显示在这里..."
                  v-model="recognizedText"
                ></el-input>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">翻译结果</label>
                <el-input
                  type="textarea"
                  :rows="4"
                  placeholder="翻译结果将显示在这里..."
                  v-model="translatedText"
                ></el-input>
              </div>
              <div class="flex space-x-2">
                <el-button type="success" size="small">复制结果</el-button>
                <el-button type="warning" size="small">保存记录</el-button>
                <el-button size="small">清空</el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 功能模块 -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <!-- 文字转手语 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">✍️</div>
              <h3 class="text-xl font-bold mb-2">文字转手语</h3>
              <p class="text-gray-600 mb-4">输入文字，生成对应的手语动作演示</p>
              <el-button type="primary" size="small">开始转换</el-button>
            </div>
          </el-card>

          <!-- 语音识别 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">🎤</div>
              <h3 class="text-xl font-bold mb-2">语音识别</h3>
              <p class="text-gray-600 mb-4">语音输入，转换为手语表达</p>
              <el-button type="primary" size="small">开始录音</el-button>
            </div>
          </el-card>

          <!-- 翻译历史 -->
          <el-card shadow="hover" class="cursor-pointer">
            <div class="text-center">
              <div class="text-6xl mb-4">📚</div>
              <h3 class="text-xl font-bold mb-2">翻译历史</h3>
              <p class="text-gray-600 mb-4">查看和管理您的翻译记录</p>
              <el-button type="info" size="small">查看历史</el-button>
            </div>
          </el-card>
        </div>

        <!-- 使用统计 -->
        <el-card>
          <template #header>
            <span class="text-lg font-semibold">使用统计</span>
          </template>
          <div class="grid md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">156</div>
              <div class="text-gray-600">今日翻译次数</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div class="text-gray-600">识别准确率</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">1,234</div>
              <div class="text-gray-600">累计翻译次数</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">45</div>
              <div class="text-gray-600">学习天数</div>
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
import { ref } from 'vue'

export default {
  name: 'Translate',
  setup() {
    const recognizedText = ref('')
    const translatedText = ref('')

    return {
      recognizedText,
      translatedText
    }
  },
  mounted() {
    document.title = 'AI智能翻译 - 手语教学平台'
  }
}
</script>
