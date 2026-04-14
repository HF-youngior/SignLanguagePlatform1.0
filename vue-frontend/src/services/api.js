/**
 * API閺堝秴濮?
 * 閹绘劒绶甸幍鈧張鍫縋I鐠嬪啰鏁ら惃鍕埠娑撯偓閹恒儱褰?
 */

// 閸斻劍鈧浇骞忛崣鏈匬I閸╄櫣顢呴崷鏉挎絻
const getApiBaseUrl = () => {
  const hostname = window.location.hostname
  // 婵″倹鐏夐弰鐥﹐calhost閹?27.0.0.1閿涘奔濞囬悽鈺╫calhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api'
  }
  // 閸氾箑鍨担璺ㄦ暏瑜版挸澧犳い鐢告桨閻ㄥ埅ostname閿涘牐绻栭弽閿嬪閺堥缚顔栭梻顔芥娴兼俺鍤滈崝銊ゅ▏閻劎鏁搁懘鎴犳畱IP閿?
  return `http://${hostname}:8000/api`
}

// API閸╄櫣顢呴崷鏉挎絻
const API_BASE_URL = getApiBaseUrl()

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * 闁氨鏁ょ拠閿嬬湴閺傝纭?
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
        let errorMessage = `璇锋眰澶辫触 (${response.status})`
        try {
          const errorBody = await response.json()
          errorMessage = errorBody.message || errorMessage
        } catch {
          // no-op
        }

        const requestError = new Error(errorMessage)
        requestError.status = response.status
        requestError.endpoint = `${this.baseURL}${url}`
        throw requestError
      }

      return await response.json()
    } catch (error) {
      console.error('API鐠囬攱鐪版径杈Е:', error)
      throw error
    }
  }
  buildQuery(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value)
      }
    })
    return query.toString()
  }
  // ==================== 缁€鎯у隘閻╃鍙?====================

  /**
   * 閼惧嘲褰囩敮鏍х摍閸掓銆?
   */
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/community/posts?${queryString}`)
  }

  /**
   * 閸掓稑缂撶敮鏍х摍
   */
  async createPost(data) {
    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 閼惧嘲褰囬崡鏇氶嚋鐢牕鐡?
   */
  async getPostById(id) {
    return this.request(`/community/posts/${id}`)
  }

  /**
   * 閻愮绂愮敮鏍х摍
   */
  async likePost(id) {
    return this.request(`/community/posts/${id}/like`, {
      method: 'POST'
    })
  }

  /**
   * 鐠囧嫯顔戠敮鏍х摍
   */
  async commentPost(id, content, parentId = null) {
    return this.request(`/community/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId })
    })
  }

  /**
   * 閻愮绂愮拠鍕啈
   */
  async likeComment(id) {
    return this.request(`/community/comments/${id}/like`, {
      method: 'POST'
    })
  }

  /**
   * 濡偓閺屻儴鐦庣拋鐑樻Ц閸氾箒顫﹂悙纭呯
   */
  async checkCommentLike(id) {
    return this.request(`/community/comments/${id}/like`)
  }

  /**
   * 閺囧瓨鏌婄敮鏍х摍
   */
  async updatePost(id, data) {
    return this.request(`/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  // ==================== 缂堟槒鐦ч惄绋垮彠 ====================

  /**
   * 娣囨繂鐡ㄧ紙鏄忕槯鐠佹澘缍?
   */
  async saveTranslation(data) {
    return this.request('/translation/record', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 閼惧嘲褰囩紙鏄忕槯閸樺棗褰?
   */
  async getTranslationHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/translation/records?${queryString}`)
  }

  /**
   * 閸掔娀娅庣紙鏄忕槯鐠佹澘缍?
   */
  async deleteTranslation(id) {
    return this.request(`/translation/${id}`, {
      method: 'DELETE'
    })
  }
  // ==================== 鐎涳缚绡勯惄绋垮彠 ====================

  /**
   * 閼惧嘲褰囩拠鍓р柤閸掓銆?
   */
  async getLessons(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/learning/lessons?${queryString}`)
  }

  /**
   * 閼惧嘲褰囩€涳缚绡勬潻娑樺
   */
  async getLearningProgress() {
    return this.request('/learning/progress')
  }

  /**
   * 閺囧瓨鏌婄€涳缚绡勬潻娑樺
   */
  async updateLearningProgress(lessonId, progress) {
    return this.request(`/learning/progress/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress })
    })
  }
  // ==================== 閻劍鍩涢惄绋垮彠 ====================

  /**
   * 閼惧嘲褰囬悽銊﹀煕娑擃亙姹夌挧鍕灐
   */
  async getUserProfile(userId = null) {
    if (userId) {
      return this.request(`/users/profile/${userId}`)
    }
    return this.request('/users/profile')
  }

  /**
   * 閼惧嘲褰囬悽銊﹀煕鐢牕鐡?
   */
  async getUserPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users/posts?${queryString}`)
  }

  /**
   * 濞ｈ濮炴總钘夊几
   */
  async addFriend(userId) {
    return this.request(`/users/friends/${userId}`, {
      method: 'POST'
    })
  }

  /**
   * 閺囧瓨鏌婇悽銊﹀煕娑擃亙姹夌挧鍕灐
   */
  async updateUserProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * 閼惧嘲褰囬悽銊﹀煕鐢牕鐡?
   */
  async getUserPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users/posts?${queryString}`)
  }
  // ==================== 闁氨鐓￠惄绋垮彠 ====================

  /**
   * 閼惧嘲褰囬柅姘辩叀閸掓銆?
   */
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/notifications?${queryString}`)
  }

  /**
   * 閺嶅洩顔囬柅姘辩叀娑撳搫鍑＄拠?
   */
  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
  }

  /**
   * 閺嶅洩顔囬幍鈧張澶愨偓姘辩叀娑撳搫鍑＄拠?
   */
  async markAllNotificationsAsRead(type = '') {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ type })
    })
  }

  /**
   * 閸掔娀娅庨柅姘辩叀
   */
  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    })
  }
  // ==================== 缂囥倗绮嶉惄绋垮彠API ====================

  /**
   * 閼惧嘲褰囩紘銈囩矋閸掓銆?
   */
  async getGroups(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/groups?${queryString}`)
  }

  /**
   * 閼惧嘲褰囬崡鏇氶嚋缂囥倗绮嶇拠锔藉剰
   */
  async getGroupDetail(id) {
    return this.request(`/groups/${id}`)
  }

  /**
   * 閸掓稑缂撶紘銈囩矋
   */
  async createGroup(data) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 閸旂姴鍙嗙紘銈囩矋
   */
  async joinGroup(id) {
    return this.request(`/groups/${id}/join`, {
      method: 'POST'
    })
  }

  /**
   * 闁偓閸戣櫣鍏㈢紒?
   */
  async leaveGroup(id) {
    return this.request(`/groups/${id}/leave`, {
      method: 'POST'
    })
  }

  /**
   * 鐟欙絾鏆庣紘銈囩矋
   */
  async dissolveGroup(id) {
    return this.request(`/groups/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 鏉烆剝顔€缂囥倓瀵?
   */
  async transferGroupOwnership(groupId, newOwnerId) {
    return this.request(`/groups/${groupId}/transfer-ownership`, {
      method: 'POST',
      body: JSON.stringify({ newOwnerId })
    })
  }

  /**
   * 閺囧瓨鏌婄紘銈囩矋娣団剝浼?
   */
  async updateGroup(groupId, data) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * 閼惧嘲褰囬悽銊﹀煕閸旂姴鍙嗛惃鍕參缂?
   */
  async getMyGroups() {
    return this.request('/groups/user/my-groups')
  }

  /**
   * 閼惧嘲褰囬悜顓㈡，缂囥倗绮?
   */
  async getHotGroups(limit = 5) {
    return this.request(`/groups/hot/list?limit=${limit}`)
  }

  /**
   * 閼惧嘲褰囩紘銈囩矋閸掑棛琚?
   */
  async getGroupCategories() {
    return this.request('/groups/categories/list')
  }

  /**
   * 閼惧嘲褰囩紘銈堜喊濞戝牊浼?
   */
  async getGroupMessages(groupId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/groups/${groupId}/messages?${queryString}`)
  }

  /**
   * 閸欐垿鈧胶鍏㈤懕濠冪Х閹?
   */
  async sendGroupMessage(groupId, data) {
    return this.request(`/groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== 绠＄悊鍛樼浉鍏?====================
  async getAdminStats() {
    return this.request('/admin/stats')
  }

  async getAdminDashboard(days = 7) {
    return this.request(`/admin/dashboard?days=${days}`)
  }

  async getAdminUsers(params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/users${query ? `?${query}` : ''}`)
  }

  async getAdminUserById(id) {
    return this.request(`/admin/users/${id}`)
  }

  async createAdminUser(data) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async toggleAdminUserStatus(id, isActive) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    })
  }

  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    })
  }

  async getAdminPosts(params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/posts${query ? `?${query}` : ''}`)
  }

  async getAdminPostById(id) {
    return this.request(`/admin/posts/${id}`)
  }

  async deleteAdminPost(id) {
    return this.request(`/admin/posts/${id}`, {
      method: 'DELETE'
    })
  }

  async getAdminComments(params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/comments${query ? `?${query}` : ''}`)
  }

  async deleteAdminComment(id) {
    return this.request(`/admin/comments/${id}`, {
      method: 'DELETE'
    })
  }

  async getAdminLogs(params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/logs${query ? `?${query}` : ''}`)
  }

  async getAdminGroups(params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/groups${query ? `?${query}` : ''}`)
  }

  async getAdminGroupById(id) {
    return this.request(`/admin/groups/${id}`)
  }

  async getAdminGroupMessages(groupId, params = {}) {
    const query = this.buildQuery(params)
    return this.request(`/admin/groups/${groupId}/messages${query ? `?${query}` : ''}`)
  }

  async deleteAdminGroup(id) {
    return this.request(`/admin/groups/${id}`, {
      method: 'DELETE'
    })
  }

  async removeAdminGroupMember(groupId, userId) {
    return this.request(`/admin/groups/${groupId}/members/${userId}`, {
      method: 'DELETE'
    })
  }

  async deleteAdminGroupMessage(id) {
    return this.request(`/admin/group-messages/${id}`, {
      method: 'DELETE'
    })
  }
}

// 閸掓稑缂撻崡鏇氱伐
const apiService = new ApiService()

export default apiService

