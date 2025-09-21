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
            <router-link to="/translate" class="text-gray-600 hover:text-blue-600">翻译</router-link>
            <router-link to="/community" class="text-gray-600 hover:text-blue-600">社区</router-link>
            <router-link to="/profile" class="text-gray-600 hover:text-blue-600">我的</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 返回按钮 -->
        <div class="mb-6">
          <el-button @click="$router.back()" icon="ArrowLeft">返回</el-button>
        </div>

        <!-- 帖子内容 -->
        <el-card class="mb-6">
          <div class="flex items-start space-x-4">
            <el-avatar :size="50" :src="post.avatar">
              {{ post.username.charAt(0) }}
            </el-avatar>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="font-semibold">{{ post.username }}</span>
                <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                  {{ post.level }}
                </el-tag>
                <span class="text-gray-500 text-sm">{{ post.time }}</span>
                <el-tag size="small" :type="privacyType" class="ml-2">
                  {{ privacyText }}
                </el-tag>
              </div>
              <p class="text-gray-700 mb-4 text-lg">{{ post.content }}</p>
              
              <!-- 互动按钮 -->
              <div class="flex items-center space-x-6 text-gray-500">
                <div class="flex items-center space-x-2 cursor-pointer hover:text-blue-600" @click="showComments = !showComments">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ post.comments }} 评论</span>
                </div>
                <div class="flex items-center space-x-2 cursor-pointer hover:text-red-600" @click="showLikes = !showLikes">
                  <el-icon><Like /></el-icon>
                  <span>{{ post.likes }} 点赞</span>
                </div>
                <div class="flex items-center space-x-2 cursor-pointer hover:text-green-600">
                  <el-icon><Share /></el-icon>
                  <span>分享</span>
                </div>
                <div class="flex items-center space-x-2 cursor-pointer hover:text-purple-600" @click="showPrivacyMenu = !showPrivacyMenu">
                  <el-icon><Setting /></el-icon>
                  <span>权限设置</span>
                  <el-icon class="ml-1" :class="{ 'rotate-180': showPrivacyMenu }"><ArrowDown /></el-icon>
                </div>
              </div>
              
              <!-- 权限设置下拉菜单 -->
              <div v-if="showPrivacyMenu" class="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div class="space-y-3">
                  <div class="text-sm font-medium text-gray-700 mb-3">设置帖子权限</div>
                  <div class="space-y-2">
                    <div 
                      class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      :class="{ 'bg-blue-50 border border-blue-200': post.privacy === 'public' }"
                      @click="setPrivacy('public')"
                    >
                      <el-icon class="text-green-600"><Check /></el-icon>
                      <div>
                        <div class="font-medium">公开</div>
                        <div class="text-sm text-gray-500">所有人都可以查看此帖子</div>
                      </div>
                      <el-icon v-if="post.privacy === 'public'" class="text-green-600 ml-auto"><Check /></el-icon>
                    </div>
                    
                    <div 
                      class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                      :class="{ 'bg-orange-50 border border-orange-200': post.privacy === 'friends' }"
                      @click="setPrivacy('friends')"
                    >
                      <el-icon class="text-orange-600"><User /></el-icon>
                      <div>
                        <div class="font-medium">仅好友可见</div>
                        <div class="text-sm text-gray-500">只有您的好友可以查看此帖子</div>
                      </div>
                      <el-icon v-if="post.privacy === 'friends'" class="text-orange-600 ml-auto"><Check /></el-icon>
                    </div>
                    
                    <div 
                      class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      :class="{ 'bg-gray-50 border border-gray-200': post.privacy === 'private' }"
                      @click="setPrivacy('private')"
                    >
                      <el-icon class="text-gray-600"><Lock /></el-icon>
                      <div>
                        <div class="font-medium">仅自己可见</div>
                        <div class="text-sm text-gray-500">只有您可以查看此帖子</div>
                      </div>
                      <el-icon v-if="post.privacy === 'private'" class="text-gray-600 ml-auto"><Check /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 评论区 -->
        <el-card v-if="showComments" class="mb-6">
          <template #header>
            <span class="text-lg font-semibold">评论区</span>
          </template>
          
          <!-- 评论输入框 -->
          <div class="mb-6">
            <div class="flex items-start space-x-3">
              <el-avatar :size="40" :src="currentUser.avatar">
                {{ currentUser.name.charAt(0) }}
              </el-avatar>
              <div class="flex-1">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="写下你的评论..."
                  v-model="newComment"
                  class="mb-3"
                ></el-input>
                <div class="flex justify-end">
                  <el-button type="primary" size="small" @click="addComment">发表评论</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="flex items-start space-x-3">
              <el-avatar :size="40" :src="comment.avatar">
                {{ comment.username.charAt(0) }}
              </el-avatar>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-medium text-sm">{{ comment.username }}</span>
                  <span class="text-gray-500 text-xs">{{ comment.time }}</span>
                </div>
                <p class="text-gray-700 mb-2">{{ comment.content }}</p>
                
                <!-- 评论互动 -->
                <div class="flex items-center space-x-4 text-gray-500 text-xs">
                  <span class="cursor-pointer hover:text-red-600 flex items-center">
                    <el-icon class="mr-1"><Like /></el-icon>
                    {{ comment.likes }}
                  </span>
                  <span class="cursor-pointer hover:text-blue-600" @click="replyToComment(comment)">
                    回复
                  </span>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-6 space-y-3">
                  <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start space-x-3">
                    <el-avatar :size="32" :src="reply.avatar">
                      {{ reply.username.charAt(0) }}
                    </el-avatar>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <span class="font-medium text-xs">{{ reply.username }}</span>
                        <span class="text-gray-500 text-xs">{{ reply.time }}</span>
                      </div>
                      <p class="text-gray-700 text-sm">{{ reply.content }}</p>
                      <div class="flex items-center space-x-3 text-gray-500 text-xs mt-1">
                        <span class="cursor-pointer hover:text-red-600 flex items-center">
                          <el-icon class="mr-1"><Like /></el-icon>
                          {{ reply.likes }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 点赞用户列表 -->
        <el-card v-if="showLikes">
          <template #header>
            <span class="text-lg font-semibold">点赞用户 ({{ post.likes }})</span>
          </template>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="user in likedUsers" :key="user.id" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <el-avatar :size="40" :src="user.avatar">
                {{ user.name.charAt(0) }}
              </el-avatar>
              <div class="flex-1">
                <div class="font-medium text-sm">{{ user.name }}</div>
                <div class="text-gray-500 text-xs">{{ user.time }}</div>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute()
    const showComments = ref(false)
    const showLikes = ref(false)
    const showPrivacyMenu = ref(false)
    const newComment = ref('')

    const post = ref({
      id: 1,
      username: '张三',
      level: '中级',
      time: '2小时前',
      content: '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？',
      avatar: '',
      comments: 5,
      likes: 12,
      privacy: 'public' // public, friends, private
    })

    const currentUser = ref({
      name: '当前用户',
      avatar: ''
    })

    const privacyType = computed(() => {
      switch (post.value.privacy) {
        case 'public': return 'success'
        case 'friends': return 'warning'
        case 'private': return 'info'
        default: return 'success'
      }
    })

    const privacyText = computed(() => {
      switch (post.value.privacy) {
        case 'public': return '公开'
        case 'friends': return '仅好友可见'
        case 'private': return '仅自己可见'
        default: return '公开'
      }
    })

    const comments = ref([
      {
        id: 1,
        username: '小明',
        time: '1小时前',
        content: '我也在学习这个，可以一起交流！',
        avatar: '',
        likes: 3,
        replies: [
          {
            id: 11,
            username: '张三',
            time: '30分钟前',
            content: '好的，我们可以建个学习群',
            avatar: '',
            likes: 1
          }
        ]
      },
      {
        id: 2,
        username: '小红',
        time: '45分钟前',
        content: '建议多练习手指的灵活性，这样手语会更标准',
        avatar: '',
        likes: 5,
        replies: []
      },
      {
        id: 3,
        username: '老师',
        time: '30分钟前',
        content: '很棒！建议每天坚持练习15分钟，效果会更好',
        avatar: '',
        likes: 8,
        replies: []
      }
    ])

    const likedUsers = ref([
      { id: 1, name: '小明', time: '1小时前', avatar: '' },
      { id: 2, name: '小红', time: '1小时前', avatar: '' },
      { id: 3, name: '老师', time: '45分钟前', avatar: '' },
      { id: 4, name: '小李', time: '30分钟前', avatar: '' },
      { id: 5, name: '小王', time: '25分钟前', avatar: '' },
      { id: 6, name: '小张', time: '20分钟前', avatar: '' },
      { id: 7, name: '小陈', time: '15分钟前', avatar: '' },
      { id: 8, name: '小刘', time: '10分钟前', avatar: '' }
    ])

    const addComment = () => {
      if (newComment.value.trim()) {
        const comment = {
          id: Date.now(),
          username: currentUser.value.name,
          time: '刚刚',
          content: newComment.value,
          avatar: '',
          likes: 0,
          replies: []
        }
        comments.value.unshift(comment)
        post.value.comments++
        newComment.value = ''
        ElMessage.success('评论发表成功！')
      }
    }

    const replyToComment = (comment) => {
      ElMessage.info('回复功能开发中...')
    }

    const setPrivacy = (privacy) => {
      post.value.privacy = privacy
      showPrivacyMenu.value = false
      
      // 显示成功消息
      const privacyTexts = {
        'public': '公开',
        'friends': '仅好友可见',
        'private': '仅自己可见'
      }
      ElMessage.success(`帖子权限已设置为：${privacyTexts[privacy]}`)
    }

    onMounted(() => {
      // 根据路由参数获取帖子详情
      const postId = route.params.id
      if (postId) {
        // 这里可以根据ID获取具体的帖子数据
        console.log('加载帖子ID:', postId)
      }
      document.title = '帖子详情 - 手语教学平台'
    })

    return {
      post,
      currentUser,
      showComments,
      showLikes,
      showPrivacyMenu,
      newComment,
      comments,
      likedUsers,
      privacyType,
      privacyText,
      addComment,
      replyToComment,
      setPrivacy
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
