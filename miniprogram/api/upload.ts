const BASE_URL = 'https://scenic.moenya.net'

type UploadResult = {
  code?: number
  message?: string
  data?: string
}

/**
 * 上传文件到服务器
 * @param filePath 临时文件路径
 * @param biz 业务类型，如 'avatar' | 'inspection' | 'disposal' ｜ 'publicize' ｜ 'route' ｜ 'attraction'
 */
export function uploadFile(filePath: string, biz: string = 'avatar'): Promise<string> {
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/api/file/upload`,
      filePath,
      name: 'file',
      formData: { biz },
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const data: UploadResult = JSON.parse(res.data)
          if (data.code === 200 && data.data) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
