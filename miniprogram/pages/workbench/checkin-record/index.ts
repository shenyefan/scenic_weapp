import Toast from 'tdesign-miniprogram/toast/index'
import { listTaskCheckinsByPage, deleteTaskCheckin } from '../../../api/controller/task-checkin-controller/task-checkin-controller'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'
import { formatDateTime } from '../../../utils/util'

const PAGE_SIZE = 10

Page({
  data: {
    role: 'user',
    userId: '',
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    selectedDate: '',
    showDatePicker: false,
    datePickerValue: '',
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
    showUserPicker: false,
    userPickerValue: [''] as string[],
    userOptions: [] as { label: string; value: string }[],
    filterUserId: '',
    filterUserName: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) {
        const info = JSON.parse(raw)
        this.setData({ role: info?.role || 'user', userId: info?.id || '' })
      }
    } catch {}
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
    const { searchKeyword, selectedDate, role, userId, filterUserId } = this.data
    try {
      const query: any = {
        current: page, pageSize: PAGE_SIZE,
        sortField: 'createTime', sortOrder: 'descend',
        search: searchKeyword || undefined,
        createTime: selectedDate || undefined,
      }
      if (role !== 'admin' && userId) query.userId = userId
      else if (filterUserId) query.userId = filterUserId
      const res = await listTaskCheckinsByPage(query)
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        userName: item.user?.userNickname || item.user?.userAccount || '未知用户',
        address: item.checkinAddress || '',
        checkinTime: item.createTime ? formatDateTime(item.createTime) : '—',
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

  onDeleteTap(e: any) {
    const { id, name } = e.currentTarget.dataset
    this.setData({ showDeleteDialog: true, deleteTargetId: id, deleteTargetName: name })
  },

  async loadUserOptions() {
    try {
      const res = await listUserByPage({ current: 1, pageSize: 200, sortField: 'createTime', sortOrder: 'ascend' })
      const records = res?.data?.records ?? []
      const options = [
        { label: '全部人员', value: '' },
        ...records.map((u: any) => ({
          label: u.userNickname || u.userAccount || '未知',
          value: u.id,
        }))
      ]
      this.setData({ userOptions: options })
    } catch {}
  },

  onUserFilterTap() {
    if (this.data.filterUserId) {
      this.setData({ filterUserId: '', filterUserName: '', list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
    } else {
      if (!this.data.userOptions.length) this.loadUserOptions()
      this.setData({ userPickerValue: [this.data.filterUserId], showUserPicker: true })
    }
  },

  onUserPickerCancel() { this.setData({ showUserPicker: false }) },

  onUserPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const opt = this.data.userOptions.find((o: any) => o.value === value)
    this.setData({ filterUserId: value, filterUserName: opt?.label || '', userPickerValue: [value], showUserPicker: false, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  onDeleteCancel() {
    this.setData({ showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
  },

  async onDeleteConfirm() {
    const { deleteTargetId, list } = this.data
    try {
      await deleteTaskCheckin({ id: deleteTargetId })
      this.setData({ list: list.filter((i: any) => i.id !== deleteTargetId), showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  onViewTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../checkin-record/detail?id=${id}` })
  },

  stopPropagation() {},
})
