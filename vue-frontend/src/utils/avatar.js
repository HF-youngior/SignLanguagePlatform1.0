// 默认头像路径
// 用户需要将默认头像图片放在 public/images/default-avatar.png
export const DEFAULT_AVATAR = '/images/default-avatar.png'

/**
 * 获取用户头像URL
 * @param {string} avatar - 用户头像URL
 * @returns {string} 头像URL，如果为空则返回默认头像
 */
export function getAvatarUrl(avatar) {
  return avatar || DEFAULT_AVATAR
}

