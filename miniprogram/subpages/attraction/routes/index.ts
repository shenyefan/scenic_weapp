import { listAttractionsRouteVoByPage } from '../../../api/attractionsRouteController'
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
      
      if (res.code === 200 && res.data) {
        const { records, total, current, size } = res.data
        const newList = refresh ? records : [...this.data.routeList, ...records]
        
        // 判断是否还有更多数据
        const hasMore = records.length > 0 && newList.length < total
        
        this.setData({
          routeList: newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total,
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
  onRouteTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    
    Notify({ type: 'primary', message: '喵喵喵' })
  },

  // 切换视图模式
  toggleViewMode() {
    const newMode = this.data.viewMode === 'list' ? 'map' : 'list';
    
    this.setData({ 
      viewMode: newMode,
      'pageInfo.pageSize': newMode === 'map' ? 999 : 10 // 地图模式下加载更多数据
    });
    
    if (newMode === 'map') {
      this.loadRouteList(true);
    }
  },

  // 更新地图标记和路线
  updateMapMarkers() {
    const routes = this.data.routeList
      .filter(item => 
        item.startAttractionLat && item.startAttractionLng && 
        item.endAttractionLat && item.endAttractionLng
      )
    
    if (routes.length === 0) return
    
    // 准备包含点数组用于自适应缩放
    const points = []
    const markers = []
    let markerId = 0
    
    // 为每条路线创建起点和终点标记
    routes.forEach((route, index) => {
      // 起点标记
      markers.push({
        id: markerId,
        latitude: route.startAttractionLat,
        longitude: route.startAttractionLng,
        title: route.startAttractionName || '起点',
        callout: {
          content: `${route.startAttractionName || '起点'}`,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'ALWAYS'
        },
        customCalloutData: {
          routeId: route.id,
          isStart: true
        }
      })
      points.push({
        latitude: route.startAttractionLat,
        longitude: route.startAttractionLng
      })
      markerId++
      
      // 终点标记
      markers.push({
        id: markerId,
        latitude: route.endAttractionLat,
        longitude: route.endAttractionLng,
        title: route.endAttractionName || '终点',
        callout: {
          content: `${route.endAttractionName || '终点'}`,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'ALWAYS'
        },
        customCalloutData: {
          routeId: route.id,
          isEnd: true
        }
      })
      points.push({
        latitude: route.endAttractionLat,
        longitude: route.endAttractionLng
      })
      markerId++
    })

    this.setData({ 
      mapMarkers: markers,
      includePoints: points
    })
  },

  // 地图更新完成事件
  onMapUpdated(e) {
    console.log('地图更新完成', e)
  },
  
  // 点击气泡事件
  onCalloutTap(e) {
    this.onMarkerTap(e)
  },

  // 点击地图标记
  onMarkerTap(e) {
    const markerId = e.markerId
    const marker = this.data.mapMarkers[markerId]
    if (marker && marker.customCalloutData) {
      const routeId = marker.customCalloutData.routeId
      if (routeId) {
        Notify({ type: 'primary', message: '喵喵喵' })
      }
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})