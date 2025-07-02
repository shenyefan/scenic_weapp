import { userLogin, userRegister } from '../../api/userController'
import Notify from '@vant/weapp/notify/notify'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    primarySize: 'default',
    disabled: false,
    // 表单数据
    formData: {
      account: '',
      password: ''
    },
    // 加载状态
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 检查是否已经登录，如果已登录则跳转到用户页面
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      // 先检查本地是否有token
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('本地无token，未登录状态')
        return
      }
      
      // 验证token是否有效
      const { getLoginUser } = require('../../api/userController')
      const res = await getLoginUser()
      if (res.code === 200 && res.data) {
        // 已登录，跳转到用户页面
        wx.switchTab({
          url: '/pages/user/index'
        })
      }
    } catch (error) {
      // token无效，清除本地存储
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      console.log('token无效，未登录状态')
    }
  },

  /**
   * 表单提交处理
   */
  async formSubmit(e: any) {
    const formData = e.detail.value
    const { account, password } = formData

    // 表单验证
    if (!this.validateForm(account, password)) {
      return
    }

    // 开始登录
    this.setData({ 
      loading: true,
      disabled: true 
    })

    Notify({ type: 'primary', message: '登录中...' })

    try {
      const res = await userLogin({
        userAccount: account,
        userPassword: password
      })

      wx.hideLoading()

      if (res.code === 200) {
        // 保存用户信息和token到本地存储
        const { data } = res
        wx.setStorageSync('userInfo', {
          id: data.id,
          userAccount: data.userAccount,
          userName: data.userName,
          userAvatar: data.userAvatar,
          userProfile: data.userProfile,
          userRole: data.userRole,
          createTime: data.createTime,
          updateTime: data.updateTime
        })
        wx.setStorageSync('token', data.token)
        
        // 登录成功
        Notify({
          type: 'success',
          message: '登录成功',
        })

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/user/index'
          })
        }, 1000)
      } else {
        // 登录失败
        Notify({
          type: 'danger',
          message: res.message || '登录失败',
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('登录请求失败:', error)
      Notify({
        type: 'danger',
        message: '网络错误，请重试'
      })
    } finally {
      this.setData({ 
        loading: false,
        disabled: false 
      })
    }
  },

  /**
   * 表单验证
   */
  validateForm(account: string, password: string): boolean {
    // 账号验证
    if (!account) {
      Notify({
        type: 'danger',
        message: '请输入账号',
      })
      return false
    }

    if (account.length < 4) {
      Notify({
        type: 'danger',
        message: '账号至少4位',
      })
      return false
    }

    // 密码验证
    if (!password) {
      Notify({
        type: 'danger',
        message: '请输入密码',
      })
      return false
    }

    if (password.length < 6) {
      Notify({
        type: 'danger',
        message: '密码至少6位',
      })
      return false
    }

    return true
  },

  /**
   * 打开注册页面
   */
  openRegister() {
    wx.showModal({
      title: '注册功能',
      content: '注册功能开发中，请联系管理员开通账号',
      showCancel: false,
      confirmText: '知道了'
    })

  },

  /**
   * 打开忘记密码页面
   */
  openForget() {
    wx.showModal({
      title: '忘记密码',
      content: '请联系管理员重置密码',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重置表单状态
    this.setData({
      disabled: false,
      loading: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时清理加载状态
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时清理资源
    wx.hideLoading()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新时重置页面状态
    this.setData({
      disabled: false,
      loading: false
    })
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 登录页面通常不需要处理上拉触底
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '大芦花风景区',
      path: '/pages/home/index'
    }
  }
})