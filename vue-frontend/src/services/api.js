/**
 * API服务
 * 提供所有API调用的统一接口
 */

// 动态获取API基础地址
const getApiBaseUrl = () => {
  const hostname = window.location.hostname
  // 如果是localhost或127.0.0.1，使用localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api'
  }
  // 否则使用当前页面的hostname（这样手机访问时会自动使用电脑的IP）
  return `http://${hostname}:8000/api`
}

// API基础地址
const API_BASE_URL = getApiBaseUrl()

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * 通用请求方法
   */
  async request(url, options = {}) {
    try {
      const token = localStorage.getItem('token')
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '请求失败')
      }

      return await response.json()
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }

  // ==================== 社区相关 ====================

  /**
   * 获取帖子列表
   */
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/community/posts?${queryString}`)
  }

  /**
   * 创建帖子
   */
  async createPost(data) {
    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取单个帖子
   */
  async getPostById(id) {
    return this.request(`/community/posts/${id}`)
  }

  /**
   * 点赞帖子
   */
  async likePost(id) {
    return this.request(`/community/posts/${id}/like`, {
      method: 'POST'
    })
  }

  /**
   * 评论帖子
   */
  async commentPost(id, content, parentId = null) {
    return this.request(`/community/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId })
    })
  }

  /**
   * 点赞评论
   */
  async likeComment(id) {
    return this.request(`/community/comments/${id}/like`, {
      method: 'POST'
    })
  }

  /**
   * 检查评论是否被点赞
   */
  async checkCommentLike(id) {
    return this.request(`/community/comments/${id}/like`)
  }

  /**
   * 更新帖子
   */
  async updatePost(id, data) {
    return this.request(`/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ==================== 翻译相关 ====================

  /**
   * 保存翻译记录
   */
  async saveTranslation(data) {
    return this.request('/translation/record', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取翻译历史
   */
  async getTranslationHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/translation/records?${queryString}`)
  }

  /**
   * 删除翻译记录
   */
  async deleteTranslation(id) {
    return this.request(`/translation/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== 学习相关 ====================

  /**
   * 获取课程列表
   */
  async getLessons(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/learning/lessons?${queryString}`)
  }

  /**
   * 获取学习进度
   */
  async getLearningProgress() {
    return this.request('/learning/progress')
  }

  /**
   * 更新学习进度
   */
  async updateLearningProgress(lessonId, progress) {
    return this.request(`/learning/progress/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress })
    })
  }

  // ==================== 用户相关 ====================

  /**
   * 获取用户个人资料
   */
  async getUserProfile(userId = null) {
    if (userId) {
      return this.request(`/users/profile/${userId}`)
    }
    return this.request('/users/profile')
  }

  /**
   * 获取用户帖子
   */
  async getUserPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users/posts?${queryString}`)
  }

  /**
   * 添加好友
   */
  async addFriend(userId) {
    return this.request(`/users/friends/${userId}`, {
      method: 'POST'
    })
  }

  /**
   * 更新用户个人资料
   */
  async updateUserProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取用户帖子
   */
  async getUserPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users/posts?${queryString}`)
  }

  // ==================== 通知相关 ====================

  /**
   * 获取通知列表
   */
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/notifications?${queryString}`)
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
  }

  /**
   * 标记所有通知为已读
   */
  async markAllNotificationsAsRead(type = '') {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ type })
    })
  }

  /**
   * 删除通知
   */
  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== 群组相关API ====================

  /**
   * 获取群组列表
   */
  async getGroups(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/groups?${queryString}`)
  }

  /**
   * 获取单个群组详情
   */
  async getGroupDetail(id) {
    return this.request(`/groups/${id}`)
  }

  /**
   * 创建群组
   */
  async createGroup(data) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 加入群组
   */
  async joinGroup(id) {
    return this.request(`/groups/${id}/join`, {
      method: 'POST'
    })
  }

  /**
   * 退出群组
   */
  async leaveGroup(id) {
    return this.request(`/groups/${id}/leave`, {
      method: 'POST'
    })
  }

  /**
   * 解散群组
   */
  async dissolveGroup(id) {
    return this.request(`/groups/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 转让群主
   */
  async transferGroupOwnership(groupId, newOwnerId) {
    return this.request(`/groups/${groupId}/transfer-ownership`, {
      method: 'POST',
      body: JSON.stringify({ newOwnerId })
    })
  }

  /**
   * 更新群组信息
   */
  async updateGroup(groupId, data) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取用户加入的群组
   */
  async getMyGroups() {
    return this.request('/groups/user/my-groups')
  }

  /**
   * 获取热门群组
   */
  async getHotGroups(limit = 5) {
    return this.request(`/groups/hot/list?limit=${limit}`)
  }

  /**
   * 获取群组分类
   */
  async getGroupCategories() {
    return this.request('/groups/categories/list')
  }

  /**
   * 获取群聊消息
   */
  async getGroupMessages(groupId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/groups/${groupId}/messages?${queryString}`)
  }

  /**
   * 发送群聊消息
   */
  async sendGroupMessage(groupId, data) {
    return this.request(`/groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// 创建单例
const apiService = new ApiService()

export default apiService

