import { listAttractionsVoByPage } from '../../../api/attractionsController'
import { getLoginUser } from '../../../api/userController'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    attractionList: [] as API.AttractionsVO[],
    searchValue: '',
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
    includePoints: [] as any[],
    needRefresh: false, // 添加刷新标记
    // 添加登录用户信息
    loginUser: {
      userRole: ''
    }
  },

  onLoad() {
    this.checkLoginStatus()
    this.loadAttractionList(true)
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
          loginUser: result.data
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

  // 加载景点列表
  async loadAttractionList(refresh = false) {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      const pageInfo = this.data.pageInfo
      const params: API.AttractionsQueryRequest = {
        current: refresh ? 1 : pageInfo.current,
        // 地图模式下加载更多数据
        pageSize: this.data.viewMode === 'map' ? 999 : pageInfo.pageSize,
      }
      
      // 添加搜索参数
      if (this.data.searchValue) {
        params.attractionsName = this.data.searchValue
      }
      
      const res = await listAttractionsVoByPage(params)
      
      if (res.code === 200 && res.data) {
        const { records, total, current, size } = res.data
        const newList = refresh ? records : [...this.data.attractionList, ...records]
        
        // 判断是否还有更多数据 - 修复hasMore判断逻辑
        const hasMore = records.length > 0 && newList.length < total
        
        this.setData({
          attractionList: newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total,
          'pageInfo.hasMore': hasMore
        })

        // 更新地图标记
        if (this.data.viewMode === 'map') {
          this.updateMapMarkers()
        }
      } else {
        Notify({ type: 'danger', message: res.message || '获取景点列表失败' })
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
      Notify({ type: 'danger', message: '获取景点列表失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 搜索框输入变化
  onSearchChange(e) {
    this.setData({
      searchValue: e.detail,
      attractionList: [],
      'pageInfo.current': 1,
      'pageInfo.hasMore': true
    })
    this.loadAttractionList(true)
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
      this.loadAttractionList(false)
    }
  },
  
  // 点击景点项
  onAttractionTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    if (id && this.data.loginUser.userRole == 'admin') {
      wx.navigateTo({
        url: `/subpages/manage/attractions_edit/index?id=${id}`,
        fail: () => {
          Notify({ type: 'danger', message: '页面跳转失败' })
        }
      })
    } else if (id) {
      wx.navigateTo({
        url: `/subpages/attraction/detail/index?id=${id}`,
        fail: () => {
          Notify({ type: 'danger', message: '页面跳转失败' })
        }
      })
    }
  },

  // 切换到列表视图
  switchToListView() {
    if (this.data.viewMode !== 'list') {
      this.setData({ viewMode: 'list' })
    }
  },

  // 切换到地图视图
  switchToMapView() {
    if (this.data.viewMode !== 'map') {
      this.setData({ 
        viewMode: 'map',
        'pageInfo.pageSize': 999 // 地图模式下加载更多数据
      })
      this.loadAttractionList(true)
    }
  },

  // 切换视图模式
  toggleViewMode() {
    const newMode = this.data.viewMode === 'list' ? 'map' : 'list';
    
    this.setData({ 
      viewMode: newMode,
      'pageInfo.pageSize': newMode === 'map' ? 999 : 10 // 地图模式下加载更多数据
    });
    
    if (newMode === 'map') {
      this.loadAttractionList(true);
    }
  },

  // 更新地图标记
  updateMapMarkers() {
    const attractions = this.data.attractionList
      .filter(item => item.attractionsLat && item.attractionsLng) // 过滤掉没有经纬度的景点
    
    if (attractions.length === 0) return
    
    // 准备包含点数组用于自适应缩放
    const points = attractions.map(item => ({
      latitude: item.attractionsLat,
      longitude: item.attractionsLng
    }))
    
    // 准备标记点
    const markers = attractions.map((item, index) => ({
      id: index,
      latitude: item.attractionsLat,
      longitude: item.attractionsLng,
      title: item.attractionsName || '未命名景点',
      joinCluster: true, // 参与点聚合
      callout: {
        content: item.attractionsName || '未命名景点',
        color: '#000000',
        fontSize: 12,
        borderRadius: 4,
        bgColor: '#ffffff',
        padding: 5,
        display: 'ALWAYS' // 始终显示气泡
      },
      // 存储原始id用于点击事件
      customCalloutData: {
        originalId: item.id
      }
    }))

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
      const attractionId = marker.customCalloutData.originalId
      if (attractionId && this.data.loginUser.userRole == 'admin') {
        wx.navigateTo({
          url: `/subpages/manage/attractions_edit/index?id=${attractionId}`,
          fail: () => {
            Notify({ type: 'danger', message: '页面跳转失败' })
          }
        })
      } else if (attractionId) {
        wx.navigateTo({
          url: `/subpages/attraction/detail/index?id=${attractionId}`,
          fail: () => {
            Notify({ type: 'danger', message: '页面跳转失败' })
          }
        })
      }
    }
  },

  // 点击新增景点按钮
  onAddAttractionTap() {
    wx.navigateTo({
      url: '/subpages/manage/attractions_edit/index',
      fail: () => {
        Notify({ type: 'danger', message: '页面跳转失败' })
      }
    })
  },
  
  // 添加onShow方法，用于页面显示时检查是否需要刷新
  onShow() {
    // 如果需要刷新，则重新加载列表
    if (this.data.needRefresh) {
      this.loadAttractionList(true)
      this.setData({ needRefresh: false })
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})