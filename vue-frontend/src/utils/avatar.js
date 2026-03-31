// 默认头像路径
export const DEFAULT_AVATAR = '/logo-zhangzhongyu.svg'

/**
 * 获取用户头像URL
 * @param {string} avatar - 用户头像URL
 * @returns {string} 头像URL，如果为空则返回默认头像
 */
export function getAvatarUrl(avatar) {
  console.log('getAvatarUrl called with:', avatar);
  
  if (!avatar) {
    console.log('Avatar is empty, returning default');
    return DEFAULT_AVATAR
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    console.log('Avatar is full URL, returning directly');
    return avatar
  }
  
  // 如果是相对路径，添加后端服务器地址
  const backendUrl = 'http://localhost:8000';
  const fullUrl = `${backendUrl}${avatar}`;
  console.log('Generated avatar URL:', fullUrl);
  return fullUrl
}

