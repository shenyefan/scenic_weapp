// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
  },
  onUnhandledRejection(res) {
    const msg = res.reason || '未知错误';
    console.error('[UnhandledRejection]', res.reason);
    wx.showToast({ title: String(msg), icon: 'none', duration: 2500 });
  },
  onError(err) {
    console.error('[GlobalError]', err);
    wx.showToast({ title: '发生意外错误', icon: 'none', duration: 2500 });
  },
})