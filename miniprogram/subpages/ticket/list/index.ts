import { listTicketVoByPage } from '../../../api/ticketController'

// 扩展门票类型，添加页面需要的字段
interface ExtendedTicket extends API.TicketVO {
  quantity: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  validityPeriod: number;
}

Page({
  data: {
    ticketList: [] as ExtendedTicket[],
    selectedTickets: [] as ExtendedTicket[],
    totalPrice: 0,
    totalQuantity: 0,
    loading: true,
    current: 1,
    size: 10,
    total: 0,
  },

  onLoad() {
    this.loadTicketList()
  },

  /**
   * 加载门票列表
   */
  async loadTicketList() {
    try {
      this.setData({ loading: true })
      
      const result = await listTicketVoByPage({
        current: this.data.current,
        pageSize: this.data.size,
        sortField: 'createTime',
        sortOrder: 'desc',
        status: 1 // 只显示在售状态的门票
      })

      if (result.code === 200 && result.data && result.data.records) {
        // 过滤只显示在售状态的门票
        const ticketList: ExtendedTicket[] = result.data.records
          .filter(ticket => ticket.status === 1)
          .map(ticket => ({
            ...ticket,
            quantity: 0, // 默认数量为0
            // 将API返回的字段映射到页面使用的字段
            title: ticket.ticketName || '',
            description: ticket.ticketDescription || '',
            imageUrl: ticket.ticketImage || '',
            price: ticket.ticketPrice || 0,
            stock: ticket.stockQuantity || 0,
            validityPeriod: ticket.validDays || 0
          }))
        
        this.setData({
          ticketList,
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
      console.error('加载门票列表失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 数量变化处理
   */
  onQuantityChange(event: any) {
    const { id } = event.currentTarget.dataset
    const quantity = event.detail
    
    const ticketList = this.data.ticketList.map(ticket => {
      if (ticket.id === id) {
        return { ...ticket, quantity }
      }
      return ticket
    })
    
    this.setData({ ticketList })
    this.updateSelectedTickets()
  },

  /**
   * 更新选中的门票
   */
  updateSelectedTickets() {
    const selectedTickets = this.data.ticketList.filter(ticket => ticket.quantity > 0)
    const totalPrice = selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0)
    const totalQuantity = selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
    
    this.setData({
      selectedTickets,
      totalPrice,
      totalQuantity
    })
  },

  /**
   * 提交订单 - 跳转到确认订单页面
   */
  onSubmitOrder() {
    if (this.data.selectedTickets.length === 0) {
      wx.showToast({
        title: '请选择门票',
        icon: 'error'
      })
      return
    }

    // 构建订单数据
    const orderData = {
      items: this.data.selectedTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        price: ticket.price,
        quantity: ticket.quantity,
        totalPrice: ticket.price * ticket.quantity
      })),
      totalPrice: this.data.totalPrice
    }

    // 跳转到确认订单页面
    wx.navigateTo({
      url: `/subpages/ticket/order_confirm/index?orderData=${encodeURIComponent(JSON.stringify(orderData))}`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ current: 1 })
    this.loadTicketList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.ticketList.length < this.data.total) {
      this.setData({ current: this.data.current + 1 })
      this.loadTicketList()
    }
  }
})