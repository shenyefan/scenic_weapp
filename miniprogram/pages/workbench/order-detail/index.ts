import Toast from 'tdesign-miniprogram/toast/index'
import { getOrderById } from '../../../api/controller/order-controller/order-controller'
import { formatDateTime } from '../../../utils/util'

const STATUS_LABEL_MAP: Record<string, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}
const STATUS_TYPE_MAP: Record<string, string> = {
  pending_payment: 'warning',
  paid: 'primary',
  completed: 'success',
  cancelled: 'default',
  refunded: 'danger',
}
const STATUS_STYLE_MAP: Record<string, { bgColor: string; color: string; qrColor: string; navBgColor: string; icon: string }> = {
  pending_payment: { bgColor: '#FDF3EA', color: '#ED7B2F', qrColor: '#ED7B2F', navBgColor: '#FDF3EA', icon: 'time' },
  paid:            { bgColor: '#EBF0FF', color: '#0052D9', qrColor: '#0052D9', navBgColor: '#EBF0FF', icon: 'check-circle' },
  completed:       { bgColor: '#E8F8F2', color: '#00A870', qrColor: '#00A870', navBgColor: '#E8F8F2', icon: 'check-circle-filled' },
  cancelled:       { bgColor: '#F3F4F6', color: '#6B7785', qrColor: '#6B7785', navBgColor: '#F3F4F6', icon: 'close-circle' },
  refunded:        { bgColor: '#FEECEE', color: '#E34D59', qrColor: '#E34D59', navBgColor: '#FEECEE', icon: 'refresh' },
}

Page({
  data: {
    loading: true,
    role: 'user',
    detail: null as any,
  },

  onLoad(options: any) {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) this.setData({ role: JSON.parse(raw)?.role || 'user' })
    } catch {}
    const id = options?.id
    if (id) {
      this.setData({ _id: id } as any)
      this.fetchDetail(id)
    } else {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '参数错误', theme: 'error' })
    }
  },

  async onPullDownRefresh() {
    const { _id } = this.data as any
    if (_id) await this.fetchDetail(_id)
    wx.stopPullDownRefresh()
  },

  async fetchDetail(id: string) {
    try {
      const res = await getOrderById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      const orderItems = (item.orderItems ?? []) as any[]
      const totalQty = orderItems.reduce((s: number, oi: any) => s + (oi.quantity ?? 1), 0)
      this.setData({
        loading: false,
        detail: {
          id: item.id,
          contactName: item.contactName || '未知',
          contactPhone: item.contactPhone || '',
          visitDate: item.visitDate || '',
          totalPrice: (item.totalPrice ?? 0).toFixed(2),
          statusLabel: STATUS_LABEL_MAP[item.orderStatus || ''] || '未知',
          statusType: STATUS_TYPE_MAP[item.orderStatus || ''] || 'default',
          statusBgColor: STATUS_STYLE_MAP[item.orderStatus || '']?.bgColor || '#F3F4F6',
          statusColor: STATUS_STYLE_MAP[item.orderStatus || '']?.color || '#6B7785',
          qrColor: STATUS_STYLE_MAP[item.orderStatus || '']?.qrColor || '#333',
          statusIcon: STATUS_STYLE_MAP[item.orderStatus || '']?.icon || 'info-circle',
          userName: item.user?.userNickname || item.user?.userAccount || '',
          userPhone: item.user?.userPhone || '',
          createTime: item.createTime ? formatDateTime(item.createTime) : '',
          totalQty,
          orderItems: orderItems.map((oi: any, idx: number) => {
            const name = oi.ticketNameSnapshot || oi.id || `订单项 ${idx + 1}`
            const unitPrice = oi.unitPrice ?? 0
            const quantity = oi.quantity ?? 1
            const subtotal = typeof oi.subtotal === 'number' ? oi.subtotal : unitPrice * quantity
            return {
              ticketName: name,
              quantity,
              unitPrice: unitPrice.toFixed(2),
              subtotal: subtotal.toFixed(2),
            }
          }),
        },
      })
    } catch {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  onEditTap() {
    const { detail } = this.data
    if (!detail) return
    wx.navigateTo({ url: `../order-edit/index?id=${detail.id}` })
  },
})
