interface UploadParams {
  filePath: string;
  biz: string;
}

interface UploadResponse {
  code: number;
  message: string;
  data: any;
}

export function uploadFile(params: UploadParams): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const domain = 'https://scenic.moenya.net';
    
    wx.uploadFile({
      url: `${domain}/api/file/upload`,
      filePath: params.filePath,
      name: 'file',
      formData: {
        biz: params.biz,
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const serverData: UploadResponse = JSON.parse(res.data);
            resolve(serverData);
          } catch (e) {
            reject({ message: '解析服务器响应失败', error: e });
          }
        } else {
          reject({ message: `服务器错误: ${res.statusCode}`, response: res });
        }
      },

      fail: (err) => {
        reject({ message: '上传请求失败', error: err });
      }
    });
  });
}