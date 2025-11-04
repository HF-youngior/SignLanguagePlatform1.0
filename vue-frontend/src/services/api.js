/**
 * API服务
 * 提供所有API调用的统一接口
 */

const API_BASE_URL = 'http://localhost:8000/api'

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
  async commentPost(id, content) {
    return this.request(`/community/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }

  // ==================== 翻译相关 ====================

  /**
   * 保存翻译记录
   */
  async saveTranslation(data) {
    return this.request('/translation/save', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取翻译历史
   */
  async getTranslationHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/translation/history?${queryString}`)
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
}

// 创建单例
const apiService = new ApiService()

export default apiService

