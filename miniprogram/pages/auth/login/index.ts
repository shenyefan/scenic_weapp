import { userLogin } from '../../../api/controller/user-controller/user-controller';
import Message from 'tdesign-miniprogram/message/index';

Page({
  data: {
    userAccount: '',
    userPassword: '',
    showPassword: false,
    loading: false,
  },

  onAccountChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ userAccount: e.detail.value });
  },

  onPasswordChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ userPassword: e.detail.value });
  },

  onTogglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  async onSubmit() {
    const { userAccount, userPassword } = this.data;
    if (!userAccount || userAccount.length < 4) {
      Message.warning({ context: this, offset: [120, 32], content: '账号至少需要4个字符' });
      return;
    }
    if (!userPassword || userPassword.length < 8) {
      Message.warning({ context: this, offset: [120, 32], content: '密码至少需要8个字符' });
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await userLogin({ userAccount, userPassword });
      const data = res.data;
      if (data?.token) {
        wx.setStorageSync('token', data.token);
      }
      if (data) {
        wx.setStorageSync('userInfo', JSON.stringify({
          id: data.id || '',
          account: data.userAccount || '',
          nickname: data.userNickname || '',
          avatar: data.userAvatar || '',
          role: data.userRole || '',
          email: data.userEmail || '',
        }));
      }
      Message.success({ context: this, offset: [120, 32], content: '登录成功' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/user/index' });
      }, 500);
    } catch (err: any) {
      Message.error({ context: this, offset: [120, 32], content: err.message || '登录失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/index' });
  },

  goSignUp() {
    wx.navigateTo({ url: '/pages/auth/register/index' });
  },

  goForgotPassword() {
    wx.navigateTo({ url: '/pages/auth/forgot-password/index' });
  },
});