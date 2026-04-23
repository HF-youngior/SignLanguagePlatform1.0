import { resolveNodeAssetUrl } from '@/utils/runtimeUrls'

export const DEFAULT_AVATAR = new URL('@/assets/logo/logo-zhangzhongyu.svg', import.meta.url).href

export function getAvatarUrl(avatar) {
  console.log('getAvatarUrl called with:', avatar)

  if (!avatar) {
    console.log('Avatar is empty, returning default')
    return DEFAULT_AVATAR
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image')) {
    console.log('Avatar is full URL or base64 data, returning directly')
    return avatar
  }

  const fullUrl = resolveNodeAssetUrl(avatar)
  console.log('Generated avatar URL:', fullUrl)
  return fullUrl
}