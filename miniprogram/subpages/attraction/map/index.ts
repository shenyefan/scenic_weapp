import { listAttractionsVoByPage } from '../../../api/attractionsController'
import { getAllTypes } from '../../../api/attractionsTypeController'
import Notify from '@vant/weapp/notify/notify';

Page({
  data: {
    searchValue: '',
    activeCategory: 'all',
    loading: false,
    attractionList: [],
    mapMarkers: [],
    mapCenter: {
      latitude: 44.0,  // 默认纬度，可以根据实际情况调整
      longitude: 129.0 // 默认经度，可以根据实际情况调整
    },
    includePoints: [],
    typeList: [], // 添加类型列表
  },

  onLoad() {
    this.getAttractionsList(true)
    this.getTypeList()
  },
  
  // 获取类型列表
  async getTypeList() {
    try {
      const res = await getAllTypes()
      if (res.code === 200 && res.data) {
        this.setData({
          typeList: res.data
        })
      } else {
        Notify({ type: 'danger', message: '获取类型数据失败' });
      }
    } catch (error) {
      console.error('获取类型列表失败:', error)
      Notify({ type: 'danger', message: '网络请求失败，请稍后重试' });
    }
  },

  // 搜索相关函数
  onSearchChange(e) {
    this.setData({
      searchValue: e.detail
    })
    this.getAttractionsList(true)
  },

  onSearchCancel() {
    this.setData({
      searchValue: ''
    })
    this.getAttractionsList(true)
  },

  // 分类切换
  onCategoryTap(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      activeCategory: type
    })
    this.filterAttractions()
  },

  // 根据分类筛选景点
  filterAttractions() {
    const { activeCategory, attractionList, typeList } = this.data
    
    if (activeCategory === 'all') {
      this.updateMapMarkers(attractionList)
      return
    }
    
    // 根据分类筛选
    const filteredList = attractionList.filter(item => {
      // 如果是全部类别，返回所有景点
      if (activeCategory === 'all') return true
      
      // 否则根据选中的类型ID筛选
      return item.types.some(type => type.id === activeCategory)
    })
    
    this.updateMapMarkers(filteredList)
  },

  // 获取景点列表
  async getAttractionsList(refresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const params = {
        current: 1,
        pageSize: 999,
        attractionsName: this.data.searchValue || undefined
      }
      
      const res = await listAttractionsVoByPage(params)
      
      if (res.code === 200 && res.data) {
        const formattedRecords = this.formatAttractionData(res.data.records)
        
        this.setData({
          attractionList: formattedRecords,
          'pageInfo.total': res.data.total,
          'pageInfo.hasMore': false
        })
        
        this.updateMapMarkers(formattedRecords)
      } else {
        Notify({ type: 'danger', message: '获取景点数据失败' });
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
      Notify({ type: 'danger', message: '网络请求失败，请稍后重试' });
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 格式化景点数据
  formatAttractionData(records) {
    return records.map(item => {
      // 处理图片URL
      const image = item.attractionsImg 

      return {
        id: item.id,
        name: item.attractionsName || '未命名景点',
        description: item.attractionsNote || '暂无描述',
        image: image,
        lng: item.attractionsLng,
        lat: item.attractionsLat,
        types: item.attractionsTypes || []
      }
    })
  },

  // 更新地图标记点
  updateMapMarkers(attractions) {
    if (!attractions || attractions.length === 0) {
      this.setData({
        mapMarkers: [],
        includePoints: []
      })
      return
    }
    
    const markers = attractions.map((item, index) => {
      if (!item.lng || !item.lat) return null
      
      return {
        id: index,
        latitude: item.lat,
        longitude: item.lng,
        title: item.name || '未命名景点',
        joinCluster: true, // 添加点聚合功能
        callout: {
          content: item.name || '未命名景点',
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'ALWAYS' // 始终显示气泡
        },
        customCalloutData: {
          originalId: item.id
        }
      }
    }).filter(Boolean)
    
    const points = attractions.map(item => {
      if (!item.lng || !item.lat) return null
      return {
        latitude: item.lat,
        longitude: item.lng
      }
    }).filter(Boolean)
    
    this.setData({
      mapMarkers: markers,
      includePoints: points,
    })
  },

  // 地图标记点点击事件
  onMarkerTap(e) {
    const markerId = e.markerId
    const marker = this.data.mapMarkers[markerId]
    if (marker && marker.customCalloutData) {
      const attractionId = marker.customCalloutData.originalId
      if (attractionId) {
        wx.navigateTo({
          url: `/subpages/attraction/detail/index?id=${attractionId}`,
          fail: () => {
            Notify({ type: 'danger', message: '页面跳转失败' })
          }
        })
      }
    }
  },

  // 标记点气泡点击事件
  onCalloutTap(e) {
    this.onMarkerTap(e)
  },

  // 地图更新完成事件
  onMapUpdated(e) {
    console.log('地图更新完成', e)
  },

  // 线路推荐点击事件
  onRouteRecommendTap() {
    wx.navigateTo({
      url: '/subpages/attraction/routes/index',
      fail: () => {
        Notify({ type: 'danger', message: '页面跳转失败' })
      }
    })
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})