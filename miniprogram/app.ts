// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
  },
  onError(err: any) {
    console.error('[GlobalError]', err);
    wx.showToast({ title: '未知错误', icon: 'none', duration: 2500 });
  },
})