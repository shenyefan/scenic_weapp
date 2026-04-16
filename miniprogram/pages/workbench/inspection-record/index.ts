import Toast from 'tdesign-miniprogram/toast/index'
import {
  listInspectionTasksByPage,
  updateInspectionTask,
  deleteInspectionTask,
} from '../../../api/controller/task-inspection-controller/task-inspection-controller'

const PAGE_SIZE = 10

const ABNORMAL_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: 'normal' },
  { label: '异常', value: 'abnormal' },
  { label: '待确认', value: 'unknown' },
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
    selectedAbnormalStatus: '',
    showAbnormalPicker: false,
    abnormalPickerValue: [''] as string[],
    abnormalStatusOptions: ABNORMAL_STATUS_OPTIONS,
    selectedDate: '',
    showDatePicker: false,
    datePickerValue: '',
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
    deleteLoading: false,
    showNormalDialog: false,
    normalTargetId: '',
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

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1).finally(() => wx.stopPullDownRefresh())
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, activeTab, selectedAbnormalStatus, selectedDate, role, userId } = this.data
    try {
      const query: any = {
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        taskStatus: activeTab || undefined,
        abnormalStatus: selectedAbnormalStatus || undefined,
        taskDate: selectedDate || undefined,
      }
      // inspector 只能看自己的任务
      if (role === 'inspector' && userId) query.inspectorId = userId
      const res = await listInspectionTasksByPage(query)
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        attractionsName: item.attractions?.attractionsName || '未知景点',
        inspectorName: item.inspector?.userNickname || item.inspector?.userAccount || '未分配',
        taskDate: item.taskDate || '',
        taskStatus: item.taskStatus || '',
        taskStatusLabel: this._getTaskStatusLabel(item.taskStatus),
        taskStatusType: this._getTaskStatusType(item.taskStatus),
        abnormalStatus: item.abnormalStatus || '',
        abnormalStatusLabel: this._getAbnormalStatusLabel(item.abnormalStatus),
        abnormalStatusType: this._getAbnormalStatusType(item.abnormalStatus),
        inspectionDescription: item.inspectionDescription || '',
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

  _getTaskStatusLabel(status: string) {
    const map: Record<string, string> = {
      in_progress: '巡查中',
      waiting_disposal: '待处置',
      completed: '已完成',
      timeout: '已超时',
    }
    return map[status] || '未知'
  },

  _getTaskStatusType(status: string) {
    const map: Record<string, string> = {
      in_progress: 'primary',
      waiting_disposal: 'warning',
      completed: 'success',
      timeout: 'danger',
    }
    return map[status] || 'default'
  },

  _getAbnormalStatusLabel(status: string) {
    const map: Record<string, string> = { unknown: '待确认', normal: '正常', abnormal: '异常' }
    return map[status] || '未知'
  },

  _getAbnormalStatusType(status: string) {
    const map: Record<string, string> = { unknown: 'default', normal: 'success', abnormal: 'danger' }
    return map[status] || 'default'
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

  onDateFilterTap() {
    if (this.data.selectedDate) {
      this.setData({ selectedDate: '', datePickerValue: this.data.datePickerValue, list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
    } else {
      this.setData({ showDatePicker: true })
    }
  },

  onDatePickerCancel() {
    this.setData({ showDatePicker: false })
  },

  onDatePickerConfirm(e: any) {
    const date = String(e.detail?.value ?? '')
    this.setData({ datePickerValue: date, selectedDate: date, showDatePicker: false, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
  },

  onAbnormalFilterTap() {
    this.setData({ abnormalPickerValue: [this.data.selectedAbnormalStatus], showAbnormalPicker: true })
  },

  onAbnormalPickerCancel() {
    this.setData({ showAbnormalPicker: false })
  },

  onAbnormalPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    this.setData({
      abnormalPickerValue: [value],
      selectedAbnormalStatus: value,
      showAbnormalPicker: false,
      list: [],
      page: 1,
      hasMore: true,
      skeleton: true,
    })
    this.fetchList(1)
  },

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../inspection-task/index?id=${id}` })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../inspection-task/index?id=${id}` })
  },

  onAbnormalTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../inspection-task/index?id=${id}&preset=abnormal` })
  },

  onNormalTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    this.setData({ showNormalDialog: true, normalTargetId: id })
  },

  onNormalCancel() {
    this.setData({ showNormalDialog: false, normalTargetId: '' })
  },

  async onNormalConfirm() {
    const { normalTargetId } = this.data
    this.setData({ showNormalDialog: false })
    Toast({ context: this, selector: '#t-toast', message: '提交中...', theme: 'loading', duration: 0 })
    try {
      await updateInspectionTask({ id: normalTargetId, taskStatus: 'completed' as any, abnormalStatus: 'normal' as any })
      const list = this.data.list.map((item: any) =>
        item.id === normalTargetId
          ? { ...item, taskStatus: 'completed', taskStatusLabel: '已完成', taskStatusType: 'success', abnormalStatus: 'normal', abnormalStatusLabel: '正常', abnormalStatusType: 'success' }
          : item
      )
      this.setData({ list, normalTargetId: '' })
      Toast({ context: this, selector: '#t-toast', message: '已标记为正常完成', theme: 'success' })
    } catch {
      this.setData({ normalTargetId: '' })
      Toast({ context: this, selector: '#t-toast', message: '提交失败', theme: 'error' })
    }
  },

  stopPropagation() {},

  onAddTap() {
    wx.navigateTo({ url: '../inspection-task/index' })
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
      await deleteInspectionTask({ id: deleteTargetId })
      const newList = list.filter((item: any) => item.id !== deleteTargetId)
      this.setData({ list: newList, showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '', deleteLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      this.setData({ deleteLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },
})
