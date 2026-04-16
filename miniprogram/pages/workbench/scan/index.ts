import Toast from 'tdesign-miniprogram/toast/index'
import { getOrderById, updateOrder } from '../../../api/controller/order-controller/order-controller'

const STATUS_META: Record<
  string,
  {
    label: string
    theme: string
    icon: string
    message: string
    primaryText: string
    primaryTheme: string
    primaryDisabled: boolean
    canVerify: boolean
  }
> = {
  pending_payment: {
    label: '待支付',
    theme: 'warning',
    icon: 'time',
    message: '该订单尚未支付，当前不能检票。',
    primaryText: '待支付不可检票',
    primaryTheme: 'warning',
    primaryDisabled: true,
    canVerify: false,
  },
  paid: {
    label: '已支付',
    theme: 'primary',
    icon: 'check-circle',
    message: '订单已支付，可以执行检票。',
    primaryText: '确认检票',
    primaryTheme: 'primary',
    primaryDisabled: false,
    canVerify: true,
  },
  completed: {
    label: '已完成',
    theme: 'success',
    icon: 'check-circle-filled',
    message: '该订单已完成检票，请勿重复操作。',
    primaryText: '已检票',
    primaryTheme: 'success',
    primaryDisabled: true,
    canVerify: false,
  },
  cancelled: {
    label: '已取消',
    theme: 'default',
    icon: 'close-circle',
    message: '该订单已取消，当前不能检票。',
    primaryText: '已取消不可检票',
    primaryTheme: 'default',
    primaryDisabled: true,
    canVerify: false,
  },
  refunded: {
    label: '已退款',
    theme: 'danger',
    icon: 'refresh',
    message: '该订单已退款，当前不能检票。',
    primaryText: '已退款不可检票',
    primaryTheme: 'danger',
    primaryDisabled: true,
    canVerify: false,
  },
  invalid: {
    label: '无效二维码',
    theme: 'danger',
    icon: 'error-circle',
    message: '未识别到有效订单，请确认二维码内容。',
    primaryText: '',
    primaryTheme: 'default',
    primaryDisabled: true,
    canVerify: false,
  },
}

const getTodayDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

Page({
  data: {
    supportCamera: false,
    cameraAuthorized: false,
    permissionDenied: false,
    cameraReady: false,
    resolving: false,
    verifying: false,
    flash: 'off',
    resultSkeleton: [
      [
        { type: 'text', width: '180rpx', height: '28rpx' },
        { type: 'rect', width: '96rpx', height: '40rpx' },
      ],
      { type: 'text', width: '82%', height: '22rpx' },
      [
        { type: 'text', width: '88rpx', height: '22rpx' },
        { type: 'text', width: '260rpx', height: '22rpx' },
      ],
      [
        { type: 'text', width: '88rpx', height: '22rpx' },
        { type: 'text', width: '160rpx', height: '22rpx' },
      ],
      [
        { type: 'text', width: '88rpx', height: '22rpx' },
        { type: 'text', width: '160rpx', height: '22rpx' },
      ],
      [
        { type: 'text', width: '108rpx', height: '24rpx' },
        { type: 'text', width: '148rpx', height: '22rpx' },
      ],
      { type: 'rect', width: '100%', height: '70rpx' },
      { type: 'rect', width: '100%', height: '70rpx' },
      [
        { type: 'rect', width: '48%', height: '72rpx' },
        { type: 'rect', width: '48%', height: '72rpx' },
      ],
    ],
    result: null as any,
  },

  _lastScanText: '',
  _lastScanAt: 0,

  showToast(message: string, theme: 'success' | 'warning' | 'error' | 'primary' = 'primary') {
    Toast({ context: this, selector: '#t-toast', message, theme })
  },

  onLoad() {
    const supportCamera = wx.canIUse('camera.mode')
    this.setData({ supportCamera })
    if (supportCamera) {
      this.ensureCameraPermission()
    } else {
      this.showToast('当前基础库不支持页面内扫码，请使用系统扫码', 'warning')
    }
  },

  onShow() {
    if (this.data.supportCamera && !this.data.cameraAuthorized) {
      this.ensureCameraPermission()
    }
  },

  ensureCameraPermission() {
    wx.getSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.camera']) {
          this.setData({ cameraAuthorized: true, permissionDenied: false })
          return
        }
        wx.authorize({
          scope: 'scope.camera',
          success: () => {
            this.setData({ cameraAuthorized: true, permissionDenied: false })
            this.showToast('相机权限已开启', 'success')
          },
          fail: () => {
            this.setData({
              cameraAuthorized: false,
              permissionDenied: true,
            })
            this.showToast('请先授权相机权限，或使用系统扫码', 'warning')
          },
        })
      },
      fail: () => {
        this.setData({
          cameraAuthorized: false,
          permissionDenied: true,
        })
        this.showToast('相机权限状态获取失败，请打开设置后重试', 'error')
      },
    })
  },

  onCameraInitDone() {
    this.setData({ cameraReady: true })
  },

  onCameraStop() {
    this.setData({ cameraReady: false })
  },

  onCameraError() {
    this.setData({
      cameraAuthorized: false,
      permissionDenied: true,
      cameraReady: false,
    })
    this.showToast('相机不可用，请检查权限后重试', 'error')
  },

  onScanCode(e: any) {
    if (this.data.resolving || this.data.verifying) return
    const rawText = String(e?.detail?.result || '').trim()
    if (!rawText) return
    const now = Date.now()
    if (rawText === this._lastScanText && now - this._lastScanAt < 1500) return
    this._lastScanText = rawText
    this._lastScanAt = now
    this.handleScanPayload(rawText)
  },

  async onManualScanTap() {
    if (this.data.resolving || this.data.verifying) return
    try {
      const res = await wx.scanCode({ onlyFromCamera: true, scanType: ['qrCode'] })
      const rawText = String((res as any)?.result || '').trim()
      if (rawText) this.handleScanPayload(rawText)
    } catch (error: any) {
      if (error?.errMsg?.includes('cancel')) return
      Toast({ context: this, selector: '#t-toast', message: '扫码失败，请重试', theme: 'error' })
    }
  },

  onOpenSettingTap() {
    wx.openSetting({
      success: () => this.ensureCameraPermission(),
    })
  },

  onToggleFlashTap() {
    if (!this.data.supportCamera || !this.data.cameraAuthorized) return
    this.setData({ flash: this.data.flash === 'torch' ? 'off' : 'torch' })
  },

  onCloseResultTap() {
    this.setData({
      result: null,
    })
  },

  onViewOrderTap() {
    const id = this.data.result?.id
    if (!id) return
    wx.navigateTo({ url: `../order-detail/index?id=${id}` })
  },

  async onPrimaryActionTap() {
    const result = this.data.result
    if (!result?.canVerify || !result?.id || this.data.verifying) return
    this.setData({ verifying: true })
    try {
      await updateOrder({ id: result.id, orderStatus: 'completed' as any })
      const refreshedResult = await this.fetchOrderResult(result.id)
      this.setData({
        result: refreshedResult,
        verifying: false,
      })
      this.showToast('检票成功，可继续扫描下一张票', 'success')
    } catch {
      this.setData({ verifying: false })
      this.showToast('检票失败，请重试', 'error')
    }
  },

  async handleScanPayload(rawText: string) {
    const orderId = this.extractOrderId(rawText)
    this.setData({
      resolving: true,
    })

    if (!orderId) {
      this.setData({
        resolving: false,
        result: this.buildInvalidResult(rawText),
      })
      this.showToast('二维码内容无效，请重新扫描', 'error')
      return
    }

    try {
      const result = await this.fetchOrderResult(orderId)
      this.setData({
        resolving: false,
        result,
      })
      this.showToast(
        result.message,
        result.dateMismatch ? 'warning' : result.status === 'paid' ? 'success' : result.valid ? 'warning' : 'error'
      )
    } catch {
      this.setData({
        resolving: false,
        result: this.buildInvalidResult(rawText, '未查询到对应订单，请确认二维码是否正确。'),
      })
      this.showToast('未查询到有效订单，请重新扫描', 'error')
    }
  },

  async fetchOrderResult(orderId: string) {
    const res = await getOrderById({ id: orderId })
    const order = res?.data
    if (!order) throw new Error('order not found')
    return this.buildOrderResult(order)
  },

  buildOrderResult(order: any) {
    const status = String(order?.orderStatus || 'invalid')
    const meta = STATUS_META[status] || STATUS_META.invalid
    const items = (order?.orderItems ?? []).map((item: any, index: number) => {
      const quantity = item?.quantity ?? 1
      const unitPrice = Number(item?.unitPrice ?? 0)
      const subtotal = typeof item?.subtotal === 'number' ? item.subtotal : unitPrice * quantity
      return {
        ticketName: item?.ticketNameSnapshot || item?.id || `门票 ${index + 1}`,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      }
    })
    const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const visitDate = order?.visitDate || ''
    const isVisitDateToday = visitDate ? visitDate === getTodayDate() : true
    const dateMismatch = status === 'paid' && !isVisitDateToday

    return {
      valid: true,
      id: order?.id || '',
      status,
      statusLabel: meta.label,
      statusTheme: meta.theme,
      statusIcon: meta.icon,
      message: dateMismatch ? `游览日期与今日不一致` : meta.message,
      primaryText: meta.primaryText,
      primaryTheme: dateMismatch ? 'warning' : meta.primaryTheme,
      primaryDisabled: meta.primaryDisabled,
      canVerify: meta.canVerify,
      dateMismatch,
      dateMismatchTitle: dateMismatch ? '游览日期与今日不一致' : '',
      dateMismatchMessage: dateMismatch ? `该票预约日期为 ${visitDate}，请仔细确认后再决定是否检票。` : '',
      contactName: order?.contactName || '未知联系人',
      contactPhone: order?.contactPhone || '',
      visitDate,
      totalPrice: Number(order?.totalPrice ?? 0).toFixed(2),
      totalQty,
      orderItems: items,
    }
  },

  buildInvalidResult(rawText: string, message?: string) {
    return {
      valid: false,
      id: '',
      rawText,
      status: 'invalid',
      statusLabel: STATUS_META.invalid.label,
      statusTheme: STATUS_META.invalid.theme,
      statusIcon: STATUS_META.invalid.icon,
      message: message || STATUS_META.invalid.message,
      primaryText: '',
      primaryTheme: 'default',
      primaryDisabled: true,
      canVerify: false,
      dateMismatch: false,
      dateMismatchTitle: '',
      dateMismatchMessage: '',
      contactName: '',
      contactPhone: '',
      visitDate: '',
      totalPrice: '0.00',
      totalQty: 0,
      orderItems: [],
    }
  },

  extractOrderId(rawText: string) {
    const text = String(rawText || '').trim()
    if (!text) return ''

    try {
      const parsed = JSON.parse(text)
      if (typeof parsed === 'string') return parsed.trim()
      if (parsed && typeof parsed === 'object') {
        return String(parsed.orderId || parsed.id || parsed?.data?.orderId || parsed?.data?.id || '').trim()
      }
    } catch {}

    try {
      const url = new URL(text)
      const queryId = url.searchParams.get('orderId') || url.searchParams.get('id')
      if (queryId) return queryId.trim()
      const segments = url.pathname.split('/').filter(Boolean)
      return segments[segments.length - 1] || ''
    } catch {}

    return text.replace(/^order[:：]/i, '').trim()
  },
})
