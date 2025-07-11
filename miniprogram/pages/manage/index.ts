// pages/manage/index.ts
import { getLoginUser } from '../../api/userController'
import Notify from '@vant/weapp/notify/notify'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginUser: {
      roleName: ''
    },
    loading: false,
    patrolState: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init();
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        wx.redirectTo({
          url: '/pages/login/index'
        })
        return
      }

      const result = await getLoginUser()
      if (result.code === 200 && result.data) {
        this.setData({
          loginUser: result.data
        })
      } else {
        wx.redirectTo({
          url: '/pages/login/index'
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      wx.redirectTo({
        url: '/pages/login/index'
      })
    }
  },

  /**
   * 开始巡查
   */
  startPatrol() {
    // TODO: 实现开始巡查功能
    this.setData({ patrolState: true })
    Notify({ type: 'success', message: '巡查已开始' })
  },

  /**
   * 结束巡查
   */
  endPatrol() {
    // TODO: 实现结束巡查功能
    this.setData({ patrolState: false })
    Notify({ type: 'success', message: '巡查已结束' })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})