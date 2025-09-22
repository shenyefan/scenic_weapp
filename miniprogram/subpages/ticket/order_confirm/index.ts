import { createOrder } from '../../../api/orderController'

// 订单项接口
interface OrderItem {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

Page({
  data: {
    loading: false,
    submitting: false,
    orderItems: [] as OrderItem[],
    totalPrice: 0,
    
    // 联系人信息
    contactName: '',
    contactPhone: '',
    
    // 日期选择器相关
    showDatePickerPopup: false,
    selectedDate: '',
    selectedDateText: '请选择游览日期',
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    maxDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).getTime() // 7天后
  },

  onLoad(options: any) {
    // 从页面参数中获取订单数据
    if (options.orderData) {
      try {
        const orderData = JSON.parse(decodeURIComponent(options.orderData))
        const items = orderData.items || []
        
        // 确保每个订单项都有正确的数据结构
        const processedItems = items.map((item: any) => ({
          id: item.id,
          title: item.title || item.name || '未知商品',
          description: item.description || item.desc || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          totalPrice: (item.price || 0) * (item.quantity || 1)
        }))
        
        // 计算总价
        const totalPrice = processedItems.reduce((sum: number, item: OrderItem) => sum + item.totalPrice, 0)
        
        this.setData({
          orderItems: processedItems,
          totalPrice: totalPrice
        })
      } catch (error) {
        wx.showToast({
          title: '订单数据错误',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } else {
      wx.showToast({
        title: '订单数据缺失',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 联系人姓名变化
   */
  onContactNameChange(event: any) {
    this.setData({
      contactName: event.detail
    })
  },

  /**
   * 联系人手机变化
   */
  onContactPhoneChange(event: any) {
    this.setData({
      contactPhone: event.detail
    })
  },

  /**
   * 显示日期选择器
   */
  showDatePicker() {
    this.setData({ showDatePickerPopup: true })
  },

  /**
   * 隐藏日期选择器
   */
  hideDatePicker() {
    this.setData({ showDatePickerPopup: false })
  },

  /**
   * 确认选择日期
   */
  onDateConfirm(event: any) {
    const selectedDate = this.formatDate(new Date(event.detail))
    const selectedDateText = `${selectedDate}`
    
    this.setData({
      selectedDate,
      selectedDateText,
      showDatePickerPopup: false
    })
  },

  /**
   * 格式化日期
   */
  formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString()
    const day = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate().toString()
    return `${year}-${month}-${day}`
  },

  /**
   * 表单验证
   */
  validateForm(): boolean {
    if (!this.data.contactName.trim()) {
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'error'
      })
      return false
    }

    if (!this.data.contactPhone.trim()) {
      wx.showToast({
        title: '请输入联系人手机号',
        icon: 'error'
      })
      return false
    }

    // 简单的手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(this.data.contactPhone.trim())) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error'
      })
      return false
    }

    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择游览日期',
        icon: 'error'
      })
      return false
    }

    return true
  },

  /**
   * 提交订单
   */
  async onSubmitOrder() {
    if (!this.validateForm()) {
      return
    }

    try {
      this.setData({ submitting: true })
      
      // 构建订单数据
      const orderItems: API.OrderItemCreateRequest[] = this.data.orderItems.map(item => ({
        ticketId: item.id,
        quantity: item.quantity
      }))

      const orderData: API.OrderCreateRequest = {
        orderItems,
        contactName: this.data.contactName.trim(),
        contactPhone: this.data.contactPhone.trim(),
        visitDate: this.data.selectedDate
      }

      const result = await createOrder(orderData)

      this.setData({ submitting: false })

      if (result.code === 200) {
        wx.showModal({
          title: '订单提交成功',
          content: '订单创建成功，请前往订单页面查看详情',
          showCancel: false,
          success: () => {
            // 跳转到订单列表页面
            wx.redirectTo({
              url: '/subpages/ticket/order/index'
            })
          }
        })
      } else {
        wx.showToast({
          title: result.message || '订单提交失败',
          icon: 'error'
        })
      }
    } catch (error) {
      this.setData({ submitting: false })
      console.error('提交订单失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
    }
  }
})