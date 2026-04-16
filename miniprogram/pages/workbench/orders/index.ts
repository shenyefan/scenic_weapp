import Toast from 'tdesign-miniprogram/toast/index'
import { listOrdersByPage, deleteOrder } from '../../../api/controller/order-controller/order-controller'
import { formatDateTime } from '../../../utils/util'

const PAGE_SIZE = 10

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

Page({
  data: {
    role: 'user',
    userId: '',
    navBarHeight: 0,
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    activeTab: '',
    selectedDate: '',
    showDatePicker: false,
    datePickerValue: '',
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    const navBarHeight = getApp<IAppOption>().globalData?.navBarHeight ?? 0
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) {
        const info = JSON.parse(raw)
        this.setData({ role: info?.role || 'user', userId: info?.id || '', navBarHeight })
      } else {
        this.setData({ navBarHeight })
      }
    } catch {
      this.setData({ navBarHeight })
    }
    const now = new Date()
    this.setData({
      datePickerValue: `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    })
    this.fetchList(1)
  },

  onReachBottom() { this.loadMore() },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1).finally(() => wx.stopPullDownRefresh())
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, selectedDate, activeTab, role, userId } = this.data
    try {
      const query: any = {
        current: page, pageSize: PAGE_SIZE,
        sortField: 'createTime', sortOrder: 'descend',
        visitDate: selectedDate || undefined,
        orderStatus: activeTab || undefined,
      }
      if (searchKeyword) {
        query.contactName = searchKeyword
        query.contactPhone = searchKeyword
      }
      if (role !== 'admin' && userId) query.userId = userId
      const res = await listOrdersByPage(query)
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        contactName: item.contactName || '未知联系人',
        contactPhone: item.contactPhone || '',
        visitDate: item.visitDate || '',
        totalPrice: (item.totalPrice ?? 0).toFixed(2),
        orderStatus: item.orderStatus || '',
        statusLabel: STATUS_LABEL_MAP[item.orderStatus] || item.orderStatus || '未知',
        statusType: STATUS_TYPE_MAP[item.orderStatus] || 'default',
        userName: item.user?.userNickname || item.user?.userAccount || '',
        createTime: item.createTime ? formatDateTime(item.createTime) : '',
        ticketSummary: (() => {
          const items = (item.orderItems ?? []) as any[]
          if (items.length === 0) return ''
          const totalQty = items.reduce((s: number, oi: any) => s + (oi.quantity ?? 1), 0)
          const firstName = items[0]?.ticketNameSnapshot || ''
          if (items.length === 1 && firstName) return `${firstName} 共${totalQty}张`
          return firstName ? `${firstName}等共${totalQty}张` : `共${totalQty}张`
        })(),
      }))
      const list = page === 1 ? newItems : [...this.data.list, ...newItems]
      this.setData({ list, page, hasMore: list.length < total, skeleton: false, loadingMore: false })
    } catch {
      this.setData({ skeleton: false, loadingMore: false })
      if (page === 1) Toast({ context: this, selector: '#t-toast', message: '数据加载失败', theme: 'error' })
    }
  },

  loadMore() {
    const { hasMore, loadingMore, page } = this.data
    if (!hasMore || loadingMore) return
    this.fetchList(page + 1)
  },

  onTabChange(e: any) {
    const val = e.detail.value
    this.setData({ activeTab: val, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
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

  onDateFilterTap() {
    if (this.data.selectedDate) {
      this.setData({ selectedDate: '', list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
    } else {
      this.setData({ showDatePicker: true })
    }
  },

  onDatePickerCancel() { this.setData({ showDatePicker: false }) },

  onDatePickerConfirm(e: any) {
    const date = String(e.detail?.value ?? '')
    this.setData({ datePickerValue: date, selectedDate: date, showDatePicker: false, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../order-detail/index?id=${id}` })
  },

  onViewTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../order-detail/index?id=${id}` })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../order-edit/index?id=${id}` })
  },

  onDeleteTap(e: any) {
    const { id, name } = e.currentTarget.dataset
    this.setData({ showDeleteDialog: true, deleteTargetId: id, deleteTargetName: name })
  },

  onDeleteCancel() {
    this.setData({ showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
  },

  async onDeleteConfirm() {
    const { deleteTargetId, list } = this.data
    try {
      await deleteOrder({ id: deleteTargetId })
      this.setData({ list: list.filter((i: any) => i.id !== deleteTargetId), showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  stopPropagation() {},
})
