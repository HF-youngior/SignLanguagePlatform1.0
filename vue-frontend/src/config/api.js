import { getNodeApiBaseUrl } from '@/utils/runtimeUrls'

const apiConfig = {
  baseURL: getNodeApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

export default apiConfig
