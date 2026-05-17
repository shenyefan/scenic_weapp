import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { deleteType, listAllTypes } from '../../../api/controller/attractions-type-controller/attractions-type-controller'

Page(withInspectionStatus({
  data: {
    skeleton: true,
    list: [] as any[],
    filteredList: [] as any[],
    searchKeyword: '',
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    this.fetchList()
  },

  onPullDownRefresh() {
    this.refreshList().finally(() => wx.stopPullDownRefresh())
  },

  refreshList() {
    this.setData({ skeleton: true })
    return this.fetchList()
  },

  async fetchList() {
    try {
      const res = await listAllTypes()
      const list = (res?.data ?? []).map((item: any) => ({
        id: item.id || '',
        typeName: item.typeName || '未命名类型',
        typeDescription: item.typeDescription || '',
      }))
      this.setData({ list, skeleton: false })
      this.applyFilter()
    } catch {
      this.setData({ skeleton: false, list: [], filteredList: [] })
      Toast({ context: this, selector: '#t-toast', message: '景点类型加载失败', theme: 'error' })
    }
  },

  applyFilter() {
    const keyword = this.data.searchKeyword.trim().toLowerCase()
    const filteredList = keyword
      ? this.data.list.filter((item: any) => [item.typeName, item.typeDescription].some((text) => String(text || '').toLowerCase().includes(keyword)))
      : this.data.list
    this.setData({ filteredList })
  },

  onSearchChange(e: any) {
    const keyword = e?.detail?.value ?? ''
    this.setData({ searchKeyword: keyword })
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this._searchTimer = setTimeout(() => this.applyFilter(), 300)
  },

  onSearchClear() {
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this.setData({ searchKeyword: '' })
    this.applyFilter()
  },

  onAddTap() {
    wx.navigateTo({
      url: '/pages/workbench/attraction-type-edit/index',
      events: { typeChanged: () => this.refreshList() },
    })
  },

  onEditTap(e: any) {
    const { id, name, desc } = e.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/workbench/attraction-type-edit/index?id=${id}&name=${encodeURIComponent(name || '')}&desc=${encodeURIComponent(desc || '')}`,
      events: { typeChanged: () => this.refreshList() },
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
    const { deleteTargetId } = this.data
    try {
      await deleteType({ id: deleteTargetId })
      this.setData({ showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
      this.refreshList()
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  stopPropagation() {},
}))
