import Toast from 'tdesign-miniprogram/toast/index'
import { listDisastersByPage } from '../../../api/controller/natural-disasters-controller/natural-disasters-controller'
import { formatDateTime } from '../../../utils/util'

const PAGE_SIZE = 10

const SEVERITY_STYLE_MAP: Record<string, { label: string; theme: string }> = {
  minor: { label: '轻微', theme: 'success' },
  mild: { label: '轻微', theme: 'success' },
  moderate: { label: '一般', theme: 'primary' },
  medium: { label: '一般', theme: 'primary' },
  severe: { label: '重大', theme: 'warning' },
  high: { label: '重大', theme: 'warning' },
  extreme: { label: '极端', theme: 'danger' },
  critical: { label: '极端', theme: 'danger' },
  unknown: { label: '未知', theme: 'default' },
  '轻微': { label: '轻微', theme: 'success' },
  '一般': { label: '一般', theme: 'primary' },
  '重大': { label: '重大', theme: 'warning' },
  '极端': { label: '极端', theme: 'danger' },
  '未知': { label: '未知', theme: 'default' },
}

Page({
  data: {
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    selectedDate: '',
    showDatePicker: false,
    datePickerValue: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
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
    const { searchKeyword, selectedDate } = this.data
    try {
      const res = await listDisastersByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'disastersStartTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        disastersStartTime: selectedDate || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => {
        const severityKey = String(item.disastersSeverity || 'unknown').toLowerCase()
        const severityStyle = SEVERITY_STYLE_MAP[severityKey] || SEVERITY_STYLE_MAP.unknown
        return {
          id: item.id || '',
          title: item.disastersTitle || '未命名灾害',
          severity: severityStyle.label,
          severityTheme: severityStyle.theme,
          description: item.disastersDescription || '暂无描述',
          startTime: item.disastersStartTime ? formatDateTime(item.disastersStartTime) : '—',
          endTime: item.disastersEndTime ? formatDateTime(item.disastersEndTime) : '—',
        }
      })
      const list = page === 1 ? newItems : [...this.data.list, ...newItems]
      this.setData({
        list,
        page,
        hasMore: list.length < total,
        skeleton: false,
        loadingMore: false,
      })
    } catch {
      this.setData({ skeleton: false, loadingMore: false })
      if (page === 1) {
        Toast({ context: this, selector: '#t-toast', message: '灾害信息加载失败', theme: 'error' })
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

  onDateFilterTap() {
    if (this.data.selectedDate) {
      this.setData({ selectedDate: '', list: [], page: 1, hasMore: true, skeleton: true })
      this.fetchList(1)
      return
    }
    this.setData({ showDatePicker: true })
  },

  onDatePickerCancel() {
    this.setData({ showDatePicker: false })
  },

  onDatePickerConfirm(e: any) {
    const selectedDate = String(e.detail?.value ?? '')
    this.setData({
      datePickerValue: selectedDate,
      selectedDate,
      showDatePicker: false,
      list: [],
      page: 1,
      hasMore: true,
      skeleton: true,
    })
    this.fetchList(1)
  },
})
