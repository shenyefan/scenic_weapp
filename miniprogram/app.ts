// app.ts
App<IAppOption>({
  globalData: {
    navBarHeight: 0,
  },
  onLaunch() {
    // 计算导航栏高度 = 状态栏高度 + 胶囊按钮区域，供全局使用
    try {
      const { statusBarHeight = 0 } = wx.getSystemInfoSync()
      const menuButton = wx.getMenuButtonBoundingClientRect()
      this.globalData.navBarHeight = menuButton.bottom + (menuButton.top - statusBarHeight)
    } catch {}
  },
  onError(err: any) {
    console.error('[GlobalError]', err);
    wx.showToast({ title: '未知错误', icon: 'none', duration: 2500 });
  },
})