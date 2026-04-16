import Toast from 'tdesign-miniprogram/toast/index'
import { addOrder } from '../../../api/controller/order-controller/order-controller'

const BUY_CART_STORAGE_KEY = 'ticketBuyCart'

type CartItem = {
  ticketId: string
  ticketName: string
  ticketPrice: number
  ticketImage: string
  ticketDescription: string
  validDays: number
  stockQuantity: number
  quantity: number
  lineTotal?: string
}

Page({
  data: {
    cart: [] as CartItem[],
    totalQty: 0,
    totalAmount: '0.00',
    submitting: false,
    showDatePicker: false,
    datePickerValue: '',
    minVisitDate: '',
    maxVisitDate: '',
    form: {
      contactName: '',
      contactPhone: '',
      visitDate: '',
    },
  },

  onLoad() {
    this.restoreCart()
    this.prefillUserInfo()
    const { minDate, maxDate } = this.buildDateRange()
    this.setData({
      minVisitDate: minDate,
      maxVisitDate: maxDate,
      datePickerValue: minDate,
      'form.visitDate': minDate,
    })
  },

  restoreCart() {
    try {
      const cart = wx.getStorageSync(BUY_CART_STORAGE_KEY)
      const safeCart = (Array.isArray(cart) ? cart : []).map((item: CartItem) => ({
        ...item,
        lineTotal: (item.ticketPrice * item.quantity).toFixed(2),
      }))
      const totalQty = safeCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
      const totalAmount = safeCart.reduce((sum: number, item: CartItem) => sum + item.ticketPrice * item.quantity, 0)
      this.setData({ cart: safeCart, totalQty, totalAmount: totalAmount.toFixed(2) })
    } catch {
      this.setData({ cart: [], totalQty: 0, totalAmount: '0.00' })
    }
  },

  prefillUserInfo() {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (!raw) return
      const info = JSON.parse(raw)
      this.setData({
        'form.contactName': info?.userNickname || info?.userAccount || '',
        'form.contactPhone': info?.userPhone || '',
      })
    } catch {}
  },

  buildDateRange() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setDate(now.getDate() + 7)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return {
      minDate: formatDate(now),
      maxDate: formatDate(end),
    }
  },

  onContactNameChange(e: any) {
    this.setData({ 'form.contactName': e.detail?.value ?? '' })
  },

  onContactPhoneChange(e: any) {
    this.setData({ 'form.contactPhone': e.detail?.value ?? '' })
  },

  onDatePickerTap() {
    this.setData({ showDatePicker: true })
  },

  onDatePickerCancel() {
    this.setData({ showDatePicker: false })
  },

  onDatePickerConfirm(e: any) {
    const value = String(e.detail?.value ?? '')
    this.setData({
      datePickerValue: value,
      showDatePicker: false,
      'form.visitDate': value,
    })
  },

  async onSubmit() {
    const { form, cart } = this.data
    if (cart.length === 0) {
      Toast({ context: this, selector: '#t-toast', message: '请选择门票', theme: 'warning' })
      return
    }
    if (!String(form.contactName).trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入联系人姓名', theme: 'warning' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(String(form.contactPhone).trim())) {
      Toast({ context: this, selector: '#t-toast', message: '请输入正确的手机号码', theme: 'warning' })
      return
    }
    if (!form.visitDate) {
      Toast({ context: this, selector: '#t-toast', message: '请选择游览日期', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      await addOrder({
        contactName: String(form.contactName).trim(),
        contactPhone: String(form.contactPhone).trim(),
        visitDate: form.visitDate,
        items: cart.map((item) => ({ ticketId: item.ticketId, quantity: item.quantity })),
      })
      wx.removeStorageSync(BUY_CART_STORAGE_KEY)
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: '下单成功', theme: 'success' })
      setTimeout(() => wx.redirectTo({ url: '../orders/index' }), 1000)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: '下单失败', theme: 'error' })
    }
  },
})