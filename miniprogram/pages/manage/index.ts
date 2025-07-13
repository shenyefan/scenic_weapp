// pages/manage/index.ts
import { getLoginUser } from '../../api/userController'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginUser: {
      userRole: ''
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
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      this.setData({ loading: true })
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
          loginUser: result.data,
          loading: false
        })
      } else {
        wx.redirectTo({
          url: '/pages/login/index'
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.setData({ loading: false })
      wx.redirectTo({
        url: '/pages/login/index'
      })
    }
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