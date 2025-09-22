import { listAttractionsRouteVoByPage } from '../../../api/attractionsRouteController'
// @ts-ignore
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    routeList: [] as API.AttractionsRouteVO[],
    loading: false,
    pageInfo: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 地图相关数据
    viewMode: 'list', // 'list' 或 'map'
    mapCenter: {
      latitude: 39.908823,
      longitude: 116.397470
    },
    mapMarkers: [] as any[],
    mapRoutes: [] as any[],
    includePoints: [] as any[],
  },

  onLoad() {
    this.loadRouteList(true)
  },

  // 加载路线列表
  async loadRouteList(refresh = false) {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      const pageInfo = this.data.pageInfo
      const params: API.AttractionsRouteQueryRequest = {
        current: refresh ? 1 : pageInfo.current,
        // 地图模式下加载更多数据
        pageSize: this.data.viewMode === 'map' ? 999 : pageInfo.pageSize,
      }

      const res = await listAttractionsRouteVoByPage(params)
      
      if (res.code === 200 && res.data && res.data.records) {
        const { records, total, current, size } = res.data
        const newList = refresh ? records : [...this.data.routeList, ...records]
        
        // 判断是否还有更多数据
        const hasMore = records.length > 0 && newList.length < (total || 0)
        
        this.setData({
          routeList: newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total || 0,
          'pageInfo.hasMore': hasMore
        })

        // 更新地图标记和路线
        if (this.data.viewMode === 'map') {
          this.updateMapMarkers()
        }
      } else {
        Notify({ type: 'danger', message: res.message || '获取路线列表失败' })
      }
    } catch (error) {
      console.error('获取路线列表失败:', error)
      Notify({ type: 'danger', message: '获取路线列表失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 上拉加载更多
  onReachBottom() {
    // 防止重复触发
    if (this.data.loading) return
    
    // 判断是否还有更多数据
    if (this.data.pageInfo.hasMore) {
      this.loadMore()
    }
  },
  
  // 加载更多 - 封装加载更多逻辑
  loadMore() {
    if (this.data.pageInfo.hasMore) {
      this.loadRouteList(false)
    }
  },
  
  // 点击路线项 - 查看详情
  onRouteTap(e: any) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    
    wx.navigateTo({
      url: `/subpages/attraction/routes_show/index?id=${id}`,
      fail: () => {
        Notify({ type: 'danger', message: '页面跳转失败' })
      }
    })
  },

  // 切换视图模式
  toggleViewMode() {
    const newMode = this.data.viewMode === 'list' ? 'map' : 'list'
    this.setData({ viewMode: newMode })
    
    if (newMode === 'map') {
      // 切换到地图模式时，重新加载数据以获取更多路线用于地图显示
      this.loadRouteList(true)
    }
  },

  // 更新地图标记和路线
  updateMapMarkers() {
    const routes = this.data.routeList.filter(item => 
      item.attractions && item.attractions.length > 0
    )
    if (routes.length === 0) {
      this.setData({
        mapMarkers: [],
        mapRoutes: [],
        includePoints: []
      })
      return
    }
    
    // 准备包含点数组用于自适应缩放
    const points: any[] = []
    const markers: any[] = []
    const polylines: any[] = []
    let markerId = 0
    
    // 为每条路线创建景点标记和路线
    routes.forEach((route, routeIndex) => {
      if (!route.attractions) return
      
      const routePoints: any[] = []
      const routeColor = this.getRouteColor(routeIndex)
      
      route.attractions.forEach((attraction, attractionIndex) => {
        if (!attraction.attractionsLat || !attraction.attractionsLng) return
        
        const isStart = attractionIndex === 0
        const isEnd = attractionIndex === (route.attractions?.length || 0) - 1
        
        markers.push({
          id: markerId,
          latitude: attraction.attractionsLat,
          longitude: attraction.attractionsLng,
          iconPath: this.getMarkerIcon(isStart, isEnd),
          width: 30,
          height: 30,
          callout: {
            content: `${attraction.attractionsName || `景点${attractionIndex + 1}`}`,
            color: '#333333',
            fontSize: 12,
            borderRadius: 8,
            bgColor: '#ffffff',
            padding: 8,
            display: 'BYCLICK',
            borderWidth: 1,
            borderColor: routeColor
          },
          customCalloutData: {
            routeId: route.id,
            attractionIndex: attractionIndex,
            routeName: `路线${routeIndex + 1}`
          }
        })
        
        const point = {
          latitude: attraction.attractionsLat,
          longitude: attraction.attractionsLng
        }
        
        points.push(point)
        routePoints.push(point)
        markerId++
      })
      
      // 创建路线连线
      if (routePoints.length >= 2) {
        polylines.push({
          points: routePoints,
          color: routeColor,
          width: 4,
          dottedLine: false,
          arrowLine: true,
          borderColor: '#ffffff',
          borderWidth: 2
        })
      }
    })
    
    // 计算地图中心点
    if (points.length > 0) {
      const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length
      const centerLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length
      
      this.setData({
        mapCenter: {
          latitude: centerLat,
          longitude: centerLng
        }
      })
    }
    
    this.setData({
      mapMarkers: markers,
      mapRoutes: polylines,
      includePoints: points
    })
  },

  // 获取路线颜色
  getRouteColor(index: number): string {
    const colors = ['#1989fa', '#52c41a', '#f5222d', '#fa8c16', '#722ed1', '#eb2f96']
    return colors[index % colors.length]
  },

  // 获取标记图标
  getMarkerIcon(isStart: boolean, isEnd: boolean): string {
    if (isStart) return '/image/map/start-marker.svg'
    if (isEnd) return '/image/map/end-marker.svg'
    return '/image/map/middle-marker.svg'
  },

  // 地图更新完成
  onMapUpdated(e: any) {
    console.log('地图更新完成:', e)
  },

  // 地图区域变化
  onMapRegionChange(e: any) {
    if (e.type === 'end') {
      // 区域变化结束，可以在这里处理相关逻辑
      console.log('地图区域变化:', e.detail)
    }
  },

  // 居中地图
  centerMap() {
    if (this.data.includePoints.length === 0) {
      Notify({ type: 'warning', message: '暂无景点数据' })
      return
    }

    const mapContext = wx.createMapContext('routeMap', this)
    mapContext.includePoints({
      points: this.data.includePoints,
      padding: [50, 50, 50, 50]
    })
  },

  // 刷新地图
  refreshMap() {
    this.updateMapMarkers()
    Notify({ type: 'success', message: '地图已刷新' })
  },
  
  // 点击标记气泡
  onCalloutTap(e: any) {
    const marker = this.data.mapMarkers.find(m => m.id === e.detail.markerId)
    if (marker && marker.customCalloutData) {
      const { routeId, routeName } = marker.customCalloutData
      if (routeId) {
        wx.showModal({
          title: '查看路线详情',
          content: `是否查看${routeName}的详细信息？`,
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: `/subpages/attraction/routes_show/index?id=${routeId}`,
                fail: () => {
                  Notify({ type: 'danger', message: '页面跳转失败' })
                }
              })
            }
          }
        })
      }
    }
  },
  
  // 点击标记
  onMarkerTap(e: any) {
    const marker = this.data.mapMarkers.find(m => m.id === e.detail.markerId)
    if (marker && marker.customCalloutData) {
      const { routeId } = marker.customCalloutData
      if (routeId) {
        wx.navigateTo({
          url: `/subpages/attraction/routes_show/index?id=${routeId}`,
          fail: () => {
            Notify({ type: 'danger', message: '页面跳转失败' })
          }
        })
      }
    }
  },

  // 返回按钮
  onBack() {
    wx.navigateBack()
  }
})