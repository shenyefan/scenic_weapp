import Toast from 'tdesign-miniprogram/toast/index'
import { listUserByPage, deleteUser } from '../../../api/controller/user-controller/user-controller'

const PAGE_SIZE = 10

const ROLE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '普通用户', value: 'user' },
  { label: '巡查员', value: 'inspector' },
  { label: '处置员', value: 'disposer' },
  { label: '管理员', value: 'admin' },
  { label: '封禁', value: 'ban' },
]

const ROLE_LABEL_MAP: Record<string, string> = {
  user: '普通用户', inspector: '巡查员', disposer: '处置员', admin: '管理员', ban: '封禁'
}
const ROLE_TYPE_MAP: Record<string, string> = {
  user: 'default', inspector: 'primary', disposer: 'warning', admin: 'success', ban: 'danger'
}

Page({
  data: {
    skeleton: true,
    loadingMore: false,
    list: [] as any[],
    page: 1,
    hasMore: true,
    searchKeyword: '',
    selectedRole: '',
    showRolePicker: false,
    rolePickerValue: [''] as string[],
    roleOptions: ROLE_OPTIONS,
    showDeleteDialog: false,
    deleteTargetId: '',
    deleteTargetName: '',
  },

  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onLoad() {
    this.fetchList(1)
  },

  onReachBottom() { this.loadMore() },

  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1).finally(() => wx.stopPullDownRefresh())
  },

  async fetchList(page: number) {
    if (page !== 1) this.setData({ loadingMore: true })
    const { searchKeyword, selectedRole } = this.data
    try {
      const res = await listUserByPage({
        current: page, pageSize: PAGE_SIZE,
        sortField: 'createTime', sortOrder: 'descend',
        search: searchKeyword || undefined,
        userRole: (selectedRole as any) || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        nickname: item.userNickname || item.userAccount || '未知用户',
        account: item.userAccount || '',
        avatar: item.userAvatar || '',
        phone: item.userPhone || '',
        roleLabel: ROLE_LABEL_MAP[item.userRole] || item.userRole || '未知',
        roleType: ROLE_TYPE_MAP[item.userRole] || 'default',
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

  onRoleFilterTap() {
    this.setData({ rolePickerValue: [this.data.selectedRole], showRolePicker: true })
  },

  onRolePickerCancel() { this.setData({ showRolePicker: false }) },

  onRolePickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    this.setData({ rolePickerValue: [value], selectedRole: value, showRolePicker: false, list: [], page: 1, hasMore: true, skeleton: true })
    this.fetchList(1)
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
      await deleteUser({ id: deleteTargetId })
      this.setData({ list: list.filter((i: any) => i.id !== deleteTargetId), showDeleteDialog: false, deleteTargetId: '', deleteTargetName: '' })
      Toast({ context: this, selector: '#t-toast', message: '删除成功', theme: 'success' })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '删除失败', theme: 'error' })
    }
  },

  onEditTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `../users/edit?id=${id}` })
  },

  stopPropagation() {},
})
