// app.ts
import { addTrackPoint } from './api/taskTrackController'

interface TrackPoint {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
}

interface GlobalData {
  // 全局巡查状态
  isPatrolling: boolean
  trackId: string | null
  startTime: number | null
  trackPoints: TrackPoint[]
  totalDistance: number
  locationTimer: any
  durationTimer: any
  // 位置采集配置
  locationConfig: {
    interval: number // 采集间隔（毫秒）
    enableBackground: boolean // 是否启用后台定位
  }
}

// 本地存储的key
const PATROL_STORAGE_KEY = 'patrol_status'
const TRACK_ID_STORAGE_KEY = 'patrol_track_id'
const START_TIME_STORAGE_KEY = 'patrol_start_time'
const TRACK_POINTS_STORAGE_KEY = 'patrol_track_points'
const TOTAL_DISTANCE_STORAGE_KEY = 'patrol_total_distance'

App<IAppOption>({
  globalData: {
    isPatrolling: false,
    trackId: null,
    startTime: null,
    trackPoints: [],
    totalDistance: 0,
    locationTimer: null,
    durationTimer: null,
    locationConfig: {
      interval: 2000, // 2秒采集一次
      enableBackground: true
    }
  } as GlobalData,

  onLaunch() {
    console.log('小程序启动')
    // 小程序启动时检查是否有未完成的巡查
    this.checkAndRestorePatrolStatus()
  },

  onShow() {
    console.log('小程序从后台进入前台')
    // 小程序从后台进入前台时，如果正在巡查则确保定位正常运行
    if (this.globalData.isPatrolling) {
      this.ensureLocationTracking()
    }
  },

  onHide() {
    console.log('小程序进入后台')
    // 小程序进入后台时，如果正在巡查则继续后台定位
    // 不停止定位，保持后台运行
  },

  // 检查并恢复巡查状态
  checkAndRestorePatrolStatus() {
    try {
      const isPatrolling = wx.getStorageSync(PATROL_STORAGE_KEY)
      const trackId = wx.getStorageSync(TRACK_ID_STORAGE_KEY)
      const startTime = wx.getStorageSync(START_TIME_STORAGE_KEY)
      const trackPoints = wx.getStorageSync(TRACK_POINTS_STORAGE_KEY) || []
      const totalDistance = wx.getStorageSync(TOTAL_DISTANCE_STORAGE_KEY) || 0
      
      if (isPatrolling && trackId && startTime) {
        console.log('恢复巡查状态:', { trackId, startTime, trackPointsCount: trackPoints.length })
        
        // 恢复全局状态
        this.globalData.isPatrolling = true
        this.globalData.trackId = trackId
        this.globalData.startTime = startTime
        this.globalData.trackPoints = trackPoints
        this.globalData.totalDistance = totalDistance
        
        // 启动定位追踪
        this.startGlobalLocationTracking()
        
        console.log('巡查状态已恢复')
      }
    } catch (error) {
      console.error('恢复巡查状态失败:', error)
    }
  },

  // 开始全局位置追踪
  startGlobalLocationTracking() {
    console.log('开始全局位置追踪')
    
    // 清除现有定时器
    if (this.globalData.locationTimer) {
      clearInterval(this.globalData.locationTimer)
    }

    // 启用后台定位
    wx.startLocationUpdate({
      success: () => {
        console.log('后台定位启动成功')
      },
      fail: (error) => {
        console.error('后台定位启动失败:', error)
      }
    })

    // 监听位置变化
    wx.onLocationChange((location) => {
      if (this.globalData.isPatrolling && this.globalData.trackId) {
        console.log('位置变化:', location)
        this.handleLocationUpdate(location)
      }
    })

    // 定时器作为备用方案
    const timer = setInterval(async () => {
      if (this.globalData.isPatrolling && this.globalData.trackId) {
        try {
          const location = await this.getCurrentLocation()
          this.handleLocationUpdate(location)
        } catch (error) {
          console.error('定时获取位置失败:', error)
        }
      }
    }, this.globalData.locationConfig.interval)

    this.globalData.locationTimer = timer
  },

  // 确保定位追踪正常运行
  ensureLocationTracking() {
    if (!this.globalData.locationTimer) {
      this.startGlobalLocationTracking()
    }
  },

  // 停止全局位置追踪
  stopGlobalLocationTracking() {
    console.log('停止全局位置追踪')
    
    if (this.globalData.locationTimer) {
      clearInterval(this.globalData.locationTimer)
      this.globalData.locationTimer = null
    }

    // 停止后台定位
    wx.stopLocationUpdate({
      success: () => {
        console.log('后台定位已停止')
      }
    })

    // 取消位置变化监听
    wx.offLocationChange()
  },

  // 处理位置更新
  async handleLocationUpdate(location: { latitude: number, longitude: number, accuracy?: number }) {
    try {
      // 添加到轨迹点数组
      const newPoint: TrackPoint = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
        accuracy: location.accuracy
      }
      
      this.globalData.trackPoints.push(newPoint)
      
      // 计算距离
      if (this.globalData.trackPoints.length > 1) {
        const lastPoint = this.globalData.trackPoints[this.globalData.trackPoints.length - 2]
        const distance = this.calculateDistance(
          lastPoint.latitude, lastPoint.longitude,
          newPoint.latitude, newPoint.longitude
        )
        this.globalData.totalDistance += distance
      }
      
      // 发送到服务器
      await this.addTrackPointToServer(location)
      
      // 保存到本地存储
      this.savePatrolDataToLocal()
      
      // 通知页面更新（如果页面正在显示）
      this.notifyPageUpdate()
      
    } catch (error) {
      console.error('处理位置更新失败:', error)
    }
  },

  // 获取当前位置
  getCurrentLocation(): Promise<{ latitude: number, longitude: number, accuracy: number }> {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 4000,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // 添加轨迹点到服务器
  async addTrackPointToServer(location: { latitude: number, longitude: number, accuracy?: number }) {
    try {
      await addTrackPoint({
        trackId: this.globalData.trackId!,
        trackLat: location.latitude,
        trackLng: location.longitude,
        trackTimestamp: Date.now()
      })
      console.log('轨迹点已发送到服务器')
    } catch (error) {
      console.error('发送轨迹点失败:', error)
    }
  },

  // 计算两点间距离（米）
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // 保存巡查数据到本地存储
  savePatrolDataToLocal() {
    try {
      wx.setStorageSync(PATROL_STORAGE_KEY, this.globalData.isPatrolling)
      wx.setStorageSync(TRACK_ID_STORAGE_KEY, this.globalData.trackId)
      wx.setStorageSync(START_TIME_STORAGE_KEY, this.globalData.startTime)
      wx.setStorageSync(TRACK_POINTS_STORAGE_KEY, this.globalData.trackPoints)
      wx.setStorageSync(TOTAL_DISTANCE_STORAGE_KEY, this.globalData.totalDistance)
    } catch (error) {
      console.error('保存巡查数据失败:', error)
    }
  },

  // 清除本地巡查数据
  clearPatrolDataFromLocal() {
    try {
      wx.removeStorageSync(PATROL_STORAGE_KEY)
      wx.removeStorageSync(TRACK_ID_STORAGE_KEY)
      wx.removeStorageSync(START_TIME_STORAGE_KEY)
      wx.removeStorageSync(TRACK_POINTS_STORAGE_KEY)
      wx.removeStorageSync(TOTAL_DISTANCE_STORAGE_KEY)
      console.log('本地巡查数据已清除')
    } catch (error) {
      console.error('清除巡查数据失败:', error)
    }
  },

  // 通知页面更新
  notifyPageUpdate() {
    // 获取当前页面
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    // 如果当前页面是巡查地图页面，则更新数据
    if (currentPage && currentPage.route === 'subpages/manage/inspection_map/index') {
      if (typeof currentPage.updateFromGlobalData === 'function') {
        currentPage.updateFromGlobalData({
          trackPoints: this.globalData.trackPoints,
          totalDistance: this.globalData.totalDistance,
          isPatrolling: this.globalData.isPatrolling
        })
      }
    }
  },

  // 设置巡查状态
  setPatrolStatus(isPatrolling: boolean, trackId: string | null = null, startTime: number | null = null) {
    console.log('设置巡查状态:', { isPatrolling, trackId, startTime })
    
    this.globalData.isPatrolling = isPatrolling
    this.globalData.trackId = trackId
    this.globalData.startTime = startTime
    
    if (isPatrolling && trackId) {
      // 重置轨迹数据
      this.globalData.trackPoints = []
      this.globalData.totalDistance = 0
      
      // 开始定位追踪
      this.startGlobalLocationTracking()
      
      // 保存到本地
      this.savePatrolDataToLocal()
    } else {
      // 停止定位追踪
      this.stopGlobalLocationTracking()
      
      // 清除数据
      this.globalData.trackPoints = []
      this.globalData.totalDistance = 0
      
      // 清除本地存储
      this.clearPatrolDataFromLocal()
    }
  },

  // 获取巡查状态
  getPatrolStatus() {
    return {
      isPatrolling: this.globalData.isPatrolling,
      trackId: this.globalData.trackId,
      startTime: this.globalData.startTime,
      trackPoints: this.globalData.trackPoints,
      totalDistance: this.globalData.totalDistance
    }
  }
})