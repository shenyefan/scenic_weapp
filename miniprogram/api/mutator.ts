const BASE_URL = 'https://scenic.moenya.net'

export type MutatorConfig = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: unknown
  params?: Record<string, any>
  headers?: Record<string, string>
}

function buildUrl(url: string, params?: Record<string, any>) {
  let fullUrl = BASE_URL + url

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
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
        const raw = res.data as any
        const code = Number(raw?.code)

        if (code === 401) {
          wx.removeStorageSync('token')
          const pages = getCurrentPages()
          const currentRoute = pages[pages.length - 1]?.route
          if (currentRoute !== 'pages/auth/login/index') {
            wx.reLaunch({
              url: '/pages/auth/login/index',
            })
          }
          reject(
            Object.assign(new Error(raw?.message || '未登录或登录已失效'), {
              code,
              data: raw,
            })
          )
          return
        }

        if (code && code !== 200) {
          reject(
            Object.assign(new Error(raw?.message || '请求失败'), {
              code,
              data: raw,
            })
          )
          return
        }

        resolve(raw as T)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

export default mutator