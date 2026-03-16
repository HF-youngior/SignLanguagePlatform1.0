// 默认头像路径
export const DEFAULT_AVATAR = '/logo-zhangzhongyu.svg'

/**
 * 获取用户头像URL
 * @param {string} avatar - 用户头像URL
 * @returns {string} 头像URL，如果为空则返回默认头像
 */
export function getAvatarUrl(avatar) {
  return avatar || DEFAULT_AVATAR
}

