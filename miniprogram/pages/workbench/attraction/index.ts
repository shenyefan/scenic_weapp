import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { listAttractionsByPage, deleteAttractions } from '../../../api/controller/attractions-controller/attractions-controller'
import { listAllTypes } from '../../../api/controller/attractions-type-controller/attractions-type-controller'

const PAGE_SIZE = 10

Page(withInspectionStatus({
  data: {
    role: 'user',
    navBarHeight: 0,
    searchBarHeight: 0,
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    selectedTypeIds: [] as string[],
    typeList: [] as { id: string; typeName: string }[],
    typeOptions: [] as { id: string; label: string }[],
    showTypeFilter: false,
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
    deleteLoading: false,
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    // 从全局读取导航栏高度
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
    this.fetchTypes()
    this.fetchList(1)
  },

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    Promise.allSettled([
      this.fetchTypes(),
      this.fetchList(1),
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async fetchTypes() {
    try {
      const res = await listAllTypes()
      const typeList = (res?.data ?? []).map((t: any) => ({ id: t.id, typeName: t.typeName || '未知类型' }))
      const typeOptions = typeList.map((t) => ({ id: t.id, label: t.typeName }))
      this.setData({ typeList, typeOptions })
    } catch {}
  },

  async fetchList(page: number) {
    if (page !== 1) {
      this.setData({ loadingMore: true })
    }
    const { searchKeyword, selectedTypeIds } = this.data
    try {
      const res = await listAttractionsByPage({
        current: page,
        pageSize: PAGE_SIZE,
        sortField: 'updateTime',
        sortOrder: 'descend',
        search: searchKeyword || undefined,
        attractionsTypeIds: selectedTypeIds.length > 0 ? selectedTypeIds : undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        name: item.attractionsName || '未命名景点',
        image: item.attractionsImage || '',
        description: item.attractionsDescription || '',
        types: (item.types ?? []).map((t: any) => t?.typeName).filter(Boolean),
        inspectorName: item.inspector?.userNickname || item.inspector?.userAccount,
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

  onFilterTap() {
    this.setData({ showTypeFilter: true })
  },

  onFilterConfirm(e: any) {
    const ids: string[] = e?.detail?.value ?? []
    this.setData({
      selectedTypeIds: ids,
      showTypeFilter: false,
      list: [],
      page: 1,
      hasMore: true,
      skeleton: true,
    })
    this.fetchList(1)
  },

  onFilterCancel() {
    this.setData({ showTypeFilter: false })
  },

  onItemTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../attraction-detail/index?id=${id}` })
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../attraction-edit/index?id=${id}` })
  },

  onAddTap() {
    wx.navigateTo({ url: '../attraction-edit/index' })
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
      await deleteAttractions({ id: deleteTargetId })
      const newList = list.filter((item: any) => item.id !== deleteTargetId)
      this.setData({
        list: newList,
        showDeleteDialog: false,
        deleteTargetId: '',
        deleteTargetName: '',
        deleteLoading: false,
      })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      this.setData({ deleteLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  onMapTap() {
    wx.navigateTo({ url: '/pages/map/index?type=attraction' })
  },
}))