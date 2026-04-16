// pages/workbench/inspection/index.ts
import Toast from 'tdesign-miniprogram/toast/index'
import { formatDateTime } from '../../../utils/util'
import {
  inspectionTracker,
  type InspectionTrackerPoint,
  type InspectionTrackerSnapshot,
} from '../../../utils/inspection-tracker'

const DEFAULT_CENTER = {
  latitude: 41.1731307,
  longitude: 121.0499674,
}

const DEFAULT_SCALE = 15

const buildCallout = (content: string, bgColor: string, color = '#ffffff') => ({
  content,
  color,
  fontSize: 11,
  borderRadius: 6,
  bgColor,
  padding: 5,
  display: 'BYCLICK' as const,
  textAlign: 'center' as const,
})

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

const formatDistance = (distance: number) => {
  if (distance < 1000) return `${Math.round(distance)} 米`
  return `${(distance / 1000).toFixed(2)} 公里`
}

const getStatusLabel = (status: InspectionTrackerSnapshot['status']) => {
  if (status === 'starting') return '准备中'
  if (status === 'running') return '巡查中'
  if (status === 'ending') return '结束中'
  if (status === 'finished') return '已结束'
  return '未开始'
}

const getSyncText = (snapshot: InspectionTrackerSnapshot) => {
  if (snapshot.locationError) return snapshot.locationError
  if (snapshot.syncState === 'syncing') return `正在同步 ${snapshot.pendingCount} 个点位`
  if (snapshot.syncState === 'pending') return `待同步 ${snapshot.pendingCount} 个点位`
  if (snapshot.syncState === 'error') return snapshot.syncError || '点位同步失败'
  if (snapshot.trackId) return '轨迹已同步'
  return '开始后将自动记录并上传轨迹'
}

const getHintText = (status: InspectionTrackerSnapshot['status']) => {
  if (status === 'running') return '离开当前页面后仍会继续巡查并记录轨迹'
  if (status === 'ending') return '正在提交剩余轨迹点，请稍候'
  if (status === 'finished') return '本次巡查已结束，可以重新开始新的巡查'
  return '点击开始巡查后将自动记录时间、距离和行走路线'
}

const isSameCoordinate = (left: { latitude: number; longitude: number }, right: { latitude: number; longitude: number }) => {
  return Math.abs(left.latitude - right.latitude) < 0.000001 && Math.abs(left.longitude - right.longitude) < 0.000001
}

const getErrorMessage = (error: any, fallback: string) => {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error?.errMsg === 'string' && error.errMsg) return error.errMsg
  if (typeof error?.message === 'string' && error.message) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return fallback
  }
}

Page({
  _mapCtx: null as any,
  _unsubscribe: null as null | (() => void),
  _durationTimer: null as null | ReturnType<typeof setInterval>,
  _trackerSnapshot: null as InspectionTrackerSnapshot | null,

  data: {
    loading: true,
    navBarHeight: 0,
    toolStackTop: '120px',
    latitude: DEFAULT_CENTER.latitude,
    longitude: DEFAULT_CENTER.longitude,
    scale: DEFAULT_SCALE,
    markers: [] as any[],
    polyline: [] as any[],
    satellite: false,
    status: 'idle' as InspectionTrackerSnapshot['status'],
    statusLabel: '未开始',
    startedAtText: '未开始',
    durationText: '00:00:00',
    distanceText: '0 米',
    pointCountText: '0 个轨迹点',
    syncText: '开始后将自动记录并上传轨迹',
    hintText: '点击开始巡查后将自动记录时间、距离和行走路线',
    actionLabel: '开始巡查',
    actionIcon: 'location',
    actionLoading: false,
    actionType: 'start',
  },

  async onLoad() {
    const navBarHeight = getApp<IAppOption>().globalData?.navBarHeight ?? 0
    this.setData({
      navBarHeight,
      toolStackTop: `${navBarHeight + 24}px`,
    })
    this.startDurationTimer()
    try {
      await inspectionTracker.bootstrap()
      const snapshot = inspectionTracker.getSnapshot()
      this._trackerSnapshot = snapshot
      this.applySnapshot(snapshot, { autoFit: snapshot.points.length > 1, moveToCurrent: !snapshot.points.length })
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '巡查状态恢复失败', theme: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onReady() {
    this._mapCtx = wx.createMapContext('inspection-map', this)
    const snapshot = this._trackerSnapshot || inspectionTracker.getSnapshot()
    if (snapshot.points.length > 1) {
      this.fitToCurrentData()
      return
    }
    if (!snapshot.currentLatitude || !snapshot.currentLongitude) {
      this.locateCurrentPosition(false)
    }
  },

  onShow() {
    this.subscribeTracker()
    const snapshot = inspectionTracker.getSnapshot()
    if (!snapshot.points.length && !snapshot.currentLatitude && !snapshot.currentLongitude) {
      void this.locateCurrentPosition(false)
    }
  },

  onHide() {
    this.unsubscribeTracker()
  },

  onUnload() {
    this.unsubscribeTracker()
    if (this._durationTimer) clearInterval(this._durationTimer)
  },

  subscribeTracker() {
    if (this._unsubscribe) return
    this._unsubscribe = inspectionTracker.subscribe((snapshot) => {
      const previousCount = this._trackerSnapshot?.points.length ?? 0
      const nextCount = snapshot.points.length
      this._trackerSnapshot = snapshot
      this.applySnapshot(snapshot, {
        autoFit: previousCount < 2 && nextCount >= 2,
        moveToCurrent: previousCount === 0 && !!snapshot.currentLatitude && !!snapshot.currentLongitude,
      })
    })
  },

  unsubscribeTracker() {
    if (!this._unsubscribe) return
    this._unsubscribe()
    this._unsubscribe = null
  },

  startDurationTimer() {
    const tick = () => {
      const snapshot = this._trackerSnapshot || inspectionTracker.getSnapshot()
      this.updateRuntimeTexts(snapshot)
    }
    tick()
    this._durationTimer = setInterval(tick, 1000)
  },

  updateRuntimeTexts(snapshot: InspectionTrackerSnapshot) {
    const durationEndAt = snapshot.status === 'finished' && snapshot.endedAt ? snapshot.endedAt : Date.now()
    const duration = snapshot.startedAt ? formatDuration(Math.max(durationEndAt - snapshot.startedAt, 0)) : '00:00:00'
    const startedAtText = snapshot.startedAt ? formatDateTime(new Date(snapshot.startedAt)) : '未开始'
    this.setData({
      status: snapshot.status,
      statusLabel: getStatusLabel(snapshot.status),
      startedAtText,
      durationText: duration,
      distanceText: formatDistance(snapshot.totalDistance),
      pointCountText: `${snapshot.points.length} 个轨迹点`,
      syncText: getSyncText(snapshot),
      hintText: getHintText(snapshot.status),
      actionLabel: snapshot.status === 'running' ? '结束巡查' : snapshot.status === 'ending' ? '结束中' : '开始巡查',
      actionIcon: snapshot.status === 'running' || snapshot.status === 'ending' ? 'close-circle' : 'location',
      actionLoading: snapshot.status === 'starting' || snapshot.status === 'ending',
      actionType: snapshot.status === 'running' || snapshot.status === 'ending' ? 'end' : 'start',
    })
  },

  applySnapshot(snapshot: InspectionTrackerSnapshot, options: { autoFit?: boolean; moveToCurrent?: boolean } = {}) {
    const points = snapshot.points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
    const markers = this.buildMarkers(snapshot.points, snapshot.status)
    const nextData: Record<string, any> = {
      markers,
      polyline: points.length > 1
        ? [{
            points,
            color: '#0052d9',
            width: 8,
            borderColor: '#ffffff',
            borderWidth: 2,
            arrowLine: true,
            level: 'abovelabels',
          }]
        : [],
    }

    if (options.moveToCurrent) {
      const lastPoint = points[points.length - 1]
      if (lastPoint) {
        nextData.latitude = lastPoint.latitude
        nextData.longitude = lastPoint.longitude
        nextData.scale = 16
      } else if (snapshot.currentLatitude && snapshot.currentLongitude) {
        nextData.latitude = snapshot.currentLatitude
        nextData.longitude = snapshot.currentLongitude
        nextData.scale = 16
      }
    }

    this.setData(nextData, () => {
      this.updateRuntimeTexts(snapshot)
      if (options.autoFit) this.fitToCurrentData()
    })
  },

  buildMarkers(points: InspectionTrackerPoint[], status: InspectionTrackerSnapshot['status']) {
    if (!points.length) return []
    const start = points[0]
    const current = points[points.length - 1]
    const markers = [{
      id: 1,
      latitude: start.latitude,
      longitude: start.longitude,
      width: 30,
      height: 38,
      callout: buildCallout(points.length === 1 ? '当前位置' : '起点', '#0052d9'),
    }]
    if (status === 'finished' && !isSameCoordinate(start, current)) {
      markers.push({
        id: 2,
        latitude: current.latitude,
        longitude: current.longitude,
        width: 30,
        height: 38,
        callout: buildCallout(status === 'finished' ? '终点' : '当前位置', '#19b67a'),
      })
    }
    return markers
  },

  fitToCurrentData() {
    const ctx = this._mapCtx
    const points: Array<{ latitude: number; longitude: number }> = []
    this.data.markers.forEach((item: any) => {
      points.push({ latitude: item.latitude, longitude: item.longitude })
    })
    this.data.polyline.forEach((item: any) => {
      ;(item.points ?? []).forEach((point: any) => {
        points.push({ latitude: point.latitude, longitude: point.longitude })
      })
    })

    if (!points.length) {
      if (this.data.latitude && this.data.longitude) return
      this.setData({ latitude: DEFAULT_CENTER.latitude, longitude: DEFAULT_CENTER.longitude, scale: DEFAULT_SCALE })
      return
    }

    if (points.length === 1 || !ctx || typeof ctx.includePoints !== 'function') {
      this.setData({ latitude: points[points.length - 1].latitude, longitude: points[points.length - 1].longitude, scale: 16 })
      return
    }

    ctx.includePoints({ padding: [120, 120, 340, 120], points })
  },

  async locateCurrentPosition(moveMap = true) {
    try {
      const result = await new Promise<WechatMiniprogram.GetLocationSuccessCallbackResult>((resolve, reject) => {
        wx.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject,
        })
      })
      const nextData: Record<string, any> = {
        latitude: result.latitude,
        longitude: result.longitude,
      }
      if (!this.data.scale || this.data.scale < 16) nextData.scale = 16
      this.setData(nextData)
      if (moveMap && this._mapCtx && typeof this._mapCtx.moveToLocation === 'function') {
        this._mapCtx.moveToLocation({ latitude: result.latitude, longitude: result.longitude })
      }
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '定位失败，请检查定位权限', theme: 'error' })
    }
  },

  async onActionTap() {
    const snapshot = this._trackerSnapshot || inspectionTracker.getSnapshot()
    if (snapshot.status === 'starting' || snapshot.status === 'ending') return

    if (snapshot.status === 'running') {
      try {
        await inspectionTracker.end()
        Toast({ context: this, selector: '#t-toast', message: '巡查已结束', theme: 'success' })
      } catch {
        Toast({ context: this, selector: '#t-toast', message: '结束巡查失败，请重试', theme: 'error' })
      }
      return
    }

    try {
      console.log('[inspection-page] start inspection tapped')
      await inspectionTracker.start()
      Toast({ context: this, selector: '#t-toast', message: '巡查已开始', theme: 'success' })
    } catch (error) {
      const message = getErrorMessage(error, '开始巡查失败，请检查定位权限')
      console.error('[inspection-page] start inspection failed', {
        error,
        message,
        trackerSnapshot: inspectionTracker.getSnapshot(),
      })
      Toast({ context: this, selector: '#t-toast', message, theme: 'error' })
    }
  },

  onTrackHistoryTap() {
    wx.navigateTo({ url: '/pages/workbench/track/index' })
  },

  onFitTap() {
    this.fitToCurrentData()
  },

  onLocateTap() {
    void this.locateCurrentPosition(true)
  },

  onZoomInTap() {
    const ctx = this._mapCtx as any
    if (ctx && typeof ctx.zoomIn === 'function') {
      ctx.zoomIn()
      return
    }
    this.setData({ scale: Math.min(this.data.scale + 1, 18) })
  },

  onZoomOutTap() {
    const ctx = this._mapCtx as any
    if (ctx && typeof ctx.zoomOut === 'function') {
      ctx.zoomOut()
      return
    }
    this.setData({ scale: Math.max(this.data.scale - 1, 4) })
  },

  onToggleSatellite() {
    this.setData({ satellite: !this.data.satellite })
  },
})