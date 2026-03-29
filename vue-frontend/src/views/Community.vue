<template>
  <div class="min-h-screen animated-gradient">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300">
              <!-- 使用已有的默认头像图片代替缺失的 logo 文件，避免 Vite 解析错误 -->
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">手语圈</router-link>
            <router-link to="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
              我的
            </router-link>
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
            👥 我的社区
          </h1>
          <p class="text-xl text-gray-700 font-medium animate-fade-in-up">
            用手语连接爱与理解，让沟通无碍
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 发布动态 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">说点什么：</span>
              </template>
              <div class="space-y-4">
                <div class="relative">
                  <el-input
                    type="textarea"
                    :rows="3"
                    placeholder="分享你的学习心得、遇到的问题或者学习技巧...&#10;使用#添加话题标签"
                    v-model="newPost"
                    @input="handleHashtagInput"
                  ></el-input>
                  
                  <!-- 话题标签建议框 -->
                  <div v-if="showHashtagSuggestions" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                    <div class="p-2">
                      <div class="text-xs text-gray-500 mb-2">热门话题</div>
                      <div v-for="topic in hashtagSuggestions" :key="topic.id" 
                           class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded"
                           @click="selectHashtag(topic)">
                        <span class="text-blue-600">#{{ topic.name }}</span>
                        <span class="text-xs text-gray-500">{{ topic.count }} 讨论</span>
                      </div>
                      <div v-if="newHashtag.trim()" 
                           class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded border-t border-gray-200 mt-2"
                           @click="createNewHashtag">
                        <span class="text-green-600">创建新话题: #{{ newHashtag }}</span>
                        <span class="text-xs text-green-500">新建</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 上传的图片预览 -->
                <div v-if="uploadedImages.length > 0" class="space-y-2">
                  <div class="text-sm text-gray-600">已上传图片：</div>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="image in uploadedImages" :key="image.id" class="relative">
                      <img :src="image.url" :alt="image.name" class="w-20 h-20 object-cover rounded border">
                      <button @click="removeImage(image.id)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600">×</button>
                    </div>
                  </div>
                </div>

                <!-- 上传的视频预览 -->
                <div v-if="uploadedVideos.length > 0" class="space-y-2">
                  <div class="text-sm text-gray-600">已上传视频：</div>
                  <div class="space-y-2">
                    <div v-for="video in uploadedVideos" :key="video.id" class="relative">
                      <video :src="video.url" class="w-40 h-24 object-cover rounded border" controls></video>
                      <button @click="removeVideo(video.id)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600">×</button>
                      <div class="text-xs text-gray-500 mt-1">{{ video.name }}</div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <div class="flex space-x-2">
                    <input
                      ref="imageInput"
                      type="file"
                      accept="image/*"
                      multiple
                      style="display: none"
                      @change="handleImageUpload"
                    >
                    <el-button size="small" :icon="Picture" @click="imageInput.click()">图片</el-button>
                    
                    <input
                      ref="videoInput"
                      type="file"
                      accept="video/*"
                      multiple
                      style="display: none"
                      @change="handleVideoUpload"
                    >
                    <el-button size="small" :icon="VideoCamera" @click="videoInput.click()">视频</el-button>
                  </div>
                  <el-button type="primary" @click="publishPost">发布</el-button>
                </div>
              </div>
            </el-card>

            <!-- 动态列表 -->
            <div class="space-y-4">
              <el-card v-for="post in posts" :key="post.id" class="hover:shadow-lg transition-shadow">
                <div class="flex items-start space-x-4">
                  <el-avatar :size="50" :src="getAvatarUrl(post.avatar)">
                    {{ post.username.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="font-semibold">{{ post.username }}</span>
                      <el-tag size="small" :type="post.level === '初级' ? 'info' : post.level === '中级' ? 'warning' : 'success'">
                        {{ post.level }}
                      </el-tag>
                      <span class="text-gray-500 text-sm">{{ post.time }}</span>
                    </div>
                    <p class="text-gray-700 mb-3">{{ post.content }}</p>
                    
                    <!-- 显示帖子中的图片 -->
                    <div v-if="post.images && post.images.length > 0" class="mb-3">
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <img v-for="image in post.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80" @click="openImageModal(image.url)" loading="lazy">
                      </div>
                    </div>

                    <!-- 显示帖子中的视频 -->
                    <div v-if="post.videos && post.videos.length > 0" class="mb-3">
                      <video v-for="video in post.videos" :key="video.id" :src="video.url" class="w-full max-w-md rounded border" controls></video>
                    </div>
                    <div class="flex items-center space-x-4 text-gray-500 text-sm mb-4">
                      <span class="flex items-center cursor-pointer hover:text-blue-600" @click="toggleCommentInput(post.id)">
                        <el-icon class="mr-1"><ChatDotRound /></el-icon>
                        {{ post.comments }} 评论
                      </span>
                      <span class="flex items-center cursor-pointer hover:text-red-600" @click="toggleLike(post.id)">
                        <span class="mr-1 text-lg" :class="{ 'text-red-500': post.isLiked }">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                        {{ post.likes }} 点赞
                      </span>
                      <span class="flex items-center cursor-pointer hover:text-green-600" @click="viewPostDetail(post.id)">
                        <el-icon class="mr-1"><View /></el-icon>
                        查看详情
                      </span>
                    </div>

                    <!-- 评论输入框 -->
                    <div v-if="showCommentInput[post.id]" class="mb-4">
                      <el-input
                        v-model="newComment"
                        type="textarea"
                        :rows="2"
                        placeholder="写下你的评论..."
                        class="mb-2"
                      ></el-input>
                      <div class="flex justify-end space-x-2">
                        <el-button size="small" @click="showCommentInput[post.id] = false">取消</el-button>
                        <el-button size="small" type="primary" @click="addComment(post.id)">发布评论</el-button>
                      </div>
                    </div>

                    <!-- 评论列表 - 只显示前3条 -->
                    <div v-if="post.commentList && post.commentList.length > 0" class="border-t pt-4">
                      <div v-for="comment in post.commentList.slice(0, 3)" :key="comment.id" class="mb-4">
                        <div class="flex items-start space-x-3">
                          <el-avatar :size="35" :src="getAvatarUrl(comment.avatar)">
                            {{ comment.username.charAt(0) }}
                          </el-avatar>
                          <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                              <span class="font-medium text-sm">{{ comment.username }}</span>
                              <span class="text-gray-500 text-xs">{{ comment.time }}</span>
                            </div>
                            <p class="text-gray-700 text-sm mb-2">{{ comment.content }}</p>
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
                              <span class="cursor-pointer hover:text-blue-600" @click="toggleReplyInput(post.id, comment.id)">
                                回复
                              </span>
                              <span class="cursor-pointer hover:text-red-600" @click="toggleCommentLike(comment.id, post.id, 'comment')">
                                <span :class="comment.isLiked ? 'text-red-500' : ''">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
                                {{ comment.likes || 0 }} 点赞
                              </span>
                            </div>

                            <!-- 回复输入框 -->
                            <div v-if="showReplyInput[`${post.id}-${comment.id}`]" class="mt-2">
                              <el-input
                                v-model="replyToComment[`${post.id}-${comment.id}`]"
                                type="textarea"
                                :rows="1"
                                placeholder="回复 @{{ comment.username }}..."
                                class="mb-2"
                              ></el-input>
                              <div class="flex justify-end space-x-2">
                                <el-button size="small" @click="showReplyInput[`${post.id}-${comment.id}`] = false">取消</el-button>
                                <el-button size="small" type="primary" @click="addReply(post.id, comment.id)">回复</el-button>
                              </div>
                            </div>

                            <!-- 楼中楼回复 -->
                            <div v-if="comment.replies && comment.replies.length > 0" class="mt-2 ml-4 border-l-2 border-gray-200 pl-3">
                              <div v-for="reply in comment.replies" :key="reply.id" class="mb-2">
                                <div class="flex items-start space-x-2">
                                  <el-avatar :size="25" :src="getAvatarUrl(reply.avatar)">
                                    {{ reply.username.charAt(0) }}
                                  </el-avatar>
                                  <div class="flex-1">
                                    <div class="flex items-center space-x-2 mb-1">
                                      <span class="font-medium text-xs">{{ reply.username }}</span>
                                      <span v-if="reply.replyTo" class="text-blue-600 text-xs">@{{ reply.replyTo }}</span>
                                      <span class="text-gray-500 text-xs">{{ reply.time }}</span>
                                    </div>
                                    <p class="text-gray-700 text-xs">{{ reply.content }}</p>
                                    <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                      <span class="cursor-pointer hover:text-red-600" @click="toggleCommentLike(reply.id, post.id, 'comment')">
                                        <span :class="reply.isLiked ? 'text-red-500' : ''">{{ reply.isLiked ? '❤️' : '🤍' }}</span>
                                        {{ reply.likes || 0 }} 点赞
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 查看更多评论提示 -->
                      <div v-if="post.commentList.length > 3" class="text-center pt-2 border-t">
                        <span class="text-blue-600 text-sm cursor-pointer hover:underline" @click="viewPostDetail(post.id)">
                          查看全部 {{ post.commentList.length }} 条评论
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
            
            <!-- 加载更多提示 -->
            <div v-if="loading" class="text-center py-4">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span class="ml-2">加载中...</span>
            </div>
            <div v-else-if="!hasMore && posts.length > 0" class="text-center py-4 text-gray-500">
              没有更多内容了
            </div>
            <div v-else-if="posts.length === 0" class="text-center py-8 text-gray-500">
              暂无帖子，快来发布第一条动态吧！
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="space-y-6">
            <!-- 聋健互通组别 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🤝 聋健互通</span>
              </template>
              <div class="space-y-3">
                <div v-for="group in deafHearingGroups" :key="group.id" class="flex items-center space-x-3">
                  <el-avatar :size="40" :src="getAvatarUrl(group.avatar)" :class="group.type === 'deaf' ? 'ring-2 ring-green-500' : 'ring-2 ring-blue-500'">
                    {{ group.name.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员</div>
                    <div class="text-xs text-gray-400">{{ group.description }}</div>
                  </div>
                  <el-button size="small" type="warning" @click="joinGroup(group)">加入</el-button>
                </div>
              </div>
            </el-card>

            <!-- 热门话题 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🔥 热门话题</span>
              </template>
              <div class="space-y-2">
                <div v-for="topic in hotTopics" :key="topic.id" class="flex items-center justify-between">
                  <span class="text-blue-600 cursor-pointer hover:underline" @click="goToHashtagPage(topic)">{{ topic.name }}</span>
                  <el-tag size="small" type="warning">{{ topic.count }}</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 手语公益星 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">⭐ 手语公益星</span>
              </template>
              <div class="space-y-3">
                <p class="text-sm text-gray-600">
                  每月走近一位热心的手语公益实践者，记录他们用双手带来的温暖改变。
                </p>
                <div class="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                  <div class="flex items-center space-x-3 mb-2">
                    <el-avatar :size="40" :src="getAvatarUrl(currentCharityStar.avatar)">
                      {{ currentCharityStar.name.charAt(0) }}
                    </el-avatar>
                    <div>
                      <div class="font-medium text-gray-900">
                        {{ currentCharityStar.month }} · {{ currentCharityStar.name }}
                      </div>
                      <div class="text-xs text-blue-600">
                        {{ currentCharityStar.tagline }}
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {{ currentCharityStar.story }}
                  </p>
                  <div class="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>本月公益主题：{{ currentCharityStar.topic }}</span>
                    <el-button type="primary" link @click="viewCharityStar">
                      查看完整故事
                    </el-button>
                  </div>
                </div>
                <p class="text-xs text-gray-400">
                  想成为下一位「手语公益星」？在社区发布你的公益实践并添加
                  <span class="text-blue-500 font-medium">#手语助残行动</span>
                  或
                  <span class="text-blue-500 font-medium">#聋人文化守护</span>
                  话题标签吧。
                </p>
              </div>
            </el-card>

            <!-- 热门群聊 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🔥 热门群聊</span>
              </template>
              <div class="space-y-3">
                <div v-for="group in hotChatGroups" :key="group.id" class="flex items-center space-x-3">
                  <el-avatar :size="40" :src="getAvatarUrl(group.avatar)">{{ group.name.charAt(0) }}</el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员 · {{ group.activeToday }} 今日活跃</div>
                  </div>
                  <el-button size="small" type="warning" @click="joinChatGroup(group)">加入</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Picture, VideoCamera, ChatDotRound, View, Loading } from '@element-plus/icons-vue'
import { getAvatarUrl } from '@/utils/avatar'
import { handleImageUploadWithCompression } from '@/utils/imageCompressor'
import apiService from '@/services/api'

export default {
  name: 'Community',
  setup() {
    const router = useRouter()
    const newPost = ref('')
    const newComment = ref('')
    const showCommentInput = ref({})
    const showReplyInput = ref({})
    const replyToComment = ref({})
    const uploadedImages = ref([])
    const uploadedVideos = ref([])
    const imageInput = ref(null)
    const videoInput = ref(null)
    const showHashtagSuggestions = ref(false)
    const hashtagSuggestions = ref([])
    const hashtagCursorPosition = ref(0)
    const newHashtag = ref('')

    const posts = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalPosts = ref(0)
    const loading = ref(false)
    const hasMore = ref(true)
    const currentCharityStar = ref({
      month: '2025年3月',
      name: '张老师',
      tagline: '手语推广志愿者',
      avatar: '',
      story: '张老师是一位资深的手语推广志愿者，从事手语教学工作已有10年。她不仅在学校教授手语，还经常到社区开展公益手语培训，帮助更多人了解和使用手语。',
      topic: '手语进社区'
    })

    // 加载帖子列表
    const loadPosts = async (isLoadMore = false) => {
      if (loading.value || (!isLoadMore && !hasMore.value)) {
        return
      }
      
      try {
        loading.value = true
        console.log('正在加载帖子...', { page: currentPage.value, pageSize: pageSize.value })
        
        const response = await apiService.getPosts({
          page: currentPage.value,
          limit: pageSize.value
        })
        
        console.log('帖子响应:', response)
        if (response.success) {
          const newPosts = response.data.posts.map(post => ({
            id: post.id,
            username: post.username,
            level: '中级',
            time: new Date(post.created_at).toLocaleString('zh-CN'),
            content: post.content,
            avatar: post.avatar,
            comments: post.comments_count || 0,
            likes: post.likes_count || 0,
            isLiked: post.isLiked || false,
            commentList: post.commentList || []
          }))
          
          if (isLoadMore) {
            posts.value = [...posts.value, ...newPosts]
          } else {
            posts.value = newPosts
          }
          
          totalPosts.value = response.data.pagination.total || 0
          hasMore.value = posts.value.length < totalPosts.value
          currentPage.value += 1
          
          console.log('加载的帖子数量:', newPosts.length, '总帖子数:', totalPosts.value, '是否有更多:', hasMore.value)
        } else {
          console.error('加载帖子失败:', response.message)
        }
      } catch (error) {
        console.error('加载帖子失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 提交帖子
    const submitPost = async () => {
      if (!newPost.value.trim()) {
        ElMessage.warning('请输入内容')
        return
      }

      try {
        const response = await apiService.createPost({
          content: newPost.value,
          privacy: 'public'
        })

        if (response.success) {
          // 清空表单
          newPost.value = ''
          uploadedImages.value = []
          uploadedVideos.value = []

          // 重新加载帖子列表
          await loadPosts()
          ElMessage.success('发布成功！')
        }
      } catch (error) {
        console.error('发布帖子失败:', error)
        ElMessage.error('发布失败，请稍后重试')
      }
    }

    // 初始化数据
    onMounted(async () => {
      // 重置分页状态
      currentPage.value = 1
      hasMore.value = true
      await loadPosts()
      await loadHotGroups()
      await loadDeafHearingGroups()
    })
    
    // 加载更多帖子
    const loadMorePosts = async () => {
      if (hasMore.value && !loading.value) {
        await loadPosts(true)
      }
    }
    
    // 监听滚动事件
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore.value && !loading.value) {
        loadMorePosts()
      }
    }
    
    // 添加滚动事件监听
    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })
    
    // 清理滚动事件监听
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })


    const hotTopics = ref([
      { id: 1, name: '#手语字母学习', count: 156 },
      { id: 2, name: '#日常对话', count: 89 },
      { id: 3, name: '#学习心得', count: 67 },
      { id: 4, name: '#AI翻译', count: 45 },
      { id: 5, name: '#学习计划', count: 32 },
      { id: 6, name: '#聋健交流', count: 78 },
      { id: 7, name: '#聋人文化', count: 56 },
      { id: 8, name: '#手语差异', count: 43 }
    ])

    const hotChatGroups = ref([])
    const deafHearingGroups = ref([])

    // 加载热门群组
    const loadHotGroups = async () => {
      try {
        const response = await apiService.getHotGroups(5)
        if (response.success) {
          hotChatGroups.value = response.data.groups.map(group => ({
            id: group.id,
            name: group.name,
            members: group.member_count || 0,
            activeToday: Math.floor(Math.random() * 50) + 20, // 模拟今日活跃人数
            avatar: group.avatar
          }))
        }
      } catch (error) {
        console.error('加载热门群组失败:', error)
      }
    }

    // 加载聋健交流组
    const loadDeafHearingGroups = async () => {
      try {
        const response = await apiService.getGroups({ category: '聋健交流' })
        if (response.success) {
          deafHearingGroups.value = response.data.groups.map(group => ({
            id: group.id,
            name: group.name,
            members: group.member_count || 0,
            avatar: group.avatar,
            type: group.category === '聋健交流' ? 'mixed' : 'deaf',
            description: group.description
          }))
        }
      } catch (error) {
        console.error('加载聋健交流组失败:', error)
      }
    }

    // 处理图片上传
    const handleImageUpload = async (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            try {
              // 使用压缩工具处理图片
              const compressedImage = await handleImageUploadWithCompression(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8,
                maxSize: 1024 * 1024 // 1MB
              })
              uploadedImages.value.push({
                id: Date.now() + Math.random(),
                url: compressedImage,
                name: file.name
              })
            } catch (error) {
              ElMessage.error(error.message || '图片上传失败')
            }
          } else {
            ElMessage.warning('请选择图片文件')
          }
        }
      }
    }

    // 处理视频上传
    const handleVideoUpload = (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('video/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              uploadedVideos.value.push({
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name
              })
            }
            reader.readAsDataURL(file)
          } else {
            ElMessage.warning('请选择视频文件')
          }
        })
      }
    }

    // 删除已上传的图片
    const removeImage = (imageId) => {
      uploadedImages.value = uploadedImages.value.filter(img => img.id !== imageId)
    }

    // 删除已上传的视频
    const removeVideo = (videoId) => {
      uploadedVideos.value = uploadedVideos.value.filter(vid => vid.id !== videoId)
    }

    // 发布新帖子
    const publishPost = async () => {
      if (!newPost.value.trim() && uploadedImages.value.length === 0 && uploadedVideos.value.length === 0) {
        ElMessage.warning('请输入内容或上传图片/视频')
        return
      }

      try {
        const response = await apiService.createPost({
          content: newPost.value.trim(),
          privacy: 'public'
        })

        if (response.success) {
          // 清空表单
          newPost.value = ''
          uploadedImages.value = []
          uploadedVideos.value = []

          // 重新加载帖子列表
          await loadPosts()
          ElMessage.success('发布成功！')
        }
      } catch (error) {
        console.error('发布帖子失败:', error)
        ElMessage.error('发布失败，请稍后重试')
      }
    }

    // 切换评论输入框显示
    const toggleCommentInput = (postId) => {
      showCommentInput.value[postId] = !showCommentInput.value[postId]
    }

    // 切换回复输入框显示
    const toggleReplyInput = (postId, commentId) => {
      const key = `${postId}-${commentId}`
      showReplyInput.value[key] = !showReplyInput.value[key]
      if (showReplyInput.value[key]) {
        replyToComment.value[key] = commentId
      }
    }

    // 添加评论
    const addComment = async (postId) => {
      if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
      }

      try {
        const response = await apiService.commentPost(postId, newComment.value.trim())

        if (response.success) {
          // 重新加载帖子列表以获取最新评论
          await loadPosts()
          newComment.value = ''
          showCommentInput.value[postId] = false
          ElMessage.success('评论成功！')
        }
      } catch (error) {
        console.error('评论失败:', error)
        ElMessage.error('评论失败，请稍后重试')
      }
    }

    // 添加回复
    const addReply = async (postId, commentId) => {
      const key = `${postId}-${commentId}`
      const replyContent = replyToComment.value[key] || ''
      
      if (!replyContent.trim()) {
        ElMessage.warning('请输入回复内容')
        return
      }
      
      try {
        const response = await apiService.commentPost(postId, replyContent.trim(), commentId)
        
        if (response.success) {
          // 重新加载帖子列表以获取最新回复
          await loadPosts()
          replyToComment.value[key] = ''
          showReplyInput.value[key] = false
          ElMessage.success('回复成功！')
        }
      } catch (error) {
        console.error('回复失败:', error)
        ElMessage.error('回复失败，请稍后重试')
      }
    }

    // 加入聋健互通小组
    const joinGroup = (group) => {
      ElMessage.success(`正在加入 ${group.name}...`)
      // 跳转到小组聊天页面
      router.push(`/group-chat/${group.id}`)
    }

    // 加入热门群聊
    const joinChatGroup = (group) => {
      ElMessage.success(`正在加入 ${group.name}...`)
      // 跳转到群聊页面
      router.push(`/chat-group/${group.id}`)
    }

    // 查看手语公益星详情（预留入口）
    const viewCharityStar = () => {
      ElMessage.info('后续可以在这里跳转到完整的公益故事详情页')
    }

    // 处理话题标签输入
    const handleHashtagInput = (value) => {
      const text = value || newPost.value
      const cursorPos = text.length
      const beforeCursor = text.substring(0, cursorPos)
      
      // 查找最近的#符号
      const lastHashtagIndex = beforeCursor.lastIndexOf('#')
      if (lastHashtagIndex !== -1) {
        const hashtagText = beforeCursor.substring(lastHashtagIndex + 1)
        // 检查#后面是否只包含字母数字或中文
        if (/^[\u4e00-\u9fa5a-zA-Z0-9]*$/.test(hashtagText) && !hashtagText.includes(' ')) {
          hashtagCursorPosition.value = lastHashtagIndex
          // 过滤热门话题
          hashtagSuggestions.value = hotTopics.value.filter(topic => 
            topic.name.toLowerCase().includes(hashtagText.toLowerCase())
          )
          showHashtagSuggestions.value = true
          newHashtag.value = hashtagText
        } else {
          showHashtagSuggestions.value = false
        }
      } else {
        showHashtagSuggestions.value = false
      }
    }

    // 选择话题标签
    const selectHashtag = (topic) => {
      const beforeCursor = newPost.value.substring(0, hashtagCursorPosition.value)
      const afterCursor = newPost.value.substring(newPost.value.indexOf('#', hashtagCursorPosition.value) + 1)
      const afterHashtag = afterCursor.substring(newHashtag.value.length)
      
      newPost.value = beforeCursor + '#' + topic.name + ' ' + afterHashtag
      showHashtagSuggestions.value = false
    }

    // 创建新话题
    const createNewHashtag = () => {
      if (newHashtag.value.trim()) {
        const beforeCursor = newPost.value.substring(0, hashtagCursorPosition.value)
        const afterCursor = newPost.value.substring(newPost.value.indexOf('#', hashtagCursorPosition.value) + 1)
        const afterHashtag = afterCursor.substring(newHashtag.value.length)
        
        const hashtagName = newHashtag.value.trim()
        newPost.value = beforeCursor + '#' + hashtagName + ' ' + afterHashtag
        
        // 添加到热门话题列表
        hotTopics.value.unshift({
          id: Date.now(),
          name: hashtagName,
          count: 1
        })
        
        showHashtagSuggestions.value = false
        newHashtag.value = ''
        ElMessage.success(`话题 #${hashtagName} 创建成功！`)
      }
    }

    // 跳转到话题页面
    const goToHashtagPage = (topic) => {
      router.push(`/hashtag/${encodeURIComponent(topic.name)}`)
    }

    // 切换点赞状态
    const toggleLike = async (postId) => {
      try {
        const response = await apiService.likePost(postId)

        if (response.success) {
          // 重新加载帖子列表以获取最新点赞数
          await loadPosts()
          ElMessage.success('点赞成功')
        }
      } catch (error) {
        console.error('点赞失败:', error)
        ElMessage.error('点赞失败，请稍后重试')
      }
    }

    // 切换评论点赞状态
    const toggleCommentLike = async (commentId, postId, type) => {
      try {
        const response = await apiService.likeComment(commentId)

        if (response.success) {
          // 重新加载帖子列表以获取最新点赞状态
          await loadPosts()
          ElMessage.success('评论点赞成功')
        }
      } catch (error) {
        console.error('评论点赞失败:', error)
        ElMessage.error('评论点赞失败，请稍后重试')
      }
    }

    // 打开图片模态框
    const openImageModal = (imageUrl) => {
      // 创建一个新的窗口来显示大图
      window.open(imageUrl, '_blank')
    }

    // 查看帖子详情
    const viewPostDetail = (postId) => {
      router.push(`/post/${postId}`)
    }

    return {
      newPost,
      newComment,
      showCommentInput,
      showReplyInput,
      replyToComment,
      uploadedImages,
      uploadedVideos,
      imageInput,
      videoInput,
      showHashtagSuggestions,
      hashtagSuggestions,
      hashtagCursorPosition,
      newHashtag,
      posts,
      currentPage,
      pageSize,
      totalPosts,
      loading,
      hasMore,
      hotTopics,
      hotChatGroups,
      currentCharityStar,
      deafHearingGroups,
      publishPost,
      toggleCommentInput,
      toggleReplyInput,
      addComment,
      addReply,
      handleImageUpload,
      handleVideoUpload,
      removeImage,
      removeVideo,
      joinGroup,
      joinChatGroup,
      viewCharityStar,
      handleHashtagInput,
      selectHashtag,
      createNewHashtag,
      goToHashtagPage,
      toggleLike,
      toggleCommentLike,
      openImageModal,
      viewPostDetail,
      loadMorePosts,
      getAvatarUrl
    }
  },
  mounted() {
    document.title = '我的社区 - 手语教学平台'
  }
}
</script>

<style scoped>
/* 动态渐变背景 */
.animated-gradient {
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  min-height: 100vh;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片美化 */
:deep(.el-card) {
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-card:hover) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px) !important;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 16px 20px !important;
  font-weight: 600 !important;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

/* 按钮美化 */
:deep(.el-button) {
  border-radius: 10px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-button:active) {
  transform: translateY(0) !important;
}

/* 按钮类型美化 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
  border: none !important;
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
}

/* 标签美化 */
:deep(.el-tag) {
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-weight: 500 !important;
}

/* 输入框美化 */
:deep(.el-input__wrapper) {
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-textarea__inner) {
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

/* 头像美化 */
:deep(.el-avatar) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-avatar:hover) {
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 导航链接样式 */
.nav-link {
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #2563eb !important;
}

/* 帖子卡片悬停效果 */
.el-card.hover\:shadow-lg {
  transition: all 0.3s ease;
}

.el-card.hover\:shadow-lg:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-4px) !important;
}

/* 话题标签样式 */
.text-blue-600 {
  transition: all 0.3s ease;
}

.text-blue-600:hover {
  color: #2563eb !important;
  transform: translateX(2px);
}

/* 图片预览样式 */
img.rounded {
  transition: all 0.3s ease;
}

img.rounded:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 视频预览样式 */
video.rounded {
  transition: all 0.3s ease;
}

video.rounded:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 评论区域样式 */
.border-t {
  border-color: rgba(102, 126, 234, 0.2) !important;
}

/* 回复区域样式 */
.border-l-2 {
  border-color: rgba(102, 126, 234, 0.3) !important;
}

/* 图标悬停效果 */
.el-icon {
  transition: all 0.3s ease;
}

.el-icon:hover {
  transform: scale(1.1);
}

/* 热门话题标签样式 */
:deep(.el-tag--warning) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
  border: none !important;
  color: white !important;
}

/* 话题建议框样式 */
.bg-white.border {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(102, 126, 234, 0.2) !important;
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .text-5xl {
    font-size: 2.5rem !important;
  }
  
  .text-xl {
    font-size: 1.125rem !important;
  }
}

@media (max-width: 768px) {
  .text-5xl {
    font-size: 2rem !important;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr !important;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 页脚样式 */
footer {
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

/* 点赞图标动画 */
.text-red-500 {
  animation: likeAnimation 0.3s ease;
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* 加载状态 */
.loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>
