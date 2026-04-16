import Toast from 'tdesign-miniprogram/toast/index'
import { listTicketsByPage } from '../../../api/controller/ticket-controller/ticket-controller'

const PAGE_SIZE = 10
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
}

Page({
  data: {
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    cart: [] as CartItem[],
    totalQuantity: 0,
    subtotal: '0.00',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    this.restoreCart()
    this.fetchList(1)
  },

  onShow() {
    this.restoreCart()
    if (!this.data.skeleton) {
      this.fetchList(1)
    }
  },

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1).finally(() => wx.stopPullDownRefresh())
  },

  restoreCart() {
    try {
      const cart = wx.getStorageSync(BUY_CART_STORAGE_KEY)
      const safeCart = Array.isArray(cart) ? cart : []
      this.setData({ cart: safeCart })
      this.syncCartSummary(safeCart)
    } catch {
      this.setData({ cart: [] })
      this.syncCartSummary([])
    }
  },

  persistCart(cart: CartItem[]) {
    wx.setStorageSync(BUY_CART_STORAGE_KEY, cart)
    this.setData({ cart })
    this.syncCartSummary(cart)
  },

  syncCartSummary(cart: CartItem[]) {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.reduce((sum, item) => sum + item.ticketPrice * item.quantity, 0)
    this.setData({ totalQuantity, subtotal: subtotal.toFixed(2) })
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, cart } = this.data
    try {
      const res = await listTicketsByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        ticketStatus: 'on_sale',
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => {
        const cartItem = cart.find((entry) => entry.ticketId === item.id)
        return {
          id: item.id || '',
          name: item.ticketName || '未命名门票',
          price: Number(item.ticketPrice ?? 0),
          description: item.ticketDescription || '暂无门票描述',
          image: item.ticketImage || '',
          validDays: item.validDays ?? 1,
          stockQuantity: item.stockQuantity ?? 0,
          soldOut: (item.stockQuantity ?? 0) <= 0,
          quantity: cartItem?.quantity ?? 0,
        }
      })
      const list = page === 1 ? newItems : [...this.data.list, ...newItems]
      this.setData({ list, page, hasMore: list.length < total, skeleton: false, loadingMore: false })
    } catch {
      this.setData({ skeleton: false, loadingMore: false })
      if (page === 1) {
        Toast({ context: this, selector: '#t-toast', message: '门票加载失败', theme: 'error' })
      }
    }
  },

  loadMore() {
    const { hasMore, loadingMore, page } = this.data
    if (!hasMore || loadingMore) return
    this.fetchList(page + 1)
  },

  onSearchChange(e: any) {
    const keyword = e?.detail?.value ?? ''
    this.setData({ searchKeyword: keyword })
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this._searchTimer = setTimeout(() => {
      this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
    }, 500)
  },

  onSearchClear() {
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this.setData({ searchKeyword: '', list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  onStepperChange(e: any) {
    const { id } = e.currentTarget.dataset
    const ticket = this.data.list.find((item: any) => item.id === id)
    if (!ticket || !ticket.id) return
    const rawValue = Number(e.detail?.value ?? 0)
    const nextQuantity = Math.max(0, Math.min(rawValue, ticket.stockQuantity ?? 0))
    const nextCart = this.data.cart.filter((item) => item.ticketId !== ticket.id)
    if (nextQuantity > 0) {
      nextCart.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        ticketPrice: ticket.price,
        ticketImage: ticket.image,
        ticketDescription: ticket.description,
        validDays: ticket.validDays,
        stockQuantity: ticket.stockQuantity,
        quantity: nextQuantity,
      })
    }
    this.persistCart(nextCart)
    this.setData({
      list: this.data.list.map((item: any) => (item.id === ticket.id ? { ...item, quantity: nextQuantity } : item)),
    })
  },

  onBuyTap() {
    if (this.data.cart.length === 0) {
      Toast({ context: this, selector: '#t-toast', message: '请先选择门票', theme: 'warning' })
      return
    }
    wx.navigateTo({ url: '../buy/index' })
  },
})
