import Toast from 'tdesign-miniprogram/toast/index';
import { listOrdersByPage, cancelOrder } from '../../../api/controller/order-controller/order-controller';

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const STATUS_THEME: Record<string, string> = {
  pending_payment: 'warning',
  paid: 'primary',
  completed: 'success',
  cancelled: 'default',
  refunded: 'default',
};

Page({
  data: {
    orders: [] as any[],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    showCancelDialog: false,
    cancelTargetId: '',
    statusLabel: STATUS_LABEL,
    statusTheme: STATUS_THEME,
  },

  async onLoad() {
    await this._loadOrders(true);
  },

  async onPullDownRefresh() {
    await this._loadOrders(true);
    wx.stopPullDownRefresh();
  },

  async _loadOrders(reset = false) {
    if (this.data.loading) return;
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: true });
    try {
      const res = await listOrdersByPage({ current: page, pageSize: this.data.pageSize });
      const records = res.data?.records || [];
      const total = res.data?.total || 0;
      const orders = reset ? records : [...this.data.orders, ...records];
      const hasMore = orders.length < total;
      this.setData({ orders, hasMore, page: page + 1 });
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '加载订单失败', theme: 'error' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onLoadMore() {
    if (!this.data.hasMore) return;
    await this._loadOrders(false);
  },

  onCancelTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    this.setData({ cancelTargetId: id, showCancelDialog: true });
  },

  onCancelDialogClose() {
    this.setData({ showCancelDialog: false, cancelTargetId: '' });
  },

  async onCancelConfirm() {
    const { cancelTargetId } = this.data;
    this.setData({ showCancelDialog: false });
    try {
      await cancelOrder({ id: cancelTargetId });
      Toast({ context: this, selector: '#t-toast', message: '订单已取消', theme: 'success' });
      await this._loadOrders(true);
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '取消失败，请重试', theme: 'error' });
    }
  },
});