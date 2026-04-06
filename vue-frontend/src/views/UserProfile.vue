<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <!-- 顶部背景 -->
      <div class="bg-cover h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
        <!-- 头像 -->
        <div class="relative">
          <img :src="getAvatarUrl(user.avatar)" :alt="user.username" class="w-32 h-32 rounded-full border-4 border-white object-cover">
        </div>
      </div>
      
      <!-- 个人信息 -->
      <div class="mt-16">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold">{{ user.username }}</h2>
          <p v-if="user.first_name" class="text-gray-500">{{ user.first_name }}</p>
          <p v-if="user.bio" class="text-gray-600 mt-2">{{ user.bio }}</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-center space-x-4 mb-8">
          <el-button 
            v-if="!isCurrentUser" 
            type="primary" 
            @click="addFriend" 
            :loading="addingFriend"
          >
            {{ isFriend ? '已添加' : '添加好友' }}
          </el-button>
          <el-button v-else type="primary" @click="editProfile">编辑资料</el-button>
        </div>
        
        <!-- 统计信息 -->
        <div class="flex justify-around mb-8 border-t border-b py-4">
          <div class="text-center">
            <div class="text-xl font-bold">{{ user.postsCount || 0 }}</div>
            <div class="text-gray-500 text-sm">帖子</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold">{{ user.friendsCount || 0 }}</div>
            <div class="text-gray-500 text-sm">好友</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold">{{ user.likesCount || 0 }}</div>
            <div class="text-gray-500 text-sm">获赞</div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 用户帖子 -->
    <div class="mt-6">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">发布的帖子</span>
          </div>
        </template>
        <div v-if="userPosts.length > 0" class="space-y-4">
          <el-card v-for="post in userPosts" :key="post.id" class="hover:shadow-lg transition-shadow">
            <div class="flex items-start space-x-4">
              <div class="relative">
                <img :src="getAvatarUrl(user.avatar)" :alt="user.username" class="w-10 h-10 rounded-full object-cover">
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-semibold">{{ user.username }}</span>
                  <span class="text-gray-500 text-sm">{{ new Date(post.created_at).toLocaleString('zh-CN') }}</span>
                </div>
                <p class="text-gray-700 mb-3">{{ post.content }}</p>
                
                <!-- 显示帖子中的图片 -->
                <div v-if="post.images && post.images.length > 0" class="mb-3">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <img v-for="image in post.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80">
                  </div>
                </div>
                
                <div class="flex items-center space-x-4 text-gray-500 text-sm">
                  <span class="cursor-pointer hover:text-blue-600">{{ post.comments_count || 0 }} 评论</span>
                  <span class="cursor-pointer hover:text-red-600" @click="togglePostLike(post.id)">
                    <span :class="post.isLiked ? 'text-red-500' : ''">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                    {{ post.likes_count || 0 }} 点赞
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          该用户还没有发布帖子
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAvatarUrl } from '@/utils/avatar'
import apiService from '@/services/api'

export default {
  name: 'UserProfile',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userId = ref(route.params.id)
    const user = ref({})
    const userPosts = ref([])
    const loading = ref(false)
    const addingFriend = ref(false)
    const isCurrentUser = ref(false)
    const isFriend = ref(false)
    
    // 获取用户信息
    const getUserInfo = async () => {
      try {
        loading.value = true
        const response = await apiService.getUserProfile(userId.value)
        if (response.success) {
          user.value = response.data.user
          isCurrentUser.value = response.data.isCurrentUser
          isFriend.value = response.data.isFriend
        } else {
          ElMessage.error('获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      } finally {
        loading.value = false
      }
    }
    
    // 获取用户帖子
    const getUserPosts = async () => {
      try {
        const response = await apiService.getUserPosts({ userId: userId.value })
        if (response.success) {
          userPosts.value = response.data.posts
        } else {
          ElMessage.error('获取用户帖子失败')
        }
      } catch (error) {
        console.error('获取用户帖子失败:', error)
        ElMessage.error('获取用户帖子失败')
      }
    }
    
    // 添加好友
    const addFriend = async () => {
      try {
        addingFriend.value = true
        const response = await apiService.addFriend(userId.value)
        if (response.success) {
          ElMessage.success('好友请求已发送，等待对方确认')
        } else {
          ElMessage.error(response.message || '添加好友失败')
        }
      } catch (error) {
        console.error('添加好友失败:', error)
        ElMessage.error('添加好友失败')
      } finally {
        addingFriend.value = false
      }
    }
    
    // 编辑资料
    const editProfile = () => {
      // 跳转到编辑资料页面
      router.push('/profile/edit')
    }
    
    // 点赞帖子
    const togglePostLike = async (postId) => {
      try {
        const post = userPosts.value.find(p => p.id === postId)
        if (!post) return
        
        const response = await apiService.likePost(postId)
        if (response.success) {
          post.isLiked = !post.isLiked
          post.likes_count = post.isLiked ? (post.likes_count || 0) + 1 : (post.likes_count || 0) - 1
        } else {
          ElMessage.error('操作失败')
        }
      } catch (error) {
        console.error('点赞失败:', error)
        ElMessage.error('操作失败')
      }
    }
    
    onMounted(() => {
      getUserInfo()
      getUserPosts()
    })
    
    return {
      user,
      userPosts,
      loading,
      addingFriend,
      isCurrentUser,
      isFriend,
      getAvatarUrl,
      addFriend,
      editProfile,
      togglePostLike
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  border-radius: 12px;
  overflow: hidden;
}

.bg-cover {
  background-size: cover;
  background-position: center;
}
</style>
