import { logout } from "../../api/controller/user-controller/user-controller";
import Toast from 'tdesign-miniprogram/toast/index';

const roleMap: Record<string, string> = {
  admin: '管理员',
  inspector: '巡查员',
  disposer: '处置员',
  user: '普通用户',
};

Page({
  data: {
    isLoggedIn: false,
    avatarSize: '120rpx',
    showLogoutDialog: false,
    statusBarHeight: 20,
    userInfo: {
      avatar: '',
      nickname: '',
      account: '',
      roleName: '',
    },
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 3 });
    }
    this._loadUserInfo();
  },

  _loadUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({
        isLoggedIn: false,
        userInfo: { avatar: '', nickname: '', account: '', roleName: '' },
      });
      return;
    }
    try {
      const raw = wx.getStorageSync('userInfo');
      const info = raw ? JSON.parse(raw) : null;
      if (info) {
        this.setData({
          isLoggedIn: true,
          userInfo: {
            avatar: info.avatar || '',
            nickname: info.nickname || '',
            account: info.account || '',
            roleName: roleMap[info.role] || info.role || '',
          },
        });
      }
    } catch {
      this.setData({ isLoggedIn: false });
    }
  },

  /** 点击头部区域 */
  onHeaderTap() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/login/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/user/profile/index' });
  },

  /** Grid 项点击 */
  onGridItemTap(e: WechatMiniprogram.TouchEvent) {
    const page = e.currentTarget.dataset.page as string;
    const routeMap: Record<string, string> = {
      profile: '/pages/user/profile/index',
      account: '/pages/user/account/index',
      orders: '/pages/user/orders/index',
      notifications: '/pages/user/notifications/index',
    };
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/login/index' });
      return;
    }
    const url = routeMap[page];
    if (url) {
      wx.navigateTo({ url });
    }
  },

  /** Cell 项点击 */
  onCellTap(e: WechatMiniprogram.TouchEvent) {
    const page = e.currentTarget.dataset.page as string;
    const routeMap: Record<string, string> = {
      agreement: '/pages/user/agreement/index',
      privacy: '/pages/user/privacy/index',
      about: '/pages/user/about/index',
    };
    const url = routeMap[page];
    if (url) {
      wx.navigateTo({ url });
    }
  },

  /** 点击退出登录 */
  onLogoutTap() {
    this.setData({ showLogoutDialog: true });
  },

  /** 确认退出 */
  async onLogoutConfirm() {
    try {
      await logout();
    } catch {
      // 即使接口失败也清除本地状态
    }
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.setData({
      showLogoutDialog: false,
      isLoggedIn: false,
      userInfo: { avatar: '', nickname: '', account: '', roleName: '' },
    });
    Toast({ context: this, selector: '#t-toast', message: '已退出登录', theme: 'success' });
  },

  /** 取消退出 */
  onLogoutCancel() {
    this.setData({ showLogoutDialog: false });
  },
});