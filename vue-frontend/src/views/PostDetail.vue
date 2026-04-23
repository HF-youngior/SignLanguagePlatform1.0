<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg hidden md:block">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors duration-300">
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600">译站</router-link>
            <router-link to="/community" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">手语圈</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-3 md:pt-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 返回按钮 -->
        <div class="mb-3 md:mb-6 post-back-wrap">
          <el-button size="small" class="post-back-btn" @click="$router.back()" icon="ArrowLeft">返回</el-button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <el-loading-spinner />
          <p class="text-gray-500 mt-4">加载中...</p>
        </div>

        <template v-else>
          <!-- 帖子内容 -->
          <el-card class="mb-6">
            <div class="flex items-start space-x-4">
              <el-avatar :size="50" :src="getAvatarUrl(post.author_avatar)">
                {{ post.author_username ? post.author_username.charAt(0) : '?' }}
              </el-avatar>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-semibold">{{ post.author_username }}</span>
                  <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                    {{ post.level || '初级' }}
                  </el-tag>
                  <span class="text-gray-500 text-sm">{{ formatTime(post.created_at) }}</span>
                  <el-tag size="small" :type="privacyType" class="ml-2">
                    {{ privacyText }}
                  </el-tag>
                </div>
                <p class="text-gray-700 mb-4 text-lg">{{ post.content }}</p>
                
                <!-- 互动按钮 -->
                <div class="flex items-center space-x-6 text-gray-500">
                  <div class="flex items-center space-x-2 cursor-pointer hover:text-blue-600" @click="showComments = !showComments">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>{{ post.comments_count || 0 }} 评论</span>
                  </div>
                  <div class="flex items-center space-x-2 cursor-pointer hover:text-red-600" @click="toggleLike">
                    <span class="mr-1 text-lg" :class="{ 'text-red-500': isLiked }">{{ isLiked ? '❤️' : '🤍' }}</span>
                    <span>{{ post.likes_count || 0 }} 点赞</span>
                  </div>
                  <div v-if="isAuthor" class="flex items-center space-x-2 cursor-pointer hover:text-blue-600" @click="showPrivacyMenu = !showPrivacyMenu">
                    <el-icon><Setting /></el-icon>
                    <span>权限设置</span>
                    <el-icon class="ml-1" :class="{ 'rotate-180': showPrivacyMenu }"><ArrowDown /></el-icon>
                  </div>
                </div>
                
                <!-- 权限设置下拉菜单 -->
                <div v-if="showPrivacyMenu && isAuthor" class="mt-4 p-4 bg-gray-50 rounded-lg border">
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
          <el-card v-if="showComments" class="mb-6 comments-card">
            <template #header>
              <span class="text-lg font-semibold">评论区 ({{ comments.length }})</span>
            </template>
            
            <!-- 评论输入框 -->
            <div class="mb-3 md:mb-6">
              <div class="flex items-start space-x-3 comment-editor-row">
                <el-avatar :size="40" :src="getAvatarUrl(currentUser.avatar)">
                  {{ currentUser.name ? currentUser.name.charAt(0) : '?' }}
                </el-avatar>
                <div class="flex-1 comment-editor-input-wrap">
                  <el-input
                    type="textarea"
                    :rows="2"
                    placeholder="写下你的评论..."
                    v-model="newComment"
                    class="comment-editor-input"
                  ></el-input>
                </div>
                <el-button type="primary" size="small" class="comment-editor-submit" @click="addComment">发表评论</el-button>
              </div>
            </div>

            <!-- 评论列表 -->
            <div v-if="comments.length > 0" class="space-y-4">
              <div v-for="comment in comments" :key="comment.id" class="flex items-start space-x-3">
                <el-avatar :size="40" :src="getAvatarUrl(comment.user_avatar)">
                  {{ comment.user_username ? comment.user_username.charAt(0) : '?' }}
                </el-avatar>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-sm">{{ comment.user_username }}</span>
                    <span class="text-gray-500 text-xs">{{ formatTime(comment.created_at) }}</span>
                  </div>
                  <p class="text-gray-700 mb-2">{{ comment.content }}</p>
                  
                  <!-- 评论互动 -->
                  <div class="flex items-center space-x-4 text-gray-500 text-xs">
                    <span class="cursor-pointer hover:text-red-600 flex items-center" @click="likeComment(comment.id)">
                      <el-icon class="mr-1"><Like /></el-icon>
                      {{ comment.likes_count || 0 }}
                    </span>
                    <span class="cursor-pointer hover:text-blue-600" @click="replyToComment(comment)">
                      回复
                    </span>
                  </div>

                  <!-- 回复输入框 -->
                  <div v-if="replyingTo === comment.id" class="mt-3 ml-4">
                    <el-input
                      type="textarea"
                      :rows="2"
                      :placeholder="`回复 @${comment.user_username}...`"
                      v-model="replyContent"
                      class="mb-2"
                    ></el-input>
                    <div class="flex justify-end space-x-2">
                      <el-button size="small" @click="cancelReply">取消</el-button>
                      <el-button type="primary" size="small" @click="submitReply(comment.id)">回复</el-button>
                    </div>
                  </div>

                  <!-- 回复列表 -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-4 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start space-x-3">
                      <el-avatar :size="32" :src="getAvatarUrl(reply.user_avatar)">
                        {{ reply.user_username ? reply.user_username.charAt(0) : '?' }}
                      </el-avatar>
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                          <span class="font-medium text-xs">{{ reply.user_username }}</span>
                          <span class="text-gray-500 text-xs">{{ formatTime(reply.created_at) }}</span>
                        </div>
                        <p class="text-gray-700 text-sm">{{ reply.content }}</p>
                        <div class="flex items-center space-x-3 text-gray-500 text-xs mt-1">
                          <span class="cursor-pointer hover:text-red-600 flex items-center" @click="likeComment(reply.id)">
                            <el-icon class="mr-1"><Like /></el-icon>
                            {{ reply.likes_count || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="comments-empty">暂无评论，来发表第一条评论吧</div>
          </el-card>
        </template>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="backdrop-blur-md bg-white/70 text-gray-700 py-8 mt-12 border-t border-indigo-100/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2024 掌中语-手语小镇. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAvatarUrl } from '@/utils/avatar'
import apiService from '@/services/api'

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const showComments = ref(true)
    const showLikes = ref(false)
    const showPrivacyMenu = ref(false)
    const newComment = ref('')
    const replyContent = ref('')
    const replyingTo = ref(null)
    const isLiked = ref(false)
    const isAuthor = ref(false)

    const post = ref({})
    const comments = ref([])
    const currentUser = ref({
      name: '',
      avatar: ''
    })

    // 从localStorage获取当前用户信息
    const getCurrentUser = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          currentUser.value = {
            name: user.username || user.name || '用户',
            avatar: user.avatar || ''
          }
          return user
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      return null
    }

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

    // 格式化时间
    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      
      // 小于1分钟
      if (diff < 60000) return '刚刚'
      // 小于1小时
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      // 小于24小时
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      // 小于7天
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
      
      return date.toLocaleDateString()
    }

    // 加载帖子详情
    const loadPostDetail = async () => {
      const postId = route.params.id
      if (!postId) {
        ElMessage.error('帖子ID不存在')
        router.push('/community')
        return
      }

      try {
        loading.value = true
        const user = getCurrentUser()
        
        const response = await apiService.getPostById(postId)
        if (response.success) {
          post.value = response.data.post
          comments.value = response.data.comments || []
          
          // 检查是否是作者
          if (user && post.value.author_id === user.id) {
            isAuthor.value = true
          }
          
          // 检查是否已点赞（这里需要后端支持返回isLiked字段）
          // 暂时使用本地存储记录
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
          isLiked.value = likedPosts.includes(parseInt(postId))
        } else {
          ElMessage.error('获取帖子详情失败')
        }
      } catch (error) {
        console.error('加载帖子详情失败:', error)
        ElMessage.error('加载帖子详情失败')
      } finally {
        loading.value = false
      }
    }

    // 点赞/取消点赞
    const toggleLike = async () => {
      const postId = route.params.id
      try {
        const response = await apiService.likePost(postId)
        if (response.success) {
          isLiked.value = response.data.liked
          post.value.likes_count = response.data.liked 
            ? (post.value.likes_count || 0) + 1 
            : Math.max(0, (post.value.likes_count || 0) - 1)
          
          // 保存点赞状态到本地
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
          if (response.data.liked) {
            likedPosts.push(parseInt(postId))
          } else {
            const index = likedPosts.indexOf(parseInt(postId))
            if (index > -1) likedPosts.splice(index, 1)
          }
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
          
          ElMessage.success(response.data.liked ? '点赞成功' : '已取消点赞')
        }
      } catch (error) {
        console.error('点赞失败:', error)
        ElMessage.error('操作失败')
      }
    }

    // 添加评论
    const addComment = async () => {
      if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
      }

      const postId = route.params.id
      try {
        const response = await apiService.commentPost(postId, newComment.value.trim())
        if (response.success) {
          newComment.value = ''
          // 重新加载评论列表
          await loadPostDetail()
          ElMessage.success('评论发表成功！')
        }
      } catch (error) {
        console.error('评论失败:', error)
        ElMessage.error('评论失败')
      }
    }

    // 回复评论
    const replyToComment = (comment) => {
      replyingTo.value = comment.id
      replyContent.value = ''
    }

    // 取消回复
    const cancelReply = () => {
      replyingTo.value = null
      replyContent.value = ''
    }

    // 提交回复
    const submitReply = async (parentId) => {
      if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
      }

      const postId = route.params.id
      try {
        const response = await apiService.commentPost(postId, replyContent.value.trim(), parentId)
        if (response.success) {
          replyContent.value = ''
          replyingTo.value = null
          // 重新加载评论列表
          await loadPostDetail()
          ElMessage.success('回复成功！')
        }
      } catch (error) {
        console.error('回复失败:', error)
        ElMessage.error('回复失败')
      }
    }

    // 点赞评论
    const likeComment = async (commentId) => {
      try {
        // 这里需要后端支持评论点赞API
        ElMessage.info('评论点赞功能开发中...')
      } catch (error) {
        console.error('点赞评论失败:', error)
      }
    }

    // 设置帖子权限
    const setPrivacy = async (privacy) => {
      const postId = route.params.id
      try {
        const response = await apiService.updatePost(postId, { privacy })
        if (response.success) {
          post.value.privacy = privacy
          showPrivacyMenu.value = false
          
          const privacyTexts = {
            'public': '公开',
            'friends': '仅好友可见',
            'private': '仅自己可见'
          }
          ElMessage.success(`帖子权限已设置为：${privacyTexts[privacy]}`)
        }
      } catch (error) {
        console.error('更新权限失败:', error)
        ElMessage.error('更新权限失败')
      }
    }

    onMounted(() => {
      loadPostDetail()
      document.title = '帖子详情 - 手语教学平台'
    })

    return {
      loading,
      post,
      currentUser,
      showComments,
      showLikes,
      showPrivacyMenu,
      newComment,
      replyContent,
      replyingTo,
      comments,
      isLiked,
      isAuthor,
      privacyType,
      privacyText,
      toggleLike,
      addComment,
      replyToComment,
      cancelReply,
      submitReply,
      likeComment,
      setPrivacy,
      formatTime,
      getAvatarUrl
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.comments-empty {
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
  padding: 6px 0 2px;
}

/* ---- 2026 Unified PostDetail Refresh ---- */
.rotate-180 {
  color: #5a66ef;
}

:deep(.el-card) {
  border: 1px solid rgba(106, 138, 181, 0.2) !important;
  border-radius: 22px !important;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.94), rgba(243, 248, 253, 0.92)) !important;
  box-shadow: 0 14px 30px rgba(63, 101, 148, 0.12) !important;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(108, 139, 182, 0.16) !important;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.9), rgba(241, 248, 253, 0.9)) !important;
  color: #2b486a !important;
}

:deep(.el-button--primary),
:deep(.el-button--success),
:deep(.el-button--warning),
:deep(.el-button--info) {
  border: 1px solid rgba(81, 137, 198, 0.28) !important;
  background: linear-gradient(122deg, #2f7de0, #3f9ee4 70%, #5fc1da) !important;
  color: #fff !important;
}

:deep(.el-button--default) {
  border: 1px solid rgba(108, 139, 182, 0.22) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  color: #35668d !important;
}

:deep(.comment-editor-input .el-textarea__inner) {
  border: 1px solid rgba(108, 139, 182, 0.24) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

@media (max-width: 767px) {
  .post-back-wrap {
    margin-bottom: 10px !important;
  }

  .post-back-btn {
    min-height: 34px;
    padding: 6px 14px;
    font-size: 14px;
  }

  :deep(.comments-card .el-card__header) {
    padding: 12px 14px !important;
  }

  :deep(.comments-card .el-card__body) {
    padding: 12px 14px !important;
  }

  .comment-editor-row {
    align-items: flex-start;
  }

  .comment-editor-input-wrap {
    min-width: 0;
  }

  :deep(.comment-editor-input .el-textarea__inner) {
    min-height: 42px !important;
    padding: 8px 10px !important;
  }

  .comment-editor-submit {
    align-self: stretch;
    min-height: 42px;
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>
