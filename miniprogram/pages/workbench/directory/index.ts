import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'

const PAGE_SIZE = 20

const ROLE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '巡查员', value: 'inspector' },
  { label: '处置员', value: 'disposer' },
  { label: '管理员', value: 'admin' },
]

const ROLE_LABEL_MAP: Record<string, string> = {
  user: '普通用户', inspector: '巡查员', disposer: '处置员', admin: '管理员', ban: '封禁'
}
const ROLE_TYPE_MAP: Record<string, string> = {
  user: 'default', inspector: 'primary', disposer: 'warning', admin: 'success', ban: 'danger'
}

Page(withInspectionStatus({
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
        sortField: 'createTime', sortOrder: 'ascend',
        search: searchKeyword || undefined,
        userRole: (selectedRole as any) || undefined,
      })
      const records = res?.data?.records ?? []
      const total = res?.data?.total ?? 0
      const newItems = records.map((item: any) => ({
        id: item.id,
        name: item.userNickname || item.userAccount || '未知用户',
        avatar: item.userAvatar || '',
        phone: item.userPhone || '',
        email: item.userEmail || '',
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

  onPhoneTap(e: any) {
    const phone = e.currentTarget.dataset.phone
    if (phone) wx.makePhoneCall({ phoneNumber: phone, fail: () => {} })
  },

  onEmailCopy(e: any) {
    const email = e.currentTarget.dataset.email
    if (!email) return
    wx.setClipboardData({
      data: email,
    })
  },

  stopPropagation() {},
}))