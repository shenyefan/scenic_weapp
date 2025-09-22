import { listAttractionsRouteVoByPage } from '../../../api/attractionsRouteController'
import { getLoginUser } from '../../../api/userController'
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
    needRefresh: false, // 添加刷新标记
    // 添加登录用户信息
    loginUser: {
      userRole: ''
    }
  },

  onLoad() {
    this.checkLoginStatus()
    this.loadRouteList(true)
  },

  // 添加检查登录状态的方法
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        // 如果没有token，设置默认值
        this.setData({
          loginUser: {
            userRole: ''
          }
        })
        return
      }

      const result = await getLoginUser()
      if (result.code === 200 && result.data) {
        this.setData({
          loginUser: {
            userRole: result.data.userRole || ''
          }
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.setData({
        loginUser: {
          userRole: ''
        }
      })
    }
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
    
    // 根据用户角色决定跳转页面
    const userRole = this.data.loginUser.userRole
    if (userRole === 'admin' || userRole === 'inspector') {
      // 管理员和巡查员可以编辑
      wx.navigateTo({
        url: `/subpages/manage/routes_edit/index?id=${id}`,
        fail: () => {
          Notify({ type: 'danger', message: '页面跳转失败' })
        }
      })
    } else {
      // 其他用户只能查看
      wx.navigateTo({
        url: `/subpages/attraction/routes_show/index?id=${id}`,
        fail: () => {
          Notify({ type: 'danger', message: '页面跳转失败' })
        }
      })
    }
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
      item.attractions && item.attractions.length >= 2
    )
    
    if (routes.length === 0) return
    
    // 准备包含点数组用于自适应缩放
    const points: any[] = []
    const markers: any[] = []
    let markerId = 0
    
    // 为每条路线创建景点标记
    routes.forEach((route, routeIndex) => {
      if (!route.attractions) return
      
      route.attractions.forEach((attraction, attractionIndex) => {
        if (!attraction.attractionsLat || !attraction.attractionsLng) return
        
        markers.push({
          id: markerId,
          latitude: attraction.attractionsLat,
          longitude: attraction.attractionsLng,
          title: attraction.attractionsName || `景点${attractionIndex + 1}`,
          callout: {
            content: `${attraction.attractionsName || `景点${attractionIndex + 1}`}`,
            color: '#000000',
            fontSize: 12,
            borderRadius: 4,
            bgColor: '#ffffff',
            padding: 5,
            display: 'ALWAYS'
          },
          customCalloutData: {
            routeId: route.id,
            attractionIndex: attractionIndex,
            isFirstAttraction: attractionIndex === 0,
            isLastAttraction: attractionIndex === (route.attractions?.length || 0) - 1
          }
        })
        
        points.push({
          latitude: attraction.attractionsLat,
          longitude: attraction.attractionsLng
        })
        
        markerId++
      })
    })
    
    this.setData({
      mapMarkers: markers,
      includePoints: points
    })
  },

  // 地图更新完成
  onMapUpdated(e: any) {
    // 地图更新完成后的回调
  },
  
  // 点击标记气泡
  onCalloutTap(e: any) {
    // 可以在这里处理气泡点击事件
  },
  
  // 点击标记
  onMarkerTap(e: any) {
    const marker = this.data.mapMarkers.find(m => m.id === e.detail.markerId)
    if (marker && marker.customCalloutData) {
      const { routeId } = marker.customCalloutData
      if (routeId) {
        // 根据用户角色决定跳转页面
        const userRole = this.data.loginUser.userRole
        if (userRole === 'admin' || userRole === 'inspector') {
          wx.navigateTo({
            url: `/subpages/manage/routes_edit/index?id=${routeId}`,
            fail: () => {
              Notify({ type: 'danger', message: '页面跳转失败' })
            }
          })
        } else {
          wx.navigateTo({
            url: `/subpages/attraction/routes_show/index?id=${routeId}`,
            fail: () => {
              Notify({ type: 'danger', message: '页面跳转失败' })
            }
          })
        }
      }
    }
  },
  
  // 新增路线
  onAddRouteTap() {
    wx.navigateTo({
      url: '/subpages/manage/routes_edit/index',
      fail: () => {
        Notify({ type: 'danger', message: '页面跳转失败' })
      }
    })
  },
  
  // 页面显示时检查是否需要刷新
  onShow() {
    if (this.data.needRefresh) {
      this.setData({ needRefresh: false })
      this.loadRouteList(true)
    }
  },

  // 返回按钮
  onBack() {
    wx.navigateBack()
  }
})