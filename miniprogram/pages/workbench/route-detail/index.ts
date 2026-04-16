import Toast from 'tdesign-miniprogram/toast/index'
import { getRouteById } from '../../../api/controller/attractions-route-controller/attractions-route-controller'

Page({
  data: {
    loading: true,
    role: 'user',
    detail: null as any,
  },

  onLoad(options: any) {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) this.setData({ role: JSON.parse(raw)?.role || 'user' })
    } catch {}
    const id = options?.id
    if (id) {
      this.fetchDetail(id)
    } else {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '参数错误', theme: 'error' })
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getRouteById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      const routeItems = [...(item.routeItems ?? [])]
        .sort((left: any, right: any) => (left?.sortOrder ?? 0) - (right?.sortOrder ?? 0))
        .map((routeItem: any, index: number) => ({
          id: routeItem.id || `${index}`,
          order: index + 1,
          attractionName: routeItem.attractions?.attractionsName || '未命名景点',
          attractionImage: routeItem.attractions?.attractionsImage || '',
          attractionDescription: routeItem.attractions?.attractionsDescription || '',
          stayMinutes: routeItem.estimatedStayMinutes,
          stopNote: routeItem.stopNote || '',
        }))
      this.setData({
        loading: false,
        detail: {
          id: item.id || '',
          name: item.routeName || '未命名路线',
          image: item.routeImage || '',
          video: item.routeVideo || '',
          description: item.routeDescription || '',
          duration: item.estimatedDurationMinutes,
          itemCount: routeItems.length,
          routeItems,
        },
      })
    } catch {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  onEditTap() {
    const { detail } = this.data
    if (!detail) return
    wx.navigateTo({ url: `../route-edit/index?id=${detail.id}` })
  },
})