import { getAttractionsRouteVoById } from '../../../api/attractionsRouteController'
// @ts-ignore
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    routeId: '',
    routeDetail: {} as API.AttractionsRouteVO,
    loading: false,
    // 地图相关数据
    mapCenter: {
      latitude: 39.908823,
      longitude: 116.397470
    },
    mapMarkers: [] as any[],
    includePoints: [] as any[]
  },

  onLoad(options: any) {
    const { id } = options
    if (id) {
      this.setData({ routeId: id })
      this.loadRouteDetail()
    } else {
      Notify({ type: 'danger', message: '路线ID不能为空' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载路线详情
  async loadRouteDetail() {
    if (!this.data.routeId) return
    
    this.setData({ loading: true })
    
    try {
      const res = await getAttractionsRouteVoById({ id: this.data.routeId })
      
      if (res.code === 200 && res.data) {
        this.setData({ 
          routeDetail: res.data,
          loading: false
        })
        
        // 更新地图标记
        this.updateMapMarkers()
      } else {
        this.setData({ loading: false })
        Notify({ type: 'danger', message: res.message || '获取路线详情失败' })
      }
    } catch (error) {
      this.setData({ loading: false })
      console.error('获取路线详情失败:', error)
      Notify({ type: 'danger', message: '获取路线详情失败，请重试' })
    }
  },

  // 更新地图标记
  updateMapMarkers() {
    const route = this.data.routeDetail
    if (!route.attractions || route.attractions.length === 0) return
    
    const markers: any[] = []
    const points: any[] = []
    
    route.attractions.forEach((attraction, index) => {
      if (!attraction.attractionsLat || !attraction.attractionsLng) return
      
      markers.push({
        id: index,
        latitude: attraction.attractionsLat,
        longitude: attraction.attractionsLng,
        title: attraction.attractionsName || `景点${index + 1}`,
        callout: {
          content: `${index + 1}. ${attraction.attractionsName || `景点${index + 1}`}`,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'ALWAYS'
        },
        customCalloutData: {
          attractionId: attraction.id,
          attractionIndex: index,
          isFirstAttraction: index === 0,
          isLastAttraction: index === route.attractions!.length - 1
        }
      })
      
      points.push({
        latitude: attraction.attractionsLat,
        longitude: attraction.attractionsLng
      })
    })
    
    // 设置地图中心点为第一个景点的位置
    const firstAttraction = route.attractions[0]
    if (firstAttraction.attractionsLat && firstAttraction.attractionsLng) {
      this.setData({
        mapCenter: {
          latitude: firstAttraction.attractionsLat,
          longitude: firstAttraction.attractionsLng
        }
      })
    }
    
    this.setData({
      mapMarkers: markers,
      includePoints: points
    })
  },

  // 地图更新完成
  onMapUpdated(e: any) {
    // 地图更新完成后的回调
  },

  // 点击标记
  onMarkerTap(e: any) {
    const marker = this.data.mapMarkers.find(m => m.id === e.detail.markerId)
    if (marker && marker.customCalloutData) {
      const { attractionId } = marker.customCalloutData
      if (attractionId) {
        // 跳转到景点详情页面
        wx.navigateTo({
          url: `/subpages/attraction/detail/index?id=${attractionId}`,
          fail: () => {
            Notify({ type: 'danger', message: '页面跳转失败' })
          }
        })
      }
    }
  },

  // 点击景点项
  onAttractionTap(e: any) {
    const { id } = e.currentTarget.dataset
    if (id) {
      wx.navigateTo({
        url: `/subpages/attraction/detail/index?id=${id}`,
        fail: () => {
          Notify({ type: 'danger', message: '页面跳转失败' })
        }
      })
    }
  },

  // 预览图片
  onImagePreview(e: any) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.previewImage({
        current: url,
        urls: [url]
      })
    }
  },

  // 返回按钮
  onBack() {
    wx.navigateBack()
  }
})