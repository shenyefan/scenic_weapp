import Notify from '@vant/weapp/notify/notify'
import { getLoginUser, userLogout, updateMyUser } from '../../api/userController'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      id: null,
      userName: '',
      userAccount: '',
      userAvatar: '',
      userProfile: '',
      userRole: ''
    },
    // 是否已登录
    isLoggedIn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init();
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        this.setData({
          isLoggedIn: false,
          userInfo: {
            id: null,
            userName: '登录/注册',
            userAccount: '',
            userAvatar: '',
            userProfile: '',
            userRole: ''
          }
        })
        return
      }

      const res = await getLoginUser()
      if (res.code === 200 && res.data) {
        this.setData({
          isLoggedIn: true,
          userInfo: res.data
        })
      } else {
        wx.removeStorageSync('token')
        this.setData({
          isLoggedIn: false,
          userInfo: {
            id: null,
            userName: '登录/注册',
            userAccount: '',
            userAvatar: '',
            userProfile: '',
            userRole: ''
          }
        })
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      wx.removeStorageSync('token')
      this.setData({
        isLoggedIn: false,
        userInfo: {
          id: null,
          userName: '登录/注册',
          userAccount: '',
          userAvatar: '',
          userProfile: '',
          userRole: ''
        }
      })
    }
  },

    /**
   * 点击用户信息区域
   */
  onUserInfoClick() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    } else {
      // 已登录用户跳转到用户信息页面
      wx.navigateTo({
        url: '/subpages/user/info/index'
      })
    }
  },

  /**
   * 修改密码
   */
  changePassword() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' })
      return
    }
    this.setData({
      showPasswordModal: true,
      newPassword: '',
      confirmPassword: ''
    })
  },

  /**
   * 关闭密码修改弹窗
   */
  closePasswordModal() {
    this.setData({
      showPasswordModal: false,
      newPassword: '',
      confirmPassword: ''
    })
  },

  /**
   * 新密码输入
   */
  onNewPasswordChange(event: any) {
    this.setData({
      newPassword: event.detail
    })
  },

  /**
   * 确认密码输入
   */
  onConfirmPasswordChange(event: any) {
    this.setData({
      confirmPassword: event.detail
    })
  },

  /**
   * 确认修改密码
   */
  async confirmChangePassword() {
    const { newPassword, confirmPassword } = this.data
    
    if (!newPassword || !confirmPassword) {
      Notify({ type: 'warning', message: '请输入密码' })
      return
    }
    
    if (newPassword !== confirmPassword) {
      Notify({ type: 'warning', message: '两次密码不一致' })
      return
    }
    
    if (newPassword.length < 8) {
      Notify({ type: 'warning', message: '密码至少8位' })
      return
    }

    try {
      const res = await updateMyUser({ userPassword: newPassword })
      if (res.code === 200) {
        Notify({ type: 'success', message: '密码修改成功' })
        this.closePasswordModal()
      } else {
        Notify({ type: 'danger', message: res.message || '密码修改失败' })
      }
    } catch (error) {
      Notify({ type: 'danger', message: '密码修改失败' })
    }
  },

  /**
   * 意见反馈
   */
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系我们',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 关于我们
   */
  about() {
    wx.showModal({
      title: '关于',
      content: '作者：申业凡',
      showCancel: false,
      confirmText: '知道了'
    })
  },


  /**
   * 退出登录
   */
  async logout() {
    if (!this.data.isLoggedIn) {
      return
    }
    
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await userLogout()
            wx.removeStorageSync('token')
            this.setData({
              isLoggedIn: false,
              userInfo: {
                id: null,
                userName: '登录/注册',
                userAccount: '',
                userAvatar: '',
                userProfile: '',
                userRole: ''
              }
            })
            Notify({ type: 'success', message: '已退出登录' })
          } catch (error: any) {
            console.error('退出登录失败:', error)
            wx.removeStorageSync('token')
            this.setData({
              isLoggedIn: false,
              userInfo: {
                id: null,
                userName: '登录/注册',
                userAccount: '',
                userAvatar: '',
                userProfile: '',
                userRole: ''
              }
            })
            Notify({ type: 'success', message: '已在本地退出登录' })
          }
        }
      }
    })
  }
})