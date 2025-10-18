import { formatISOTime, formatISODate } from '../../../utils/date'
import { listMyOrderVoByPage, listOrderVoByPage } from '../../../api/orderController'
import { getLoginUser } from '../../../api/userController'

Page({
  data: {
    orderList: [] as API.OrderVO[],
    loading: true,
    current: 1,
    size: 10,
    total: 0,
    isAdmin: false,
    // 日期筛选相关
    selectedDate: '',
    selectedDateText: '全部日期',
    showDatePickerPopup: false,
    currentDate: new Date().getTime(),
    minDate: new Date('2025-01-01').getTime(),
    maxDate: new Date('2030-12-31').getTime()
  },

  onLoad() {
    this.checkUserRole()
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
        this.loadOrderList()
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.loadOrderList()
    }
  },

  /**
   * 加载订单列表
   */
  async loadOrderList() {
    try {
      this.setData({ loading: true })
      
      const queryData: API.OrderQueryRequest = {
        current: this.data.current,
        pageSize: this.data.size,
        sortField: 'createTime',
        sortOrder: 'desc'
      }

      // 添加日期筛选条件
      if (this.data.selectedDate) {
        queryData.visitDate = this.data.selectedDate
      }

      // 根据用户角色调用不同接口
      const result = this.data.isAdmin 
        ? await listOrderVoByPage(queryData)
        : await listMyOrderVoByPage(queryData)

      if (result.code === 200 && result.data && result.data.records) {
        // 预处理数据，为每个订单添加格式化后的门票信息和游览日期
        const processedOrders = result.data.records.map(order => ({
          ...order,
          formattedTicketInfo: this.formatOrderItems(order.orderItems || []),
          formattedVisitDate: order.visitDate ? formatISODate(order.visitDate) : '未设置'
        }))
        
        this.setData({
          orderList: processedOrders,
          total: result.data.total || 0,
          loading: false
        })
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'error'
        })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载订单列表失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
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
   * 格式化订单项显示
   */
  formatOrderItems(orderItems: API.OrderItemVO[]): string {
    if (!orderItems || orderItems.length === 0) {
      return '暂无门票信息'
    }
    
    if (orderItems.length === 1) {
      const item = orderItems[0]
      return `${item.ticket?.ticketName || '门票'} × ${item.quantity}`
    }
    
    // 多个门票时显示总数量和第一个门票名称
    const totalQuantity = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const firstName = orderItems[0].ticket?.ticketName || '门票'
    return `${firstName}等 共${totalQuantity}张`
  },

  /**
   * 计算订单总价
   */
  calculateTotalPrice(orderItems: API.OrderItemVO[]): number {
    if (!orderItems || orderItems.length === 0) {
      return 0
    }
    return orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  },

  /**
   * 查看订单详情
   */
  onViewDetail(event: any) {
    const order = event.currentTarget.dataset.order as API.OrderVO
    wx.navigateTo({
      url: `/subpages/ticket/order_detail/index?orderId=${order.id}`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ current: 1 })
    this.loadOrderList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.current * this.data.size < this.data.total) {
      this.setData({ current: this.data.current + 1 })
      this.loadOrderList()
    }
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
    const selectedTimestamp = event.detail
    const selectedDate = new Date(selectedTimestamp)
    const dateString = formatISODate(selectedDate.toISOString())
    
    this.setData({
      selectedDate: dateString,
      selectedDateText: dateString,
      showDatePickerPopup: false,
      current: 1 // 重置页码
    })
    
    this.loadOrderList()
  },

  /**
   * 清除日期筛选
   */
  clearDateFilter(event: any) {
    event.stopPropagation() // 阻止事件冒泡
    this.setData({
      selectedDate: '',
      selectedDateText: '全部日期',
      current: 1 // 重置页码
    })
    this.loadOrderList()
  }
})