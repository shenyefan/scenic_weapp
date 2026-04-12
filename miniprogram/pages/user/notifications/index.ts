import Toast from 'tdesign-miniprogram/toast/index';
import { getMySettings, updateMySettings } from '../../../api/controller/user-notification-setting-controller/user-notification-setting-controller';

Page({
  data: {
    loading: false,
    saving: false,
    role: '',
    settings: {
      notifyInspectionDispatch: false,
      notifyDisposalAssigned: false,
      notifyAbnormalToAdmin: false,
    },
  },

  async onLoad() {
    const raw = wx.getStorageSync('userInfo');
    let role = '';
    if (raw) {
      try {
        role = JSON.parse(raw)?.role || '';
      } catch { /* ignore */ }
    }
    this.setData({ role });

    if (role === 'inspector' || role === 'disposer' || role === 'admin') {
      await this._loadSettings();
    }
  },

  async _loadSettings() {
    this.setData({ loading: true });
    try {
      const res = await getMySettings();
      const s = res.data || {};
      this.setData({
        settings: {
          notifyInspectionDispatch: !!s.notifyInspectionDispatch,
          notifyDisposalAssigned: !!s.notifyDisposalAssigned,
          notifyAbnormalToAdmin: !!s.notifyAbnormalToAdmin,
        },
      });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '获取通知设置失败', theme: 'error' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async _update(patch: Record<string, boolean>) {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try {
      await updateMySettings(patch);
      this.setData({ settings: { ...this.data.settings, ...patch } });
      Toast({ context: this, selector: '#t-toast', message: '设置已更新', theme: 'success' });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '更新失败，请重试', theme: 'error' });
    } finally {
      this.setData({ saving: false });
    }
  },

  onInspectionDispatchChange(e: WechatMiniprogram.CustomEvent) {
    this._update({ notifyInspectionDispatch: e.detail.value });
  },

  onDisposalAssignedChange(e: WechatMiniprogram.CustomEvent) {
    this._update({ notifyDisposalAssigned: e.detail.value });
  },

  onAbnormalToAdminChange(e: WechatMiniprogram.CustomEvent) {
    this._update({ notifyAbnormalToAdmin: e.detail.value });
  },
});