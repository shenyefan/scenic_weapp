export type MutatorConfig = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: unknown
  params?: Record<string, any>
  headers?: Record<string, string>
}

type ApiResponse<T = unknown> = {
  code?: number
  message?: string
  data?: T
}

const BASE_URL = 'https://scenic.moenya.net/api'

function buildUrl(url: string, params?: Record<string, any>) {
  let fullUrl = BASE_URL + url

  if (params) {
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')

    if (query) {
      fullUrl += `?${query}`
    }
  }

  return fullUrl
}

export const mutator = async <T>(
  config: MutatorConfig,
  options?: MutatorConfig
): Promise<T> => {
  const finalConfig = {
    ...config,
    ...options,
    headers: {
      ...(config.headers || {}),
      ...(options?.headers || {}),
    },
  }

  // token
  const token = wx.getStorageSync('token')
  if (token) {
    finalConfig.headers = {
      ...finalConfig.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return new Promise<T>((resolve, reject) => {
    wx.request({
      url: buildUrl(finalConfig.url, finalConfig.params),
      method: finalConfig.method || 'GET',
      data: finalConfig.data,
      header: finalConfig.headers,
      success: (res) => {
        const data = res.data as ApiResponse<T>

        if (data && data.code !== undefined && data.code !== 200) {
          reject(
            Object.assign(new Error(data.message), {
              code: data.code,
              data: data.data,
            })
          )
          return
        }

        resolve(data as T)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

export default mutator