import Toast from 'tdesign-miniprogram/toast/index'
import {
  listTaskDisposalsByPage,
  deleteTaskDisposal,
} from '../../../api/controller/task-disposal-controller/task-disposal-controller'

const PAGE_SIZE = 10

const DISPOSAL_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '待处置', value: 'pending' },
  { label: '处理中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已超时', value: 'timeout' },
]

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
    datePickerValue: [] as string[],
    dateYearOptions: [] as { label: string; value: string }[],
    dateMonthOptions: [] as { label: string; value: string }[],
    dateDayOptions: [] as { label: string; value: string }[],
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
    deleteLoading: false,
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
    const { years, months, days } = this._buildDateOptions()
    const now = new Date()
    this.setData({
      dateYearOptions: years,
      dateMonthOptions: months,
      dateDayOptions: days,
      datePickerValue: [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')],
    })
    this.fetchList(1)
  },

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1).finally(() => wx.stopPullDownRefresh())
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, activeTab, selectedDate, role, userId } = this.data
    try {
      const query: any = {
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        disposalStatus: activeTab || undefined,
        taskDate: selectedDate || undefined,
      }
      // disposer 只能看自己的任务
      if (role === 'disposer' && userId) query.disposerId = userId
      const res = await listTaskDisposalsByPage(query)
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        attractionsName: item.attractions?.attractionsName || '未知景点',
        disposerName: item.disposer?.userNickname || item.disposer?.userAccount || '未分配',
        inspectionDescription: item.inspectionTask?.inspectionDescription || '',
        disposalDescription: item.disposalDescription || '',
        disposalStatus: item.disposalStatus || '',
        disposalStatusLabel: this._getStatusLabel(item.disposalStatus),
        disposalStatusType: this._getStatusType(item.disposalStatus),
        taskDate: item.createTime ? item.createTime.slice(0, 10) : '',
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

  _getStatusLabel(status: string) {
    const map: Record<string, string> = {
      pending: '待处置',
      in_progress: '处理中',
      completed: '已完成',
      timeout: '已超时',
    }
    return map[status] || '未知'
  },

  _getStatusType(status: string) {
    const map: Record<string, string> = {
      pending: 'warning',
      in_progress: 'primary',
      completed: 'success',
      timeout: 'danger',
    }
    return map[status] || 'default'
  },

  onDateFilterTap() {
    if (this.data.selectedDate) {
      this.setData({ selectedDate: '', list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
    } else {
      this.setData({ showDatePicker: true })
    }
  },

  onDatePickerCancel() {
    this.setData({ showDatePicker: false })
  },

  onDatePickerConfirm(e: any) {
    const vals: string[] = e.detail.value ?? []
    const date = vals.join('-')
    this.setData({ datePickerValue: vals, selectedDate: date, showDatePicker: false, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  _buildDateOptions() {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years: { label: string; value: string }[] = []
    for (let y = 2020; y <= currentYear + 1; y++) {
      years.push({ label: `${y}年`, value: String(y) })
    }
    const months: { label: string; value: string }[] = []
    for (let m = 1; m <= 12; m++) {
      months.push({ label: `${String(m).padStart(2, '0')}月`, value: String(m).padStart(2, '0') })
    }
    const days: { label: string; value: string }[] = []
    for (let d = 1; d <= 31; d++) {
      days.push({ label: `${String(d).padStart(2, '0')}日`, value: String(d).padStart(2, '0') })
    }
    return { years, months, days }
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

  onTabChange(e: any) {
    const value = e?.detail?.value ?? ''
    this.setData({ activeTab: value, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../disposal-task/index?id=${id}` })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../disposal-task/index?id=${id}` })
  },

  stopPropagation() {},

  onAddTap() {
    wx.navigateTo({ url: '../disposal-task/index' })
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
    this.setData({ deleteLoading: true })
    try {
      await deleteTaskDisposal({ id: deleteTargetId })
      const newList = list.filter((item: any) => item.id !== deleteTargetId)
      this.setData({ list: newList, showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '', deleteLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      this.setData({ deleteLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },
})
