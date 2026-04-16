import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { listRoutesByPage, deleteRoute } from '../../../api/controller/attractions-route-controller/attractions-route-controller'

const PAGE_SIZE = 10

Page(withInspectionStatus({
  data: {
    role: 'user',
    navBarHeight: 0,
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
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
        this.setData({ role: info?.role || 'user', navBarHeight })
      } else {
        this.setData({ navBarHeight })
      }
    } catch {
      this.setData({ navBarHeight })
    }
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
    const { searchKeyword } = this.data
    try {
      const res = await listRoutesByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'updateTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        name: item.routeName || '未命名路线',
        image: item.routeImage || '',
        description: item.routeDescription || '',
        duration: item.estimatedDurationMinutes ?? 0,
        itemCount: item.routeItems?.length ?? 0,
      }))
      const list = page === 1 ? newItems : [...this.data.list, ...newItems]
      this.setData({ list, page, hasMore: list.length < total, skeleton: false, loadingMore: false })
    } catch {
      this.setData({ skeleton: false, loadingMore: false })
      if (page === 1) {
        Toast({ context: this, selector: '#t-toast', message: '数据加载失败', theme: 'error' })
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

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../route-detail/index?id=${id}` })
  },

  onAddTap() {
    wx.navigateTo({ url: '../route-edit/index' })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../route-edit/index?id=${id}` })
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
      await deleteRoute({ id: deleteTargetId })
      const newList = list.filter((item: any) => item.id !== deleteTargetId)
      this.setData({ list: newList, showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },
}))