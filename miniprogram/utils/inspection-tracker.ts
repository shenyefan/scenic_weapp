import { endTrack, getTrackDetail, startTrack } from '../api/controller/task-track-controller/task-track-controller'
import { addPoint } from '../api/controller/task-track-point-controller/task-track-point-controller'

export type InspectionTrackerStatus = 'idle' | 'starting' | 'running' | 'ending' | 'finished'
export type InspectionTrackerSyncState = 'synced' | 'syncing' | 'pending' | 'error'

export interface InspectionTrackerPoint {
  latitude: number
  longitude: number
  timestamp: number
  uploaded: boolean
}

export interface InspectionTrackerSnapshot {
  status: InspectionTrackerStatus
  trackId: string
  startedAt: number
  endedAt: number
  totalDistance: number
  currentLatitude: number
  currentLongitude: number
  points: InspectionTrackerPoint[]
  pendingCount: number
  syncState: InspectionTrackerSyncState
  syncError: string
  locationError: string
}

interface PersistedTrackerState {
  status: Extract<InspectionTrackerStatus, 'starting' | 'running' | 'ending'>
  trackId: string
  startedAt: number
  endedAt: number
  totalDistance: number
  currentLatitude: number
  currentLongitude: number
  points: InspectionTrackerPoint[]
  pendingPoints: InspectionTrackerPoint[]
  syncState: InspectionTrackerSyncState
  syncError: string
  locationError: string
}

type InspectionTrackerListener = (snapshot: InspectionTrackerSnapshot) => void

const STORAGE_KEY = '__inspection_tracker_state__'
const MIN_POINT_DISTANCE = 5

const isValidCoordinate = (latitude: any, longitude: any) => {
  return typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude)
}

const getDistanceMeters = (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
  const toRadians = (value: number) => value * Math.PI / 180
  const earthRadius = 6371000
  const lat1 = toRadians(start.latitude)
  const lat2 = toRadians(end.latitude)
  const deltaLat = lat2 - lat1
  const deltaLng = toRadians(end.longitude - start.longitude)
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

const clonePoint = (point: InspectionTrackerPoint): InspectionTrackerPoint => ({ ...point })

const samePoint = (left: InspectionTrackerPoint, right: InspectionTrackerPoint) => {
  return Math.abs(left.latitude - right.latitude) < 0.000001
    && Math.abs(left.longitude - right.longitude) < 0.000001
    && Math.abs(left.timestamp - right.timestamp) < 1500
}

const createEmptySnapshot = (): InspectionTrackerSnapshot => ({
  status: 'idle',
  trackId: '',
  startedAt: 0,
  endedAt: 0,
  totalDistance: 0,
  currentLatitude: 0,
  currentLongitude: 0,
  points: [],
  pendingCount: 0,
  syncState: 'synced',
  syncError: '',
  locationError: '',
})

const getLocation = () => {
  return new Promise<WechatMiniprogram.GetLocationSuccessCallbackResult>((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject,
    })
  })
}

const startLocationUpdateBackground = () => {
  return new Promise<void>((resolve, reject) => {
    wx.startLocationUpdateBackground({
      success: () => resolve(),
      fail: reject,
    })
  })
}

const startLocationUpdate = () => {
  return new Promise<void>((resolve, reject) => {
    wx.startLocationUpdate({
      success: () => resolve(),
      fail: reject,
    })
  })
}

const stopLocationUpdate = () => {
  return new Promise<void>((resolve) => {
    const stop = (wx as any).stopLocationUpdate
    if (typeof stop !== 'function') {
      resolve()
      return
    }
    stop({ complete: () => resolve() })
  })
}

const buildErrorMessage = (error: any, fallback: string) => {
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

const isPrivateInfoDeclarationError = (error: any) => {
  const message = buildErrorMessage(error, '').toLowerCase()
  return message.includes('requiredprivateinfos') || message.includes('privateinfo')
}

const isBackgroundPermissionError = (error: any) => {
  const message = buildErrorMessage(error, '').toLowerCase()
  return message.includes('scope.userlocationbackground') || message.includes('userlocationbackground')
}

class InspectionTracker {
  private snapshot: InspectionTrackerSnapshot = createEmptySnapshot()
  private pendingPoints: InspectionTrackerPoint[] = []
  private listeners = new Set<InspectionTrackerListener>()
  private locationListener: ((result: WechatMiniprogram.OnLocationChangeCallbackResult) => void) | null = null
  private bootstrapped = false
  private bootstrapPromise: Promise<void> | null = null
  private syncInFlight = false

  private async startLocationUpdatesWithFallback() {
    try {
      await startLocationUpdateBackground()
      return {
        warning: '',
      }
    } catch (backgroundError) {
      console.error('[inspection-tracker] background location update failed', {
        error: backgroundError,
        message: buildErrorMessage(backgroundError, '后台定位启动失败'),
      })

      try {
        await startLocationUpdate()
        const warning = isPrivateInfoDeclarationError(backgroundError)
          ? '后台定位声明未生效，当前仅在小程序前台记录轨迹'
          : isBackgroundPermissionError(backgroundError)
            ? '未开启后台定位授权，当前仅在小程序前台记录轨迹'
            : '后台定位启动失败，当前仅在小程序前台记录轨迹'
        return {
          warning,
        }
      } catch (foregroundError) {
        console.error('[inspection-tracker] foreground location update failed', {
          error: foregroundError,
          message: buildErrorMessage(foregroundError, '前台定位启动失败'),
        })
        throw backgroundError
      }
    }
  }

  getSnapshot() {
    return this.cloneSnapshot()
  }

  subscribe(listener: InspectionTrackerListener) {
    this.listeners.add(listener)
    listener(this.cloneSnapshot())
    return () => {
      this.listeners.delete(listener)
    }
  }

  async bootstrap() {
    if (this.bootstrapped) return
    if (this.bootstrapPromise) {
      await this.bootstrapPromise
      return
    }
    this.bootstrapPromise = this.restoreState()
    await this.bootstrapPromise
    this.bootstrapped = true
    this.bootstrapPromise = null
  }

  async start() {
    await this.bootstrap()
    if (this.snapshot.status === 'running' || this.snapshot.status === 'starting' || this.snapshot.status === 'ending') {
      return this.cloneSnapshot()
    }

    const startedAt = Date.now()
    this.snapshot = {
      ...createEmptySnapshot(),
      status: 'starting',
      startedAt,
    }
    this.emit()

    let trackId = ''
    try {
      const result = await startTrack()
      trackId = result?.data || ''
      if (!trackId) throw new Error('start track failed')

      this.snapshot = {
        ...createEmptySnapshot(),
        status: 'running',
        trackId,
        startedAt,
      }
      this.pendingPoints = []
      this.persistState()
      this.emit()

      this.registerLocationListener()
      const locationUpdateResult = await this.startLocationUpdatesWithFallback()
      this.snapshot = {
        ...this.snapshot,
        locationError: locationUpdateResult.warning,
      }
      this.persistState()
      this.emit()

      await this.captureCurrentLocation()
      return this.cloneSnapshot()
    } catch (error) {
      console.error('[inspection-tracker] start failed', {
        stage: trackId ? 'after-track-created' : 'before-track-created',
        trackId,
        error,
        message: buildErrorMessage(error, '巡查启动失败'),
      })
      if (trackId) {
        try {
          await endTrack({ id: trackId })
        } catch (rollbackError) {
          console.error('[inspection-tracker] rollback endTrack failed', {
            trackId,
            rollbackError,
            message: buildErrorMessage(rollbackError, '回滚轨迹失败'),
          })
        }
      }
      await this.stopTrackingRuntime()
      this.snapshot = createEmptySnapshot()
      this.pendingPoints = []
      this.clearPersistedState()
      this.emit()
      throw error
    }
  }

  async end() {
    await this.bootstrap()
    if (this.snapshot.status !== 'running') {
      return this.cloneSnapshot()
    }

    const trackId = this.snapshot.trackId
    this.snapshot = {
      ...this.snapshot,
      status: 'ending',
      syncError: '',
    }
    this.persistState()
    this.emit()

    try {
      await this.flushPendingPoints(true)
      await endTrack({ id: trackId })
      await this.stopTrackingRuntime()
      this.clearPersistedState()
      this.snapshot = {
        ...this.snapshot,
        status: 'finished',
        endedAt: Date.now(),
        syncState: 'synced',
        syncError: '',
        locationError: '',
      }
      this.pendingPoints = []
      this.emit()
      return this.cloneSnapshot()
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        status: 'running',
        syncState: this.pendingPoints.length ? 'error' : this.snapshot.syncState,
        syncError: this.pendingPoints.length ? '轨迹点上传失败，请稍后重试结束' : '',
      }
      this.persistState()
      this.emit()
      throw error
    }
  }

  private async restoreState() {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as PersistedTrackerState
      if (!parsed?.trackId) {
        this.clearPersistedState()
        return
      }
      this.snapshot = {
        status: parsed.status,
        trackId: parsed.trackId,
        startedAt: parsed.startedAt,
        endedAt: parsed.endedAt || 0,
        totalDistance: parsed.totalDistance,
        currentLatitude: parsed.currentLatitude,
        currentLongitude: parsed.currentLongitude,
        points: (parsed.points ?? []).map(clonePoint),
        pendingCount: (parsed.pendingPoints ?? []).length,
        syncState: parsed.syncState || ((parsed.pendingPoints ?? []).length ? 'pending' : 'synced'),
        syncError: parsed.syncError || '',
        locationError: parsed.locationError || '',
      }
      this.pendingPoints = (parsed.pendingPoints ?? []).map(clonePoint)
      this.emit()
      this.registerLocationListener()

      try {
        const locationUpdateResult = await this.startLocationUpdatesWithFallback()
        this.snapshot = {
          ...this.snapshot,
          locationError: locationUpdateResult.warning,
        }
      } catch (error) {
        console.error('[inspection-tracker] restore startLocationUpdates failed', {
          error,
          message: buildErrorMessage(error, '恢复定位失败'),
        })
        this.snapshot = {
          ...this.snapshot,
          locationError: buildErrorMessage(error, '后台定位未开启，请停留在小程序内继续巡查'),
        }
      }
      await this.hydrateRemoteTrack()
      void this.flushPendingPoints(false)
      this.persistState()
      this.emit()
    } catch {
      this.snapshot = createEmptySnapshot()
      this.pendingPoints = []
      this.clearPersistedState()
    }
  }

  private async hydrateRemoteTrack() {
    if (!this.snapshot.trackId) return
    const result = await getTrackDetail({ id: this.snapshot.trackId })
    const detail = result?.data
    if (!detail) return

    const remoteStatus = detail.trackStatus
    const remotePoints = (detail.points ?? [])
      .filter((item) => isValidCoordinate(item.trackLat, item.trackLng))
      .sort((left, right) => Number(left.trackTimestamp ?? 0) - Number(right.trackTimestamp ?? 0))
      .map((item) => ({
        latitude: Number(item.trackLat),
        longitude: Number(item.trackLng),
        timestamp: Number(item.trackTimestamp ?? Date.now()),
        uploaded: true,
      }))

    if (remotePoints.length) {
      const mergedPoints = [...remotePoints]
      this.pendingPoints.forEach((point) => {
        if (!mergedPoints.some((remotePoint) => samePoint(remotePoint, point))) {
          mergedPoints.push(clonePoint(point))
        }
      })
      mergedPoints.sort((left, right) => left.timestamp - right.timestamp)
      this.snapshot = {
        ...this.snapshot,
        points: mergedPoints,
        totalDistance: this.calculateTotalDistance(mergedPoints),
        currentLatitude: mergedPoints[mergedPoints.length - 1]?.latitude || this.snapshot.currentLatitude,
        currentLongitude: mergedPoints[mergedPoints.length - 1]?.longitude || this.snapshot.currentLongitude,
      }
    }

    if (remoteStatus && remoteStatus !== 'running') {
      await this.stopTrackingRuntime()
      this.pendingPoints = []
      this.clearPersistedState()
      this.snapshot = {
        ...this.snapshot,
        status: 'finished',
        endedAt: detail?.trackEndTime ? new Date(detail.trackEndTime).getTime() : this.snapshot.endedAt || Date.now(),
        syncState: 'synced',
        syncError: '',
        pendingCount: 0,
      }
    }
  }

  private registerLocationListener() {
    if (this.locationListener) return
    this.locationListener = (result) => {
      void this.handleLocationChange(result)
    }
    wx.onLocationChange(this.locationListener)
  }

  private async stopTrackingRuntime() {
    if (this.locationListener) {
      wx.offLocationChange()
      this.locationListener = null
    }
    await stopLocationUpdate()
  }

  private async captureCurrentLocation() {
    try {
      const result = await getLocation()
      await this.handleLocationChange({
        latitude: result.latitude,
        longitude: result.longitude,
        speed: 0,
        accuracy: result.accuracy,
        altitude: result.altitude,
        horizontalAccuracy: result.horizontalAccuracy,
        verticalAccuracy: result.verticalAccuracy,
      })
    } catch (error) {
      console.error('[inspection-tracker] initial getLocation failed', {
        error,
        message: buildErrorMessage(error, '当前位置获取失败'),
      })
      this.snapshot = {
        ...this.snapshot,
        locationError: buildErrorMessage(error, '当前位置获取失败，请检查定位权限'),
      }
      this.persistState()
      this.emit()
    }
  }

  private async handleLocationChange(result: WechatMiniprogram.OnLocationChangeCallbackResult) {
    if (this.snapshot.status !== 'running' && this.snapshot.status !== 'ending') return
    const latitude = Number(result.latitude)
    const longitude = Number(result.longitude)
    if (!isValidCoordinate(latitude, longitude)) {
      return
    }

    const nextPoint: InspectionTrackerPoint = {
      latitude,
      longitude,
      timestamp: Date.now(),
      uploaded: false,
    }
    const lastPoint = this.snapshot.points[this.snapshot.points.length - 1]
    if (lastPoint) {
      const distance = getDistanceMeters(lastPoint, nextPoint)
      if (distance < MIN_POINT_DISTANCE) {
        this.snapshot = {
          ...this.snapshot,
          currentLatitude: latitude,
          currentLongitude: longitude,
          locationError: '',
        }
        this.persistState()
        this.emit()
        return
      }
      this.snapshot = {
        ...this.snapshot,
        totalDistance: this.snapshot.totalDistance + distance,
      }
    }

    this.snapshot = {
      ...this.snapshot,
      currentLatitude: latitude,
      currentLongitude: longitude,
      points: [...this.snapshot.points, nextPoint],
      pendingCount: this.pendingPoints.length + 1,
      syncState: 'pending',
      syncError: '',
      locationError: '',
    }
    this.pendingPoints = [...this.pendingPoints, nextPoint]
    this.persistState()
    this.emit()
    void this.flushPendingPoints(false)
  }

  private async flushPendingPoints(force: boolean) {
    if (!this.snapshot.trackId || this.syncInFlight || !this.pendingPoints.length) return
    if (!force && this.snapshot.status !== 'running' && this.snapshot.status !== 'ending') return

    this.syncInFlight = true
    this.snapshot = {
      ...this.snapshot,
      syncState: 'syncing',
      syncError: '',
    }
    this.persistState()
    this.emit()

    while (this.pendingPoints.length) {
      const point = this.pendingPoints[0]
      try {
        await addPoint({
          trackId: this.snapshot.trackId,
          trackLat: point.latitude,
          trackLng: point.longitude,
        })
        this.pendingPoints.shift()
        this.snapshot = {
          ...this.snapshot,
          points: this.snapshot.points.map((item) => samePoint(item, point) ? { ...item, uploaded: true } : item),
          pendingCount: this.pendingPoints.length,
          syncState: this.pendingPoints.length ? 'syncing' : 'synced',
          syncError: '',
        }
        this.persistState()
        this.emit()
      } catch (error) {
        console.error('[inspection-tracker] point upload failed', {
          trackId: this.snapshot.trackId,
          point,
          error,
          message: buildErrorMessage(error, '轨迹点上传失败'),
        })
        this.snapshot = {
          ...this.snapshot,
          pendingCount: this.pendingPoints.length,
          syncState: 'error',
          syncError: '轨迹点上传失败，网络恢复后会继续补传',
        }
        this.persistState()
        this.emit()
        break
      }
    }

    this.syncInFlight = false
  }

  private calculateTotalDistance(points: InspectionTrackerPoint[]) {
    if (points.length < 2) return 0
    return points.reduce((total, point, index) => {
      if (index === 0) return total
      return total + getDistanceMeters(points[index - 1], point)
    }, 0)
  }

  private persistState() {
    if (this.snapshot.status !== 'starting' && this.snapshot.status !== 'running' && this.snapshot.status !== 'ending') {
      this.clearPersistedState()
      return
    }
    const payload: PersistedTrackerState = {
      status: this.snapshot.status,
      trackId: this.snapshot.trackId,
      startedAt: this.snapshot.startedAt,
      endedAt: this.snapshot.endedAt,
      totalDistance: this.snapshot.totalDistance,
      currentLatitude: this.snapshot.currentLatitude,
      currentLongitude: this.snapshot.currentLongitude,
      points: this.snapshot.points.map(clonePoint),
      pendingPoints: this.pendingPoints.map(clonePoint),
      syncState: this.snapshot.syncState,
      syncError: this.snapshot.syncError,
      locationError: this.snapshot.locationError,
    }
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(payload))
  }

  private clearPersistedState() {
    wx.removeStorageSync(STORAGE_KEY)
  }

  private emit() {
    const snapshot = this.cloneSnapshot()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private cloneSnapshot(): InspectionTrackerSnapshot {
    return {
      ...this.snapshot,
      points: this.snapshot.points.map(clonePoint),
      pendingCount: this.pendingPoints.length,
    }
  }
}

export const inspectionTracker = new InspectionTracker()
