const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value)

const getWindowOrigin = () => (typeof window === 'undefined' ? '' : window.location.origin)

export function getNodeApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_NODE_API_BASE_URL
  return trimTrailingSlash(configuredBaseUrl || '/api')
}

export function getPythonApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_PYTHON_API_BASE_URL
  return trimTrailingSlash(configuredBaseUrl || '/translation-api')
}

export function getNodeOrigin() {
  const configuredOrigin = import.meta.env.VITE_NODE_BACKEND_ORIGIN
  if (configuredOrigin) {
    return trimTrailingSlash(configuredOrigin)
  }

  const apiBaseUrl = getNodeApiBaseUrl()
  if (isAbsoluteUrl(apiBaseUrl)) {
    const parsedUrl = new URL(apiBaseUrl)
    return `${parsedUrl.protocol}//${parsedUrl.host}`
  }

  return getWindowOrigin()
}

export function resolveNodeAssetUrl(path) {
  if (!path) return ''
  if (isAbsoluteUrl(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(normalizedPath, `${getNodeOrigin()}/`).toString()
}
