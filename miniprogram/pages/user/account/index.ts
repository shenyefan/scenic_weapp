import Toast from 'tdesign-miniprogram/toast/index';
import { getLoginUser, updateMyUser } from '../../../api/controller/user-controller/user-controller';
import { send } from '../../../api/controller/code-controller/code-controller';

Page({
  data: {
    originalEmail: '',
    form: {
      userAccount: '',
      userEmail: '',
      userPhone: '',
      userPassword: '',
      code: '',
      emailCode: '',
    },
    isEmailChanged: false,
    needsCode: false,
    showPassword: false,
    codeCountdown: 0,
    emailCountdown: 0,
    submitting: false,
    codeTimer: null as ReturnType<typeof setInterval> | null,
    emailTimer: null as ReturnType<typeof setInterval> | null,
  },

  async onLoad() {
    await this._loadUser();
  },

  onUnload() {
    const { codeTimer, emailTimer } = this.data as any;
    if (codeTimer) clearInterval(codeTimer);
    if (emailTimer) clearInterval(emailTimer);
  },

  async _loadUser() {
    try {
      const res = await getLoginUser();
      const user = res.data || {};
      this.setData({
        originalEmail: user.userEmail || '',
        form: {
          userAccount: user.userAccount || '',
          userEmail: user.userEmail || '',
          userPhone: user.userPhone || '',
          userPassword: '',
          code: '',
          emailCode: '',
        },
      });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '获取用户信息失败', theme: 'error' });
    }
  },

  _checkNeedsCode() {
    const { form, originalEmail } = this.data;
    const isEmailChanged = form.userEmail !== originalEmail;
    const needsCode = isEmailChanged || !!form.userPassword;
    this.setData({ isEmailChanged, needsCode });
  },

  onAccountChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userAccount': e.detail.value });
  },

  onPhoneChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userPhone': e.detail.value });
    this._checkNeedsCode();
  },

  onEmailChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userEmail': e.detail.value });
    this._checkNeedsCode();
  },

  onEmailCodeChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.emailCode': e.detail.value });
  },

  onPasswordChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userPassword': e.detail.value });
    this._checkNeedsCode();
  },

  onCodeChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.code': e.detail.value });
  },

  onTogglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  async onSendCode() {
    const { originalEmail, codeCountdown } = this.data;
    if (codeCountdown > 0) return;
    if (!originalEmail) {
      Toast({ context: this, selector: '#t-toast', message: '您尚未绑定安全邮箱', theme: 'warning' });
      return;
    }
    try {
      await send({ email: originalEmail, scene: 'update_sensitive' });
      Toast({ context: this, selector: '#t-toast', message: '验证码已发送至原安全邮箱', theme: 'success' });
      this._startCodeCountdown();
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '发送失败，请重试', theme: 'error' });
    }
  },

  async onSendEmailCode() {
    const { form, emailCountdown } = this.data;
    if (emailCountdown > 0) return;
    if (!form.userEmail) {
      Toast({ context: this, selector: '#t-toast', message: '请先输入新邮箱', theme: 'warning' });
      return;
    }
    try {
      await send({ email: form.userEmail, scene: 'update_email' });
      Toast({ context: this, selector: '#t-toast', message: '验证码已发送至新邮箱', theme: 'success' });
      this._startEmailCountdown();
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '发送失败，请重试', theme: 'error' });
    }
  },

  _startCodeCountdown() {
    this.setData({ codeCountdown: 60 });
    const timer = setInterval(() => {
      const next = this.data.codeCountdown - 1;
      if (next <= 0) {
        clearInterval(this.data.codeTimer as any);
        this.setData({ codeCountdown: 0, codeTimer: null });
      } else {
        this.setData({ codeCountdown: next });
      }
    }, 1000);
    this.setData({ codeTimer: timer as any });
  },

  _startEmailCountdown() {
    this.setData({ emailCountdown: 60 });
    const timer = setInterval(() => {
      const next = this.data.emailCountdown - 1;
      if (next <= 0) {
        clearInterval(this.data.emailTimer as any);
        this.setData({ emailCountdown: 0, emailTimer: null });
      } else {
        this.setData({ emailCountdown: next });
      }
    }, 1000);
    this.setData({ emailTimer: timer as any });
  },

  async onSubmit() {
    const { form, needsCode, isEmailChanged, submitting } = this.data;
    if (submitting) return;

    if (form.userPassword && form.userPassword.length < 8) {
      Toast({ context: this, selector: '#t-toast', message: '密码至少8位', theme: 'warning' });
      return;
    }
    if (form.userPhone && !/^1[3-9]\d{9}$/.test(form.userPhone)) {
      Toast({ context: this, selector: '#t-toast', message: '手机号格式不正确', theme: 'warning' });
      return;
    }
    if (needsCode && (!form.code || form.code.length < 4)) {
      Toast({ context: this, selector: '#t-toast', message: '请输入原邮箱验证码', theme: 'warning' });
      return;
    }
    if (isEmailChanged && (!form.emailCode || form.emailCode.length < 4)) {
      Toast({ context: this, selector: '#t-toast', message: '请输入新邮箱验证码', theme: 'warning' });
      return;
    }

    const submitData: Record<string, string> = {
      userAccount: form.userAccount,
      userEmail: form.userEmail,
      userPhone: form.userPhone,
    };
    if (form.userPassword) submitData.userPassword = form.userPassword;
    if (needsCode) submitData.code = form.code;
    if (isEmailChanged) submitData.emailCode = form.emailCode;

    this.setData({ submitting: true });
    try {
      await updateMyUser(submitData);
      Toast({ context: this, selector: '#t-toast', message: '账号信息更新成功', theme: 'success' });
      this.setData({
        originalEmail: form.userEmail,
        'form.userPassword': '',
        'form.code': '',
        'form.emailCode': '',
        needsCode: false,
        isEmailChanged: false,
      });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '更新失败，请重试', theme: 'error' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
