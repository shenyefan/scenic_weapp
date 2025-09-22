import { getOrderVoById, updateOrder } from '../../../api/orderController'

Page({
  data: {
    loading: false,
    completing: false,
    cancelling: false,
    scanResult: null as any
  },

  /**
   * 开始扫码
   */
  onStartScan() {
    wx.scanCode({
      success: (res) => {
        this.processScanResult(res.result)
      },
      fail: (error) => {
        console.error('扫码失败:', error)
        wx.showToast({
          title: '扫码失败',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 手动输入订单号
   */
  onManualInput() {
    wx.showModal({
      title: '输入订单号',
      editable: true,
      placeholderText: '请输入订单号',
      success: (res) => {
        if (res.confirm && res.content) {
          const orderIdStr = res.content.trim()
          
          // 验证是否为纯数字
          if (!/^\d+$/.test(orderIdStr)) {
            wx.showToast({
              title: '请输入正确的订单号',
              icon: 'none'
            })
            return
          }
          
          if (orderIdStr.length > 0) {
             this.checkOrder(orderIdStr)
          } else {
            wx.showToast({
              title: '无效的订单号',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  /**
   * 处理扫码结果
   */
  processScanResult(scanData: string) {
    try {
      // 二维码格式为bigint类型的订单ID，直接解析
      const trimmedData = scanData.trim()
      
      // 验证是否为纯数字
      if (!/^\d+$/.test(trimmedData)) {
        this.showScanResult({
          success: false,
          isExpired: false,
          message: '无效的二维码格式，请扫描正确的订单二维码',
          orderInfo: null
        })
        return
      }
      
      // 验证订单ID格式（bigint字符串）
      if (trimmedData.length > 0) {
        this.checkOrder(trimmedData)
      } else {
        this.showScanResult({
          success: false,
          isExpired: false,
          message: '无效的订单ID，请扫描正确的订单二维码',
          orderInfo: null
        })
      }
    } catch (error) {
      console.error('处理扫码结果失败:', error)
      this.showScanResult({
        success: false,
        isExpired: false,
        message: '二维码解析失败，请重新扫描',
        orderInfo: null
      })
    }
  },

  /**
   * 检查订单
   */
  async checkOrder(orderId: string) {
    try {
      this.setData({ loading: true })
      
      const result = await getOrderVoById({ id: orderId })
      
      this.setData({ loading: false })
      
      if (result.code === 200 && result.data) {
        const order = result.data
        
        // 根据订单状态显示不同结果
        if (order.paymentStatus === 1) {
          // 已支付，需要检查有效期
          const isExpired = this.checkOrderExpired(order)
          if (isExpired) {
            this.showScanResult({
              success: false,
              isExpired: true,
              message: '订单已超出有效期，无法验票',
              orderInfo: order
            })
          } else {
            // 已支付且未过期，可以验票
            this.showScanResult({
              success: true,
              isExpired: false,
              message: '订单验证成功，可以进行验票',
              orderInfo: order
            })
          }
        } else if (order.paymentStatus === 2) {
          // 已完成
          this.showScanResult({
            success: false,
            isExpired: false,
            message: '此订单已经完成验票',
            orderInfo: order
          })
        } else if (order.paymentStatus === 0) {
          // 待支付
          this.showScanResult({
            success: false,
            isExpired: false,
            message: '订单待支付，无法验票',
            orderInfo: order
          })
        } else if (order.paymentStatus === 3) {
          // 已取消
          this.showScanResult({
            success: false,
            isExpired: false,
            message: '订单已取消，无法验票',
            orderInfo: order
          })
        } else if (order.paymentStatus === 4) {
          // 已退款
          this.showScanResult({
            success: false,
            isExpired: false,
            message: '订单已退款，无法验票',
            orderInfo: order
          })
        } else {
          this.showScanResult({
            success: false,
            isExpired: false,
            message: '订单状态异常',
            orderInfo: order
          })
        }
      } else {
        this.showScanResult({
          success: false,
          isExpired: false,
          message: result.message || '订单不存在',
          orderInfo: null
        })
      }
    } catch (error) {
      this.setData({ loading: false })
      console.error('查询订单失败:', error)
      this.showScanResult({
        success: false,
        isExpired: false,
        message: '网络错误，请重试',
        orderInfo: null
      })
    }
  },

  /**
   * 检查订单是否过期
   */
  checkOrderExpired(order: any) {
    if (!order.visitDate) {
      return false
    }
    
    try {
      const visitDate = new Date(order.visitDate)
      const today = new Date()
      
      // 重置时间为当天开始
      today.setHours(0, 0, 0, 0)
      visitDate.setHours(0, 0, 0, 0)
      
      // 只有游玩日期等于今天才有效，其他情况都视为过期
      return visitDate.getTime() !== today.getTime()
    } catch (error) {
      console.error('日期解析失败:', error)
      return false
    }
  },

  /**
   * 显示扫码结果
   */
  showScanResult(result: any) {
    // 如果有订单信息，预处理状态文字
    if (result.orderInfo) {
      result.orderInfo.statusText = this.getStatusText(result.orderInfo.paymentStatus)
    }
    this.setData({ scanResult: result })
  },

  /**
   * 获取状态文本
   */
  getStatusText(status: number) {
    const statusMap: { [key: number]: string } = {
      0: '待支付',
      1: '已支付',
      2: '已完成',
      3: '已取消',
      4: '已退款'
    }
    return statusMap[status] || '未知状态'
  },

  /**
   * 确定验票 - 将订单状态更新为已完成
   */
  async onCompleteOrder() {
    if (!this.data.scanResult?.orderInfo?.id) {
      return
    }
    
    try {
      this.setData({ completing: true })
      
      const result = await updateOrder({
        id: this.data.scanResult.orderInfo.id,
        paymentStatus: 2 // 更新为已完成状态
      })
      
      this.setData({ completing: false })
      
      if (result.code === 200) {
        // 更新本地显示的订单状态
        const updatedOrderInfo = {
          ...this.data.scanResult.orderInfo,
          paymentStatus: 2
        }
        
        this.setData({
          'scanResult.orderInfo': updatedOrderInfo,
          'scanResult.success': true,
          'scanResult.message': '验票完成'
        })
        
        wx.showToast({
          title: '验票成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: result.message || '验票失败',
          icon: 'error'
        })
      }
    } catch (error) {
      this.setData({ completing: false })
      console.error('验票失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
    }
  },

  /**
   * 取消订单 - 将过期订单状态更新为已取消
   */
  async onCancelOrder() {
    if (!this.data.scanResult?.orderInfo?.id) {
      return
    }
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个过期订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ cancelling: true })
            
            const result = await updateOrder({
              id: this.data.scanResult.orderInfo.id,
              paymentStatus: 3 // 更新为已取消状态
            })
            
            this.setData({ cancelling: false })
            
            if (result.code === 200) {
              // 更新本地显示的订单状态
              const updatedOrderInfo = {
                ...this.data.scanResult.orderInfo,
                paymentStatus: 3
              }
              
              this.setData({
                'scanResult.orderInfo': updatedOrderInfo,
                'scanResult.message': '订单已取消'
              })
              
              wx.showToast({
                title: '订单已取消',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: result.message || '取消失败',
                icon: 'error'
              })
            }
          } catch (error) {
            this.setData({ cancelling: false })
            console.error('取消订单失败:', error)
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
   * 继续扫描
   */
  onScanAgain() {
    this.setData({ scanResult: null })
  }
})