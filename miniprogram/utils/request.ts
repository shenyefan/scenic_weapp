const BASE_URL = "https://scenic.suki.icu"

// 微信原生请求封装
export function request<T>(url: string, options: any = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const { method = 'GET', data, params, headers = {}, ...otherOptions } = options
    
    // 处理 GET 请求的参数
    let fullUrl = BASE_URL + url
    if (method === 'GET' && params) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      fullUrl += '?' + queryString
    }
    
    wx.request({
      url: fullUrl,
      method: method as any,
      data: data,
      header: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000,
      success: (res) => {
        resolve(res.data as T)
      },
      fail: (error) => {
        reject(error)
      },
      ...otherOptions
    })
  })
}

export default request