import { listUserVoByPage } from '../../../api/userController'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    userList: [] as API.UserVO[],
    filteredUserList: [] as API.UserVO[],
    searchValue: ''
  },

  onLoad() {
    this.loadUserList()
  },

  // 加载用户列表
  async loadUserList() {
    try {
      const result = await listUserVoByPage({
        current: 1,
        pageSize: 999,
        sortField: 'createTime',
        sortOrder: 'descend'
      })
      
      if (result.code === 200 && result.data) {
        const { records } = result.data
        
        this.setData({
          userList: records,
          filteredUserList: records // 初始化过滤列表
        })
      } else {
        Notify({ type: 'danger', message: result.message || '获取用户列表失败' })
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      Notify({ type: 'danger', message: '获取用户列表失败，请重试' })
    }
  },

  // 搜索框输入变化
  onSearchChange(e: { detail: any }) {
    this.setData({
      searchValue: e.detail
    })
    this.filterUserList()
  },

  // 搜索确认
  onSearch() {
    this.filterUserList()
  },

  // 过滤用户列表
  filterUserList() {
    const { searchValue, userList } = this.data
    if (!searchValue) {
      // 如果搜索值为空，显示所有用户
      this.setData({
        filteredUserList: userList
      })
      return
    }

    // 根据用户名或角色过滤
    const filtered = userList.filter(user => {
      const userName = (user as any).userName || '';
      return userName.toLowerCase().includes(searchValue.toLowerCase())
    })

    this.setData({
      filteredUserList: filtered
    })
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