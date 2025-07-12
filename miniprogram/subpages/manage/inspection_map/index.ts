import { startTrack, endTrack } from '../../../api/taskTrackController'
import Notify from '@vant/weapp/notify/notify'
import Toast from '@vant/weapp/toast/toast'
import Dialog from '@vant/weapp/dialog/dialog'

interface TrackPoint {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
}

// 获取app实例引用
const app = getApp<IAppOption>()

Page({
  data: {
    // 地图相关
    longitude: 116.397428,
    latitude: 39.90923,
    scale: 16,
    polyline: [] as any[],
    
    // 巡查状态（从全局状态同步）
    isPatrolling: false,
    trackId: null as string | null,
    startTime: null as number | null,
    patrolDuration: '00:00:00',
    totalDistance: 0,
    
    // 轨迹数据
    trackPoints: [] as TrackPoint[],
    
    // UI状态
    loading: true,
    durationTimer: null as any
  },

  onLoad() {
    this.initLocation()
    this.syncFromGlobalData() // 从全局状态同步数据
  },

  onShow() {
    this.syncFromGlobalData() // 每次显示时同步数据
    if (this.data.isPatrolling) {
      this.startDurationTimer() // 启动时长计时器
    }
  },

  onHide() {
    this.stopDurationTimer() // 页面隐藏时停止时长计时器
  },

  onUnload() {
    this.stopDurationTimer()
  },

  // 从全局数据同步到页面
  syncFromGlobalData() {
    const globalStatus = app.getPatrolStatus()
    
    this.setData({
      isPatrolling: globalStatus.isPatrolling,
      trackId: globalStatus.trackId,
      startTime: globalStatus.startTime,
      trackPoints: globalStatus.trackPoints,
      totalDistance: Math.round(globalStatus.totalDistance)
    })
    
    // 更新地图轨迹线
    this.updateMapDisplay()
    
    // 如果有轨迹点，将地图中心设置到最后一个点
    if (globalStatus.trackPoints.length > 0) {
      const lastPoint = globalStatus.trackPoints[globalStatus.trackPoints.length - 1]
      this.setData({
        longitude: lastPoint.longitude,
        latitude: lastPoint.latitude
      })
    }
  },

  // 供app.ts调用的更新方法
  updateFromGlobalData(data: any) {
    this.setData({
      trackPoints: data.trackPoints,
      totalDistance: Math.round(data.totalDistance),
      isPatrolling: data.isPatrolling
    })
    this.updateMapDisplay()
    
    // 更新地图中心到最新位置
    if (data.trackPoints.length > 0) {
      const lastPoint = data.trackPoints[data.trackPoints.length - 1]
      this.setData({
        longitude: lastPoint.longitude,
        latitude: lastPoint.latitude
      })
    }
  },

  // 更新地图显示
  updateMapDisplay() {
    if (this.data.trackPoints.length > 1) {
      const polyline = [{
        points: this.data.trackPoints.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude
        })),
        width: 6,
        arrowLine: true,
        level: 'abovelabels',
        color: '#1989fa'
      }]
      
      this.setData({ polyline })
    } else {
      this.setData({ polyline: [] })
    }
  },

  // 初始化定位
  async initLocation() {
    try {
      this.setData({ loading: true })
      
      // 获取当前位置
      const location = await this.getCurrentLocation()
      
      this.setData({
        longitude: location.longitude,
        latitude: location.latitude,
        loading: false
      })
      
    } catch (error) {
      console.error('初始化定位失败:', error)
      this.setData({ loading: false })
      Notify({ type: 'danger', message: '定位失败，请检查定位权限' })
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

  // 切换巡查状态
  async togglePatrol() {
    if (this.data.isPatrolling) {
      await this.stopPatrol()
    } else {
      await this.startPatrol()
    }
  },

  // 开始巡查
  async startPatrol() {
    try {
      Toast.loading({ message: '开始巡查...', duration: 0 })
      
      // 获取当前位置
      const location = await this.getCurrentLocation()
      
      // 调用开始巡查接口
      const result = await startTrack({
        startLatitude: location.latitude,
        startLongitude: location.longitude,
        startTime: new Date().toISOString()
      })
      
      if (result.code === 200 && result.data) {
        const trackId = result.data
        const startTime = Date.now()
        
        // 设置全局巡查状态
        app.setPatrolStatus(true, trackId, startTime)
        
        // 同步到页面
        this.syncFromGlobalData()
        
        // 开始时长计时
        this.startDurationTimer()
        
        Toast.clear()
        Notify({ type: 'success', message: '巡查已开始，支持后台定位' })
      } else {
        Toast.clear()
        Notify({ type: 'danger', message: '开始巡查失败' })
      }
    } catch (error) {
      console.error('开始巡查失败:', error)
      Toast.clear()
      Notify({ type: 'danger', message: '开始巡查失败' })
    }
  },

  // 结束巡查
  async stopPatrol() {
    try {
      Dialog.confirm({
        title: '确认结束巡查',
        message: '确定要结束当前巡查吗？',
      }).then(async () => {
        Toast.loading({ message: '结束巡查...', duration: 0 })
        
        // 获取当前位置
        const location = await this.getCurrentLocation()
        
        // 调用结束巡查接口
        const result = await endTrack({
          trackId: this.data.trackId!,
          endLatitude: location.latitude,
          endLongitude: location.longitude,
          endTime: new Date().toISOString(),
          totalDistance: this.data.totalDistance
        })
        
        if (result.code === 200) {
          // 停止全局巡查状态
          app.setPatrolStatus(false)
          
          // 同步到页面
          this.syncFromGlobalData()
          
          // 停止时长计时
          this.stopDurationTimer()
          
          this.setData({
            patrolDuration: '00:00:00',
            polyline: []
          })
          
          Toast.clear()
          Notify({ type: 'success', message: '巡查已结束' })
        } else {
          Toast.clear()
          Notify({ type: 'danger', message: '结束巡查失败' })
        }
      }).catch(() => {
        // 用户取消
      })
    } catch (error) {
      console.error('结束巡查失败:', error)
      Toast.clear()
      Notify({ type: 'danger', message: '结束巡查失败' })
    }
  },

  // 开始时长计时
  startDurationTimer() {
    if (this.data.durationTimer) {
      clearInterval(this.data.durationTimer)
    }
    
    const timer = setInterval(() => {
      if (this.data.startTime) {
        const duration = Date.now() - this.data.startTime
        const hours = Math.floor(duration / 3600000)
        const minutes = Math.floor((duration % 3600000) / 60000)
        const seconds = Math.floor((duration % 60000) / 1000)
        
        const patrolDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        this.setData({ patrolDuration })
      }
    }, 1000)
    
    this.setData({ durationTimer: timer })
  },

  // 停止时长计时
  stopDurationTimer() {
    if (this.data.durationTimer) {
      clearInterval(this.data.durationTimer)
      this.setData({ durationTimer: null })
    }
  },

  onBack() {
    wx.navigateBack()
  }
})