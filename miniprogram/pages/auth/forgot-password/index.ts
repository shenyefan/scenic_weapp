import { resetPassword } from '../../../api/controller/user-controller/user-controller';
import { send } from '../../../api/controller/code-controller/code-controller';
import Message from 'tdesign-miniprogram/message/index';

const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Page({
  data: {
    userEmail: '',
    code: '',
    newPassword: '',
    showPassword: false,
    loading: false,
    sendingCode: false,
    countdown: 0,
  },

  _timer: null as ReturnType<typeof setInterval> | null,

  onUnload() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  onFieldChange(e: WechatMiniprogram.CustomEvent) {
    const field = e.currentTarget.dataset.field as string;
    this.setData({ [field]: e.detail.value } as any);
  },

  onTogglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  async onSendCode() {
    const { userEmail } = this.data;
    if (!userEmail || !emailReg.test(userEmail)) {
      Message.warning({ context: this, offset: [120, 32], content: '请输入有效的邮箱后再获取验证码' });
      return;
    }

    this.setData({ sendingCode: true });
    try {
      await send({ email: userEmail, scene: 'reset' });
      Message.success({ context: this, offset: [120, 32], content: '验证码发送成功' });
      this.setData({ countdown: 60 });
      this._timer = setInterval(() => {
        const c = this.data.countdown - 1;
        if (c <= 0) {
          clearInterval(this._timer!);
          this._timer = null;
        }
        this.setData({ countdown: Math.max(c, 0) });
      }, 1000);
    } catch (err: any) {
      Message.error({ context: this, offset: [120, 32], content: err.message || '发送失败' });
    } finally {
      this.setData({ sendingCode: false });
    }
  },

  async onSubmit() {
    const { userEmail, code, newPassword } = this.data;

    if (!userEmail || !emailReg.test(userEmail)) {
      Message.warning({ context: this, offset: [120, 32], content: '请输入有效的邮箱' });
      return;
    }
    if (!code) {
      Message.warning({ context: this, offset: [120, 32], content: '请输入验证码' });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Message.warning({ context: this, offset: [120, 32], content: '新密码至少需要8个字符' });
      return;
    }

    this.setData({ loading: true });
    try {
      await resetPassword({ userEmail, code, newPassword });
      Message.success({ context: this, offset: [120, 32], content: '密码重置成功' });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (err: any) {
      Message.error({ context: this, offset: [120, 32], content: err.message || '重置失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goSignIn() {
    wx.navigateBack();
  },
});
