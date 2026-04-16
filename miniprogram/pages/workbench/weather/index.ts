import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { listWeatherByPage } from '../../../api/controller/natural-weather-controller/natural-weather-controller'
import { formatDateTime } from '../../../utils/util'

const PAGE_SIZE = 10

const formatMetric = (value: number | null | undefined, unit: string) => {
  if (value == null) return '—'
  return `${value}${unit}`
}

Page(withInspectionStatus({
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
      const res = await listWeatherByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'weatherTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        weatherTime: selectedDate || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id || '',
        weatherTime: item.weatherTime ? formatDateTime(item.weatherTime) : '—',
        tempText: formatMetric(item.temp, '℃'),
        humidityText: formatMetric(item.humidity, '%'),
        pressureText: formatMetric(item.pressure, 'hPa'),
        windSpeedText: formatMetric(item.windSpeed, 'm/s'),
        windDegText: formatMetric(item.windDeg, '°'),
        rainText: formatMetric(item.rain, 'mm'),
        createTime: item.createTime ? formatDateTime(item.createTime) : '—',
        updateTime: item.updateTime ? formatDateTime(item.updateTime) : '—',
      }))
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
        Toast({ context: this, selector: '#t-toast', message: '天气信息加载失败', theme: 'error' })
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
}))