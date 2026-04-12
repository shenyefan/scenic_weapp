// pages/user/about/index.ts
Page({
  data: {
    version: '1.0.0',
  },

  onLoad() {
    try {
      const info = wx.getAccountInfoSync();
      this.setData({ version: info.miniProgram.version || '1.0.0' });
    } catch {
      // 开发工具下可能无法获取版本号
    }
  },
});