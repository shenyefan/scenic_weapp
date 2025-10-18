import { getOrderVoById, updateOrder } from '../../../api/orderController'
import { getLoginUser } from '../../../api/userController'
import { formatISOTimeDetailed, formatISODate } from '../../../utils/date'
import QR from "../../../miniprogram_npm/wx-base64-qrcode/index.js";

Page({
  data: {
    orderId: '',
    orderDetail: null as API.OrderVO | null,
    loading: true,
    isAdmin: false,
    orderIdBase64: ''
  },

  onLoad(options: any) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId })
      this.checkUserRole()
    } else {
      wx.showToast({
        title: '订单ID不能为空',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 检查用户角色
   */
  async checkUserRole() {
    try {
      const result = await getLoginUser()
      if (result.code === 200 && result.data) {
        const isAdmin = result.data.userRole === 'admin'
        this.setData({ isAdmin })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    this.loadOrderDetail()
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    try {
      this.setData({ loading: true })
      
      const result = await getOrderVoById({ id: this.data.orderId })
      
      if (result.code === 200 && result.data) {
        // 格式化创建时间
        const formattedData = {
          ...result.data,
          visitDate: formatISODate(result.data.visitDate),
          createTime: formatISOTimeDetailed(result.data.createTime)
        }
        
        this.setData({
          orderDetail: formattedData,
          loading: false
        })
        
        // 如果订单已支付或已完成，生成二维码
        if (result.data.paymentStatus === 1) {
          this.generateQRCode()
        }
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'error'
        })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 生成二维码
   */
  generateQRCode() {
    const size = 400;

    const base64Data = QR.createQrCodeImg(this.data.orderId, size) // base64的数据

    this.setData({
      orderIdBase64:base64Data
    })
  },

  /**
   * 绘制定位标记
   */
  drawPositionMarker(ctx: any, x: number, y: number, size: number) {
    // 外框
    ctx.fillRect(x, y, size, size)
    // 内部白色
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(x + size / 7, y + size / 7, size * 5 / 7, size * 5 / 7)
    // 中心黑点
    ctx.setFillStyle('#000000')
    ctx.fillRect(x + size * 2 / 7, y + size * 2 / 7, size * 3 / 7, size * 3 / 7)
  },

  /**
   * 判断是否应该绘制数据块
   */
  shouldDrawBlock(i: number, j: number, data: string): boolean {
    // 避开定位点区域
    if ((i < 9 && j < 9) || (i > 12 && j < 9) || (i < 9 && j > 12)) {
      return false
    }
    
    // 简单的伪随机算法生成二维码图案
    const hash = this.simpleHash(data + i + j)
    return hash % 3 === 0
  },

  /**
   * 简单哈希函数
   */
  simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  },

  /**
   * 获取状态文本
   */
  getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: '待支付',
      1: '已支付',
      2: '已完成',
      3: '已取消',
      4: '已退款'
    }
    return statusMap[status] || '未知状态'
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(status: number): string {
    const colorMap: Record<number, string> = {
      0: '#ff9500', // 待支付 - 橙色
      1: '#07c160', // 已支付 - 绿色
      2: '#576b95', // 已完成 - 蓝色
      3: '#fa5151', // 已取消 - 红色
      4: '#c9c9c9'  // 已退款 - 灰色
    }
    return colorMap[status] || '#c9c9c9'
  },

  /**
   * 计算订单总价
   */
  calculateTotalPrice(): number {
    if (!this.data.orderDetail?.orderItems) {
      return 0
    }
    return this.data.orderDetail.orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  },

  /**
   * 计算订单总数量
   */
  calculateTotalQuantity(): number {
    if (!this.data.orderDetail?.orderItems) {
      return 0
    }
    return this.data.orderDetail.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  },

  /**
   * 格式化价格
   */
  formatPrice(price: number): string {
    return (price / 100).toFixed(2)
  },



  /**
   * 标记订单为已完成
   */
  async onCompleteOrder() {
    wx.showModal({
      title: '确认操作',
      content: '确定要将此订单标记为已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' })
            
            const result = await updateOrder({
              id: this.data.orderId,
              paymentStatus: 2
            })
            
            wx.hideLoading()
            
            if (result.code === 200) {
              wx.showToast({
                title: '操作成功',
                icon: 'success'
              })
              this.loadOrderDetail()
            } else {
              wx.showToast({
                title: result.message || '操作失败',
                icon: 'error'
              })
            }
          } catch (error) {
            wx.hideLoading()
            console.error('更新订单状态失败:', error)
            wx.showToast({
              title: '网络错误',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  /**
   * 扫码检票
   */
  onScanQRCode() {
    wx.navigateTo({
      url: '/subpages/ticket/scan/index'
    })
  },

  /**
   * 支付订单
   */
  async onPayOrder() {
    wx.showModal({
      title: '确认支付',
      content: `确定要支付 ¥${this.data.orderDetail?.totalPrice} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '支付中...' })
            
            const result = await updateOrder({
              id: this.data.orderId,
              paymentStatus: 1
            })
            
            wx.hideLoading()
            
            if (result.code === 200) {
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              this.loadOrderDetail()
            } else {
              wx.showToast({
                title: result.message || '支付失败',
                icon: 'error'
              })
            }
          } catch (error) {
            wx.hideLoading()
            console.error('支付失败:', error)
            wx.showToast({
              title: '网络错误',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})