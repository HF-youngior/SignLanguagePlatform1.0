<template>
  <div class="px-4 sm:px-0">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">帖子管理</h2>
    
    <!-- 搜索 -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="postSearch"
          type="text"
          placeholder="搜索帖子标题或内容..."
          class="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="fetchPosts"
        />
        <input
          v-model="postAuthorSearch"
          type="text"
          placeholder="搜索作者..."
          class="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="fetchPosts"
        />
        <input
          v-model="postDateSearch"
          type="date"
          class="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="fetchPosts"
        />
        <button
          @click="fetchPosts"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div class="admin-table-wrap">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="post in posts" :key="post.id">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ post.content }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ post.author_username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ post.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(post.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ post.comment_count || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewPost(post)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                查看
              </button>
              <button
                @click="deletePost(post)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 评论管理 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">评论管理</h3>
      </div>
      <div class="p-4 mb-4">
        <div class="flex gap-4">
          <input
            v-model="commentSearch"
            type="text"
            placeholder="搜索评论内容..."
            class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="fetchComments"
          />
          <button
            @click="fetchComments"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            搜索
          </button>
        </div>
      </div>
      <div class="admin-table-wrap">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论内容</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论者</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属帖子</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="comment in comments" :key="comment.id">
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-xs truncate">{{ comment.content }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ comment.user_username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ comment.post_title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(comment.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewComment(comment)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                查看
              </button>
              <button
                @click="deleteComment(comment)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="showPostDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">帖子详情</h3>
          <button @click="showPostDetail = false" class="text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="currentPost" class="space-y-4">
          <div>
            <h4 class="text-xl font-bold text-gray-900">{{ currentPost.title }}</h4>
            <div class="flex items-center text-sm text-gray-500 mt-2">
              <span>{{ currentPost.author_username }}</span>
              <span class="mx-2">•</span>
              <span>{{ formatDate(currentPost.created_at) }}</span>
              <span class="mx-2">•</span>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {{ currentPost.category }}
              </span>
            </div>
          </div>
          <div class="text-gray-700">{{ currentPost.content }}</div>
          <div v-if="currentPost.image_url" class="mt-4">
            <img :src="currentPost.image_url" class="max-w-full h-auto rounded-md" alt="帖子图片" />
          </div>
          <div class="border-t border-gray-200 pt-4">
            <h5 class="text-lg font-medium text-gray-900 mb-3">评论 ({{ currentComments.length }})</h5>
            <div v-for="comment in currentComments" :key="comment.id" class="mb-4">
              <div class="flex items-start">
                <div class="flex-shrink-0 h-8 w-8">
                  <img
                    v-if="comment.user_avatar"
                    :src="comment.user_avatar"
                    class="h-8 w-8 rounded-full"
                    alt=""
                  />
                  <div v-else class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {{ comment.user_username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">{{ comment.user_username }}</span>
                    <span class="ml-2 text-xs text-gray-500">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <div class="mt-1 text-sm text-gray-700">{{ comment.content }}</div>
                  <button
                    @click="deleteComment(comment)"
                    class="mt-1 text-xs text-red-600 hover:text-red-900"
                  >
                    删除评论
                  </button>
                  <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-6 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start">
                      <div class="flex-shrink-0 h-6 w-6">
                        <img
                          v-if="reply.user_avatar"
                          :src="reply.user_avatar"
                          class="h-6 w-6 rounded-full"
                          alt=""
                        />
                        <div v-else class="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {{ reply.user_username.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="ml-2 flex-1">
                        <div class="flex items-center">
                          <span class="text-xs font-medium text-gray-900">{{ reply.user_username }}</span>
                          <span class="ml-2 text-xs text-gray-500">{{ formatDate(reply.created_at) }}</span>
                        </div>
                        <div class="mt-1 text-xs text-gray-700">{{ reply.content }}</div>
                        <button
                          @click="deleteComment(reply)"
                          class="mt-1 text-xs text-red-600 hover:text-red-900"
                        >
                          删除回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-200 pt-4 flex justify-end">
            <button
              @click="deletePost(currentPost)"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              删除帖子
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  comments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['fetchPosts', 'fetchComments', 'viewPost', 'deletePost', 'deleteComment'])

const postSearch = ref('')
const postAuthorSearch = ref('')
const postDateSearch = ref('')
const commentSearch = ref('')
const showPostDetail = ref(false)
const currentPost = ref(null)
const currentComments = ref([])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const fetchPosts = () => {
  emit('fetchPosts', {
    search: postSearch.value,
    author: postAuthorSearch.value,
    date: postDateSearch.value
  })
}

const fetchComments = () => {
  emit('fetchComments', { search: commentSearch.value })
}

const viewPost = (post) => {
  emit('viewPost', post, (data) => {
    currentPost.value = data.post
    currentComments.value = data.comments
    showPostDetail.value = true
  })
}

const deletePost = (post) => {
  emit('deletePost', post, () => {
    // 刷新帖子列表
    fetchPosts()
  })
}

const deleteComment = (comment) => {
  emit('deleteComment', comment, () => {
    // 刷新评论列表
    fetchComments()
    // 重新获取帖子详情，以便更新评论数
    if (currentPost.value) {
      emit('viewPost', currentPost.value, (data) => {
        currentPost.value = data.post
        currentComments.value = data.comments
      })
    }
  })
}
</script>
