import { getAttractionsRouteVoById } from '../../../api/attractionsRouteController'

Page({
  data: {
    id: '',
    route: null as API.AttractionsRouteVO | null,
    loading: true
  },

  onLoad(options: { id?: string }) {
    const id = options.id || ''
    this.setData({ id })
    
    if (id) {
      this.loadRouteDetail()
    } else {
      this.setData({ loading: false })
    }
  },

  async loadRouteDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsRouteVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        this.setData({
          route: res.data
        })
      } else {
        console.error('获取路线详情失败:', res.message)
      }
    } catch (error) {
      console.error('获取路线详情失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  onShow() {
    // 页面显示时可以刷新数据
    if (this.data.id) {
      this.loadRouteDetail()
    }
  }
})