import Toast from 'tdesign-miniprogram/toast/index'
import { getOrderById, updateOrder } from '../../../api/controller/order-controller/order-controller'

const STATUS_OPTIONS = [
  { label: '待支付', value: 'pending_payment' },
  { label: '已支付', value: 'paid' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
]

Page({
  data: {
    initLoading: false,
    submitting: false,
    showDatePicker: false,
    showStatusPicker: false,
    datePickerValue: [] as string[],
    dateYearOptions: [] as { label: string; value: string }[],
    dateMonthOptions: [] as { label: string; value: string }[],
    dateDayOptions: [] as { label: string; value: string }[],
    statusPickerValue: [''] as string[],
    statusPickerOptions: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
    form: {
      contactName: '',
      contactPhone: '',
      visitDate: '',
      orderStatus: '',
      statusLabel: '',
      totalPriceStr: '',
    },
    orderItems: [] as any[],
    totalQty: 0,
  },

  _editId: '',

  onLoad(options: any) {
    const { years, months, days } = this.buildDateOptions()
    const now = new Date()
    this.setData({
      dateYearOptions: years, dateMonthOptions: months, dateDayOptions: days,
      datePickerValue: [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')],
    })
    if (options?.id) {
      this._editId = options.id
      this.setData({ initLoading: true })
      this.fetchDetail(options.id)
    } else {
      Toast({ context: this, selector: '#t-toast', message: '参数错误', theme: 'error' })
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getOrderById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const status = item.orderStatus || ''
      const statusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label || status
      const visitDate = item.visitDate || ''
      let datePickerValue = this.data.datePickerValue
      if (visitDate) {
        const parts = visitDate.split('-')
        if (parts.length === 3) datePickerValue = parts
      }
      this.setData({
        initLoading: false,
        datePickerValue,
        statusPickerValue: [status],
        form: {
          contactName: item.contactName || '',
          contactPhone: item.contactPhone || '',
          visitDate,
          orderStatus: status,
          statusLabel,
          totalPriceStr: item.totalPrice != null ? String(item.totalPrice) : '',
        },
        orderItems: (item.orderItems ?? []).map((oi: any, idx: number) => {
          const name = (oi as any).ticketNameSnapshot || (oi as any).id || `订单项 ${idx + 1}`
          const unitPrice = (oi as any).unitPrice ?? 0
          const quantity = (oi as any).quantity ?? 1
          const subtotal = typeof (oi as any).subtotal === 'number' ? (oi as any).subtotal : unitPrice * quantity
          return { ticketName: name, unitPrice: unitPrice.toFixed(2), quantity, subtotal: subtotal.toFixed(2) }
        }),
        totalQty: (item.orderItems ?? []).reduce((s: number, oi: any) => s + ((oi as any).quantity ?? 1), 0),
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  buildDateOptions() {
    const now = new Date()
    const years: { label: string; value: string }[] = []
    for (let y = 2020; y <= now.getFullYear() + 2; y++) years.push({ label: `${y}年`, value: String(y) })
    const months: { label: string; value: string }[] = []
    for (let m = 1; m <= 12; m++) months.push({ label: `${String(m).padStart(2, '0')}月`, value: String(m).padStart(2, '0') })
    const days: { label: string; value: string }[] = []
    for (let d = 1; d <= 31; d++) days.push({ label: `${String(d).padStart(2, '0')}日`, value: String(d).padStart(2, '0') })
    return { years, months, days }
  },

  onContactNameChange(e: any) { this.setData({ 'form.contactName': e.detail?.value ?? '' }) },
  onContactPhoneChange(e: any) { this.setData({ 'form.contactPhone': e.detail?.value ?? '' }) },
  onTotalPriceChange(e: any) { this.setData({ 'form.totalPriceStr': e.detail?.value ?? '' }) },

  onDatePickerTap() { this.setData({ showDatePicker: true }) },
  onDatePickerCancel() { this.setData({ showDatePicker: false }) },
  onDatePickerConfirm(e: any) {
    const vals: string[] = e.detail.value ?? []
    const date = vals.join('-')
    this.setData({ datePickerValue: vals, 'form.visitDate': date, showDatePicker: false })
  },

  onStatusPickerTap() { this.setData({ showStatusPicker: true }) },
  onStatusPickerCancel() { this.setData({ showStatusPicker: false }) },
  onStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      statusPickerValue: [value],
      'form.orderStatus': value,
      'form.statusLabel': label,
      showStatusPicker: false,
    })
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.contactName.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入联系人姓名', theme: 'warning' })
      return
    }
    const totalPrice = form.totalPriceStr ? parseFloat(form.totalPriceStr) : undefined
    this.setData({ submitting: true })
    try {
      await updateOrder({
        id: this._editId,
        contactName: form.contactName,
        contactPhone: form.contactPhone || undefined,
        visitDate: form.visitDate || undefined,
        orderStatus: form.orderStatus as any || undefined,
        totalPrice: totalPrice && !isNaN(totalPrice) ? totalPrice : undefined,
      })
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: '保存成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: '保存失败', theme: 'error' })
    }
  },
})
