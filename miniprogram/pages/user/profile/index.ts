import Toast from 'tdesign-miniprogram/toast/index';
import { getLoginUser, updateMyUser } from '../../../api/controller/user-controller/user-controller';
import { uploadFile } from '../../../api/upload';

const genderOptions = [
  { label: '未设置', value: '' },
  { label: '男', value: '男' },
  { label: '女', value: '女' },
];

Page({
  data: {
    form: {
      userAvatar: '',
      userNickname: '',
      userGender: '',
      userBirthDate: '',
      userProfile: '',
    },
    genderOptions,
    genderLabel: '未设置',
    today: new Date().toISOString().slice(0, 10),
    genderPickerVisible: false,
    birthdayPickerVisible: false,
    submitting: false,
  },

  async onLoad() {
    await this._loadUser();
  },

  async _loadUser() {
    try {
      const res = await getLoginUser();
      const user = res.data || {};
      const genderVal = user.userGender || '';
      this.setData({
        form: {
          userAvatar: user.userAvatar || '',
          userNickname: user.userNickname || '',
          userGender: genderVal,
          userBirthDate: user.userBirthDate || '',
          userProfile: user.userProfile || '',
        },
        genderLabel: this._getGenderLabel(genderVal),
      });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '获取用户信息失败', theme: 'error' });
    }
  },

  _getGenderLabel(val: string) {
    return val || '未设置';
  },
  
  async onChooseAvatar(e: WechatMiniprogram.CustomEvent) {
    const tempFilePath: string = e.detail.avatarUrl;
    if (!tempFilePath) return;
    try {
      const url = await uploadFile(tempFilePath, 'avatar');
      this.setData({ 'form.userAvatar': url });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '头像上传失败', theme: 'error' });
    }
  },

  onNicknameChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userNickname': e.detail.value });
  },

  onProfileChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ 'form.userProfile': e.detail.value });
  },

  onGenderTap() {
    this.setData({ genderPickerVisible: true });
  },

  onGenderConfirm(e: WechatMiniprogram.CustomEvent) {
    const val = e.detail.value[0] as string;
    this.setData({
      'form.userGender': val,
      genderLabel: this._getGenderLabel(val),
      genderPickerVisible: false,
    });
  },

  onGenderCancel() {
    this.setData({ genderPickerVisible: false });
  },

  onBirthDateTap() {
    this.setData({ birthdayPickerVisible: true });
  },

  onBirthDateConfirm(e: WechatMiniprogram.CustomEvent) {
    const val = e.detail.value as string;
    this.setData({
      'form.userBirthDate': val,
      birthdayPickerVisible: false,
    });
  },

  onBirthDateCancel() {
    this.setData({ birthdayPickerVisible: false });
  },

  async onSubmit() {
    const { form, submitting } = this.data;
    if (submitting) return;

    if (!form.userNickname || form.userNickname.length < 2) {
      Toast({ context: this, selector: '#t-toast', message: '昵称至少2个字符', theme: 'warning' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await updateMyUser(form);
      // 同步本地 userInfo
      const raw = wx.getStorageSync('userInfo');
      if (raw) {
        const info = JSON.parse(raw);
        info.nickname = form.userNickname;
        info.avatar = form.userAvatar;
        wx.setStorageSync('userInfo', JSON.stringify(info));
      }
      Toast({ context: this, selector: '#t-toast', message: '保存成功', theme: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '保存失败，请重试', theme: 'error' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
