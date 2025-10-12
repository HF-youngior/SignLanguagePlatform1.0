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
            <router-link to="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">👥 我的社区</h1>
          <p class="text-xl text-gray-600">我在这里有话说</p>
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
                    <el-button size="small" icon="Picture" @click="imageInput.click()">图片</el-button>
                    
                    <input
                      ref="videoInput"
                      type="file"
                      accept="video/*"
                      multiple
                      style="display: none"
                      @change="handleVideoUpload"
                    >
                    <el-button size="small" icon="VideoCamera" @click="videoInput.click()">视频</el-button>
                  </div>
                  <el-button type="primary" @click="publishPost">发布</el-button>
                </div>
              </div>
            </el-card>

            <!-- 动态列表 -->
            <div class="space-y-4">
              <el-card v-for="post in posts" :key="post.id" class="hover:shadow-lg transition-shadow">
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
                    </div>
                    <p class="text-gray-700 mb-3">{{ post.content }}</p>
                    
                    <!-- 显示帖子中的图片 -->
                    <div v-if="post.images && post.images.length > 0" class="mb-3">
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <img v-for="image in post.images" :key="image.id" :src="image.url" :alt="image.name" class="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80" @click="openImageModal(image.url)">
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
                        <el-icon class="mr-1" :class="{ 'text-red-500': post.isLiked }"><Like /></el-icon>
                        {{ post.likes }} 点赞
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

                    <!-- 评论列表 -->
                    <div v-if="post.commentList && post.commentList.length > 0" class="border-t pt-4">
                      <div v-for="comment in post.commentList" :key="comment.id" class="mb-4">
                        <div class="flex items-start space-x-3">
                          <el-avatar :size="35" :src="comment.avatar">
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
                                  <el-avatar :size="25" :src="reply.avatar">
                                    {{ reply.username.charAt(0) }}
                                  </el-avatar>
                                  <div class="flex-1">
                                    <div class="flex items-center space-x-2 mb-1">
                                      <span class="font-medium text-xs">{{ reply.username }}</span>
                                      <span v-if="reply.replyTo" class="text-blue-600 text-xs">@{{ reply.replyTo }}</span>
                                      <span class="text-gray-500 text-xs">{{ reply.time }}</span>
                                    </div>
                                    <p class="text-gray-700 text-xs">{{ reply.content }}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
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
                  <el-avatar :size="40" :src="group.avatar" :class="group.type === 'deaf' ? 'ring-2 ring-green-500' : 'ring-2 ring-blue-500'">
                    {{ group.name.charAt(0) }}
                  </el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员</div>
                    <div class="text-xs text-gray-400">{{ group.description }}</div>
                  </div>
                  <el-button size="small" type="success" plain @click="joinGroup(group)">加入</el-button>
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
                  <el-tag size="small" type="danger">{{ topic.count }}</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 热门群聊 -->
            <el-card>
              <template #header>
                <span class="text-lg font-semibold">🔥 热门群聊</span>
              </template>
              <div class="space-y-3">
                <div v-for="group in hotChatGroups" :key="group.id" class="flex items-center space-x-3">
                  <el-avatar :size="40" :src="group.avatar">{{ group.name.charAt(0) }}</el-avatar>
                  <div class="flex-1">
                    <div class="font-medium">{{ group.name }}</div>
                    <div class="text-sm text-gray-500">{{ group.members }} 成员 · {{ group.activeToday }} 今日活跃</div>
                  </div>
                  <el-button size="small" type="primary" plain @click="joinChatGroup(group)">加入</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

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

    const posts = ref([
      {
        id: 1,
        username: '小明',
        level: '初级',
        time: '2小时前',
        content: '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？',
        avatar: '',
        comments: 5,
        likes: 12,
        isLiked: false,
        commentList: [
          {
            id: 1,
            username: '小红',
            content: '很棒！建议多练习基础手势',
            time: '1小时前',
            replies: [
              {
                id: 11,
                username: '小明',
                content: '谢谢建议！',
                time: '30分钟前',
                replyTo: '小红'
              }
            ]
          },
          {
            id: 2,
            username: '老师',
            content: '可以尝试对着镜子练习，观察手势是否标准',
            time: '45分钟前',
            replies: []
          }
        ]
      },
      {
        id: 2,
        username: '小红',
        level: '中级',
        time: '4小时前',
        content: '分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！',
        avatar: '',
        comments: 8,
        likes: 23,
        isLiked: false,
        commentList: [
          {
            id: 3,
            username: '老师',
            content: '非常赞同！质量比数量更重要',
            time: '3小时前',
            replies: []
          }
        ]
      },
      {
        id: 3,
        username: '老师',
        level: '高级',
        time: '6小时前',
        content: '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！',
        avatar: '',
        comments: 15,
        likes: 45,
        isLiked: false,
        commentList: [
          {
            id: 4,
            username: '小明',
            content: '老师，这个手势怎么做？',
            time: '5小时前',
            replies: [
              {
                id: 41,
                username: '老师',
                content: '先做"今天"，然后做"天气"，最后做"很好"',
                time: '4小时前',
                replyTo: '小明'
              }
            ]
          }
        ]
      }
    ])


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

    const hotChatGroups = ref([
      { id: 1, name: '手语日常对话', members: 234, activeToday: 45, avatar: '' },
      { id: 2, name: 'AI翻译讨论组', members: 189, activeToday: 38, avatar: '' },
      { id: 3, name: '聋人文化分享', members: 167, activeToday: 32, avatar: '' },
      { id: 4, name: '手语学习打卡', members: 298, activeToday: 67, avatar: '' },
      { id: 5, name: '新手指南群', members: 145, activeToday: 28, avatar: '' }
    ])

    const deafHearingGroups = ref([
      { id: 1, name: '聋健交流组', members: 120, avatar: '', type: 'mixed', description: '聋人朋友与听力正常朋友交流的平台' },
      { id: 2, name: '聋人文化分享组', members: 80, avatar: '', type: 'deaf', description: '分享聋人文化、艺术、生活经验' },
      { id: 3, name: '手语差异讨论组', members: 95, avatar: '', type: 'mixed', description: '讨论教学手语与聋人实际使用手语的差异' },
      { id: 4, name: '聋人生活现状组', members: 65, avatar: '', type: 'mixed', description: '了解聋人的日常生活、工作、学习现状' }
    ])

    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              uploadedImages.value.push({
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name
              })
            }
            reader.readAsDataURL(file)
          } else {
            ElMessage.warning('请选择图片文件')
          }
        })
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
    const publishPost = () => {
      if (newPost.value.trim() || uploadedImages.value.length > 0 || uploadedVideos.value.length > 0) {
        const currentTime = new Date()
        const newPostObj = {
          id: Date.now(), // 使用时间戳作为唯一ID
          username: '我', // 当前用户
          level: '初级',
          time: '刚刚',
          content: newPost.value.trim(),
          avatar: '',
          comments: 0,
          likes: 0,
          commentList: [],
          images: [...uploadedImages.value],
          videos: [...uploadedVideos.value]
        }
        
        // 将新帖子添加到数组开头
        posts.value.unshift(newPostObj)
        newPost.value = ''
        uploadedImages.value = []
        uploadedVideos.value = []
        ElMessage.success('发布成功！')
      } else {
        ElMessage.warning('请输入内容或上传图片/视频')
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
    const addComment = (postId) => {
      if (newComment.value.trim()) {
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          const newCommentObj = {
            id: Date.now(),
            username: '我',
            content: newComment.value.trim(),
            time: '刚刚',
            replies: []
          }
          
          post.commentList.push(newCommentObj)
          post.comments += 1
          newComment.value = ''
          showCommentInput.value[postId] = false
          ElMessage.success('评论成功！')
        }
      } else {
        ElMessage.warning('请输入评论内容')
      }
    }

    // 添加回复
    const addReply = (postId, commentId) => {
      const key = `${postId}-${commentId}`
      const replyContent = replyToComment.value[key] || ''
      
      if (replyContent.trim()) {
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          const comment = post.commentList.find(c => c.id === commentId)
          if (comment) {
            const newReplyObj = {
              id: Date.now(),
              username: '我',
              content: replyContent.trim(),
              time: '刚刚',
              replyTo: comment.username
            }
            
            comment.replies.push(newReplyObj)
            post.comments += 1
            replyToComment.value[key] = ''
            showReplyInput.value[key] = false
            ElMessage.success('回复成功！')
          }
        }
      } else {
        ElMessage.warning('请输入回复内容')
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

    // 处理话题标签输入
    const handleHashtagInput = (event) => {
      const cursorPos = event.target.selectionStart
      const text = newPost.value
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
    const toggleLike = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        if (post.isLiked) {
          post.likes -= 1
          post.isLiked = false
          ElMessage.success('取消点赞')
        } else {
          post.likes += 1
          post.isLiked = true
          ElMessage.success('点赞成功')
        }
      }
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
      hotTopics,
      hotChatGroups,
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
      handleHashtagInput,
      selectHashtag,
      createNewHashtag,
      goToHashtagPage,
      toggleLike
    }
  },
  mounted() {
    document.title = '我的社区 - 手语教学平台'
  }
}
</script>
