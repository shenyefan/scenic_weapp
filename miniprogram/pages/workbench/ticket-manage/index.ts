import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { deleteTicket, listTicketsByPage } from '../../../api/controller/ticket-controller/ticket-controller'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '上架', value: 'on_sale' },
  { label: '下架', value: 'off_sale' },
]

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '草稿',
  on_sale: '上架',
  off_sale: '下架',
}

const STATUS_TYPE_MAP: Record<string, string> = {
  draft: 'default',
  on_sale: 'success',
  off_sale: 'warning',
}

Page(withInspectionStatus({
  data: {
    navBarHeight: 0,
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    selectedStatus: '',
    showStatusPicker: false,
    statusPickerValue: [''] as string[],
    statusOptions: STATUS_OPTIONS,
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    const navBarHeight = getApp<IAppOption>().globalData?.navBarHeight ?? 0
    this.setData({ navBarHeight })
    this.fetchList(1)
  },

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.refreshList().finally(() => wx.stopPullDownRefresh())
  },

  refreshList() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    return this.fetchList(1)
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, selectedStatus } = this.data
    try {
      const res = await listTicketsByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        ticketStatus: (selectedStatus as any) || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => {
        const status = item.ticketStatus || 'draft'
        return {
          id: item.id || '',
          name: item.ticketName || '未命名门票',
          price: Number(item.ticketPrice ?? 0).toFixed(2),
          description: item.ticketDescription || '',
          image: item.ticketImage || '',
          validDays: item.validDays ?? 1,
          stockQuantity: item.stockQuantity ?? 0,
          status,
          statusLabel: STATUS_LABEL_MAP[status] || status,
          statusType: STATUS_TYPE_MAP[status] || 'default',
        }
      })
      const list = page === 1 ? newItems : [...this.data.list, ...newItems]
      this.setData({ list, page, hasMore: list.length < total, skeleton: false, loadingMore: false })
    } catch {
      this.setData({ skeleton: false, loadingMore: false })
      if (page === 1) Toast({ context: this, selector: '#t-toast', message: '门票加载失败', theme: 'error' })
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
      this.refreshList()
    }, 500)
  },

  onSearchClear() {
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this.setData({ searchKeyword: '' })
    this.refreshList()
  },

  onStatusFilterTap() {
    this.setData({ statusPickerValue: [this.data.selectedStatus], showStatusPicker: true })
  },

  onStatusPickerCancel() {
    this.setData({ showStatusPicker: false })
  },

  onStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    this.setData({
      statusPickerValue: [value],
      selectedStatus: value,
      showStatusPicker: false,
    })
    this.refreshList()
  },

  onAddTap() {
    wx.navigateTo({
      url: '/pages/workbench/ticket-edit/index',
      events: { ticketChanged: () => this.refreshList() },
    })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/workbench/ticket-edit/index?id=${id}`,
      events: { ticketChanged: () => this.refreshList() },
    })
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
      await deleteTicket({ id: deleteTargetId })
      this.setData({
        list: list.filter((item: any) => item.id !== deleteTargetId),
        showDeleteDialog: false,
        deleteTargetId: '',
        deleteTargetName: '',
      })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  stopPropagation() {},
}))
