import { listUserVoByPage } from '../../../api/userController'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    userList: [] as API.UserVO[],
    filteredUserList: [] as API.UserVO[],
    searchValue: '',
    loading: false,
    pageInfo: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    }
  },

  onLoad() {
    this.loadUserList(true)
  },

  // 加载用户列表
  async loadUserList(refresh = false) {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    if (refresh) {
      this.setData({ userList: [], filteredUserList: [] })
    }

    try {
      const pageInfo = this.data.pageInfo
      const params: any = {
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
      
      // 添加搜索参数
      if (this.data.searchValue) {
        params.userName = this.data.searchValue
      }
      
      const result = await listUserVoByPage(params)
      
      if (result.code === 200 && result.data) {
        const { records, total } = result.data
        const newList = refresh ? records : [...this.data.userList, ...records]
        const hasMore = records.length > 0 && newList.length < total
        
        this.setData({
          userList: newList,
          filteredUserList: this.data.searchValue ? this.filterUsers(newList, this.data.searchValue) : newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total,
          'pageInfo.hasMore': hasMore,
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '获取用户列表失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      Notify({ type: 'danger', message: '获取用户列表失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 搜索框输入变化
  onSearchChange(e: { detail: any }) {
    this.setData({
      searchValue: e.detail,
      userList: [],
      filteredUserList: [],
      'pageInfo.current': 1,
      'pageInfo.hasMore': true
    })
    this.loadUserList(true)
  },

  // 搜索确认
  onSearch() {
    this.loadUserList(true)
  },

  // 过滤用户列表
  filterUsers(userList: API.UserVO[], searchValue: string) {
    if (!searchValue) return userList
    
    return userList.filter(user => {
      const userName = (user as any).userName || ''
      return userName.toLowerCase().includes(searchValue.toLowerCase())
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading) return
    
    if (this.data.pageInfo.hasMore) {
      this.loadUserList(false)
    }
  },

  // 拨打电话
  callPhone(e: { currentTarget: { dataset: { phone: any; name: any } } }) {
    const { phone, name } = e.currentTarget.dataset
    if (!phone) {
      Notify({ type: 'warning', message: '该用户未设置联系电话' })
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        Notify({ type: 'danger', message: '拨打电话失败' })
      }
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})