/**
 * 手语翻译API服务
 * 提供与后端API的通信功能
 */

// API基础地址配置
const API_BASE_URL = 'http://127.0.0.1:5000/api'

class TranslationApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * 检查API健康状态
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API健康检查失败:', error)
      throw error
    }
  }

  /**
   * 检测图片
   * @param {File|Blob} imageFile - 图片文件
   * @param {number} confidence - 置信度阈值
   * @returns {Promise<Object>} 检测结果
   */
  async detectImage(imageFile, confidence = 0.5) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('confidence', confidence.toString())

      const response = await fetch(`${this.baseURL}/detect/image`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '检测失败')
      }

      return result
    } catch (error) {
      console.error('图片检测失败:', error)
      throw error
    }
  }

  /**
   * 检测视频
   * @param {File} videoFile - 视频文件
   * @param {number} confidence - 置信度阈值
   * @returns {Promise<Object>} 检测结果
   */
  async detectVideo(videoFile, confidence = 0.5) {
    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('confidence', confidence.toString())

      const response = await fetch(`${this.baseURL}/detect/video`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '视频检测失败')
      }

      return result
    } catch (error) {
      console.error('视频检测失败:', error)
      throw error
    }
  }

  /**
   * 批量检测图片
   * @param {File[]} imageFiles - 图片文件数组
   * @param {number} confidence - 置信度阈值
   * @returns {Promise<Object>} 检测结果
   */
  async detectBatch(imageFiles, confidence = 0.5) {
    try {
      const formData = new FormData()
      imageFiles.forEach(file => {
        formData.append('images', file)
      })
      formData.append('confidence', confidence.toString())

      const response = await fetch(`${this.baseURL}/detect/batch`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '批量检测失败')
      }

      return result
    } catch (error) {
      console.error('批量检测失败:', error)
      throw error
    }
  }

  /**
   * 保存检测结果
   * @param {Object} saveData - 保存的数据
   * @returns {Promise<Object>} 保存结果
   */
  async saveResults(saveData) {
    try {
      const response = await fetch(`${this.baseURL}/save/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '保存失败')
      }

      return result
    } catch (error) {
      console.error('保存结果失败:', error)
      throw error
    }
  }

  /**
   * 获取模型信息
   * @returns {Promise<Object>} 模型信息
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${this.baseURL}/models/info`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('获取模型信息失败:', error)
      throw error
    }
  }

  /**
   * 下载文件
   * @param {string} filename - 文件名
   * @returns {Promise<Blob>} 文件内容
   */
  async downloadFile(filename) {
    try {
      const response = await fetch(`${this.baseURL}/download/${filename}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('下载文件失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const translationApiService = new TranslationApiService()

export default translationApiService
