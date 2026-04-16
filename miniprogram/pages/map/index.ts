import { withInspectionStatus } from '../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { listTaskCheckinsByPage } from '../../api/controller/task-checkin-controller/task-checkin-controller'
import { listAttractionsByPage } from '../../api/controller/attractions-controller/attractions-controller'
import { listAllTypes } from '../../api/controller/attractions-type-controller/attractions-type-controller'
import { getTrackDetail } from '../../api/controller/task-track-controller/task-track-controller'
import { formatDateTime } from '../../utils/util'

type MapType = 'checkin' | 'attraction' | 'track'

interface PanelInfo {
  title: string
  tag: string
  detail: string
  image: string
  targetId: string
}

const DEFAULT_CENTER = {
  latitude: 41.1731307,
  longitude: 121.0499674,
}

const DEFAULT_SCALE = 14

const isValidCoordinate = (latitude: any, longitude: any) => {
  return typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude)
}

const buildCallout = (content: string, bgColor: string, color = '#ffffff', display: 'BYCLICK' | 'ALWAYS' = 'BYCLICK') => ({
  content,
  color,
  fontSize: 11,
  borderRadius: 6,
  bgColor,
  padding: 5,
  display,
  textAlign: 'center',
})

const includesKeyword = (keyword: string, values: any[]) => {
  if (!keyword) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(keyword))
}

const formatMaybeDateTime = (value: any) => {
  if (!value) return '—'
  return formatDateTime(value)
}

const buildTrackMarkers = (points: Array<{ latitude: number; longitude: number }>, isFinished: boolean) => {
  if (!points.length) return []

  const start = points[0]
  const end = points[points.length - 1]
  const markers = [{
    id: 1,
    latitude: start.latitude,
    longitude: start.longitude,
    width: 30,
    height: 38,
    callout: buildCallout('起点', '#0052d9'),
  }]

  const isSamePoint = Math.abs(start.latitude - end.latitude) < 0.000001
    && Math.abs(start.longitude - end.longitude) < 0.000001
  if (isFinished && !isSamePoint) {
    markers.push({
      id: 2,
      latitude: end.latitude,
      longitude: end.longitude,
      width: 30,
      height: 38,
      callout: buildCallout('终点', '#19b67a'),
    })
  }

  return markers
}

Page(withInspectionStatus({
  _mapCtx: null as any,
  _clusterMarkerIds: [] as number[],
  _clusterMarkers: [] as any[],
  _markerDataMap: {} as Record<number, any>,
  _allAttractions: [] as any[],
  _allCheckins: [] as any[],
  _trackDetail: null as any,
  _clusterInited: false,
  _nextMarkerId: 1,
  _targetCheckinId: '',

  data: {
    type: 'attraction' as MapType,
    trackId: '',
    pageTitle: '景点地图',
    loading: true,
    navBarHeight: 0,
    toolStackTop: '120px',
    markers: [] as any[],
    polyline: [] as any[],
    latitude: DEFAULT_CENTER.latitude,
    longitude: DEFAULT_CENTER.longitude,
    scale: DEFAULT_SCALE,
    showPanel: false,
    panel: null as PanelInfo | null,
    searchKeyword: '',
    selectedTypeIds: [] as string[],
    typeOptions: [] as { id: string; label: string }[],
    showTypeFilter: false,
    showCluster: true,
    showLabels: true,
    showTrackLine: true,
    showTrackPoints: false,
    satellite: false,
    overlooking: false,
    countText: '0 个点位',
    trackTitle: '轨迹回放',
    trackSummary: '',
  },

  onLoad(options: any) {
    const type: MapType = options?.type === 'checkin' ? 'checkin' : options?.type === 'track' ? 'track' : 'attraction'
    const trackId = options?.id || ''
    this._targetCheckinId = type === 'checkin' ? String(options?.id || '') : ''
    const pageTitle = type === 'checkin' ? '签到地图' : type === 'track' ? '轨迹地图' : '景点地图'
    const navBarHeight = getApp<IAppOption>().globalData?.navBarHeight ?? 0
    this.setData({
      type,
      trackId,
      pageTitle,
      navBarHeight,
      toolStackTop: `${navBarHeight + 24}px`,
      showCluster: type === 'attraction',
      showTrackPoints: false,
      showTrackLine: true,
    })
    this._loadData()
  },

  onReady() {
    this._mapCtx = wx.createMapContext('map-view', this)
    this._initMarkerCluster()
    this._syncToolStackTop()
    this._rebuildMapDisplay(true)
  },

  _syncToolStackTop() {
    const fallbackTop = `${(this.data.navBarHeight || 0) + 24}px`
    const overlaySelector = this.data.type === 'track' ? '.track-summary' : '.search-bar-layer'
    wx.createSelectorQuery()
      .in(this)
      .select(overlaySelector)
      .boundingClientRect()
      .exec((result) => {
        const rect = result?.[0]
        if (!rect) {
          this.setData({ toolStackTop: fallbackTop })
          return
        }
        this.setData({ toolStackTop: `${Math.round(rect.bottom + 16)}px` })
      })
  },

  onUnload() {
    this._clearClusterMarkers()
  },

  async _loadData() {
    this.setData({ loading: true, showPanel: false, panel: null })
    try {
      if (this.data.type === 'attraction') {
        await this._loadAttractions()
      } else if (this.data.type === 'checkin') {
        await this._loadCheckins()
      } else {
        await this._loadTrackDetail()
      }
    } catch {
      Toast({ context: this, selector: '#t-toast', message: '地图数据加载失败', theme: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  _initMarkerCluster() {
    const ctx = this._mapCtx as any
    if (!ctx || this._clusterInited || typeof ctx.initMarkerCluster !== 'function') return
    this._clusterInited = true
    ctx.initMarkerCluster({
      enableDefaultStyle: true,
      zoomOnClick: true,
      gridSize: 48,
    })
  },

  async _loadAttractions() {
    const [attractionsRes, typesRes] = await Promise.all([
      listAttractionsByPage({ current: 1, pageSize: 500, sortField: 'updateTime', sortOrder: 'descend' }),
      listAllTypes(),
    ])
    this._allAttractions = (attractionsRes?.data?.records ?? []).filter((item: any) => isValidCoordinate(item.attractionsLat, item.attractionsLng))
    this.setData({
      typeOptions: (typesRes?.data ?? []).map((item: any) => ({ id: item.id, label: item.typeName || '未命名类型' })),
    })
    this._applyAttractionFilters(true)
  },

  async _loadCheckins() {
    let role = 'user'
    let userId = ''
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) {
        const info = JSON.parse(raw)
        role = info?.role || 'user'
        userId = info?.id || ''
      }
    } catch {}
    const res = await listTaskCheckinsByPage({
      current: 1,
      pageSize: 100,
      sortField: 'createTime',
      sortOrder: 'descend',
      userId: role !== 'admin' && userId ? userId : undefined,
    })
    this._allCheckins = (res?.data?.records ?? []).filter((item: any) => isValidCoordinate(item.checkinLat, item.checkinLng))
    this._applyCheckinFilters(true)
  },

  async _loadTrackDetail() {
    if (!this.data.trackId) {
      throw new Error('missing track id')
    }
    const res = await getTrackDetail({ id: this.data.trackId })
    this._trackDetail = res?.data ?? null
    this._applyTrackDisplay(true)
  },

  _nextId() {
    const current = this._nextMarkerId
    this._nextMarkerId += 1
    return current
  },

  _applyAttractionFilters(autoFit = true) {
    const keyword = this.data.searchKeyword.trim().toLowerCase()
    const { selectedTypeIds, showLabels, showCluster } = this.data
    this._markerDataMap = {}
    this._nextMarkerId = 1
    const markers = this._allAttractions
      .filter((item: any) => {
        const matchedKeyword = includesKeyword(keyword, [
          item.attractionsName,
          item.attractionsDescription,
          ...(item.types ?? []).map((typeItem: any) => typeItem?.typeName),
        ])
        const itemTypeIds = (item.types ?? []).map((typeItem: any) => typeItem?.id).filter(Boolean)
        const matchedType = selectedTypeIds.length === 0 || selectedTypeIds.some((id) => itemTypeIds.includes(id))
        return matchedKeyword && matchedType
      })
      .map((item: any) => {
        const markerId = this._nextId()
        this._markerDataMap[markerId] = { ...item, __mapKind: 'attraction' }
        return {
          id: markerId,
          latitude: item.attractionsLat,
          longitude: item.attractionsLng,
          width: 32,
          height: 40,
          joinCluster: true,
          callout: showLabels && !showCluster ? buildCallout(item.attractionsName || '景点', '#0052d9') : undefined,
        }
      })
    this.setData({ countText: `${markers.length} 个景点` })
    this._renderAttractionMarkers(markers, autoFit)
  },

  _renderAttractionMarkers(markers: any[], autoFit: boolean) {
    if (this.data.showCluster) {
      this._clusterMarkers = markers
      this.setData({ markers: [], polyline: [], showPanel: false }, () => {
        this._syncClusterMarkers(autoFit)
      })
      return
    }
    this._clearClusterMarkers()
    const normalMarkers = markers.map(({ joinCluster, ...rest }) => rest)
    this.setData({ markers: normalMarkers, polyline: [], showPanel: false }, () => {
      if (autoFit) this._fitToCurrentData()
    })
  },

  _applyCheckinFilters(autoFit = true) {
    const keyword = this.data.searchKeyword.trim().toLowerCase()
    this._clearClusterMarkers()
    this._markerDataMap = {}
    this._nextMarkerId = 1
    const markers = this._allCheckins
      .filter((item: any) => includesKeyword(keyword, [item.user?.userNickname, item.user?.userAccount, item.checkinAddress]))
      .map((item: any) => {
        const markerId = this._nextId()
        this._markerDataMap[markerId] = { ...item, __mapKind: 'checkin' }
        return {
          id: markerId,
          latitude: item.checkinLat,
          longitude: item.checkinLng,
          width: 30,
          height: 38,
          callout: this.data.showLabels
            ? buildCallout(item.user?.userNickname || item.user?.userAccount || '签到', '#ffffff', '#333333', 'BYCLICK')
            : undefined,
        }
      })
    this.setData({ markers, polyline: [], showPanel: false, countText: `${markers.length} 个签到点` }, () => {
      if (this._targetCheckinId) {
        this._focusTargetCheckin()
        return
      }
      if (autoFit) this._fitToCurrentData()
    })
  },

  _focusTargetCheckin() {
    const targetEntry = Object.entries(this._markerDataMap).find(([, item]: any) => String(item?.id || '') === this._targetCheckinId)
    if (!targetEntry) {
      this._fitToCurrentData()
      return
    }

    const [, item] = targetEntry as [string, any]
    const latitude = item.checkinLat
    const longitude = item.checkinLng
    if (!isValidCoordinate(latitude, longitude)) {
      this._fitToCurrentData()
      return
    }

    const ctx = this._mapCtx as any
    this.setData({
      latitude,
      longitude,
      scale: 16,
      showPanel: true,
      panel: {
        title: item.user?.userNickname || item.user?.userAccount || '未知用户',
        tag: item.createTime ? formatDateTime(item.createTime) : '',
        detail: item.checkinAddress || '',
        image: '',
        targetId: item.id || '',
      },
    })
    if (ctx && typeof ctx.moveToLocation === 'function') {
      ctx.moveToLocation({ latitude, longitude })
    }
  },

  _applyTrackDisplay(autoFit = true) {
    this._clearClusterMarkers()
    this._markerDataMap = {}
    this._nextMarkerId = 1
    const detail = this._trackDetail
    const rawPoints = [...(detail?.points ?? [])]
      .filter((item: any) => isValidCoordinate(item.trackLat, item.trackLng))
      .sort((left: any, right: any) => Number(left.trackTimestamp ?? 0) - Number(right.trackTimestamp ?? 0))

    const linePoints = rawPoints.map((item: any) => ({ latitude: item.trackLat, longitude: item.trackLng }))
    const trackOwner = detail?.user?.userNickname || detail?.user?.userAccount || '未知用户'
    const startText = formatMaybeDateTime(detail?.trackStartTime)
    const endText = detail?.trackEndTime ? formatMaybeDateTime(detail?.trackEndTime) : '未结束'
    const trackSummary = `${startText} - ${endText}`
    const isFinished = detail?.trackStatus === 'finished' || !!detail?.trackEndTime

    this.setData({
      markers: buildTrackMarkers(linePoints, isFinished),
      polyline: this.data.showTrackLine && linePoints.length > 1
        ? [{
            points: linePoints,
            color: '#0052d9',
            width: 8,
            borderColor: '#ffffff',
            borderWidth: 2,
            arrowLine: true,
            level: 'abovelabels',
          }]
        : [],
      countText: `${rawPoints.length} 个轨迹点`,
      trackTitle: trackOwner,
      trackSummary,
      showPanel: false,
    }, () => {
      this._syncToolStackTop()
      if (autoFit) this._fitToCurrentData()
    })
  },

  _syncClusterMarkers(autoFit: boolean) {
    const ctx = this._mapCtx as any
    if (!ctx || typeof ctx.addMarkers !== 'function') {
      const fallbackMarkers = this._clusterMarkers.map(({ joinCluster, ...rest }) => rest)
      this.setData({ markers: fallbackMarkers }, () => {
        if (autoFit) this._fitToCurrentData()
      })
      return
    }
    this._initMarkerCluster()
    this._clusterMarkerIds = this._clusterMarkers.map((item) => item.id)
    ctx.addMarkers({ markers: this._clusterMarkers, clear: true })
    if (autoFit) {
      setTimeout(() => {
        this._fitToCurrentData()
      }, 120)
    }
  },

  _clearClusterMarkers() {
    const ctx = this._mapCtx as any
    this._clusterMarkers = []
    if (!ctx || typeof ctx.removeMarkers !== 'function') {
      this._clusterMarkerIds = []
      return
    }
    try {
      ctx.removeMarkers({ markerIds: this._clusterMarkerIds, clear: true })
    } catch {}
    this._clusterMarkerIds = []
  },

  _fitToCurrentData() {
    const ctx = this._mapCtx as any
    const points: Array<{ latitude: number; longitude: number }> = []
    const markerSource = this.data.type === 'attraction' && this.data.showCluster ? this._clusterMarkers : this.data.markers
    markerSource.forEach((item: any) => {
      if (isValidCoordinate(item.latitude, item.longitude)) {
        points.push({ latitude: item.latitude, longitude: item.longitude })
      }
    })
    this.data.polyline.forEach((item: any) => {
      ;(item.points ?? []).forEach((point: any) => {
        if (isValidCoordinate(point.latitude, point.longitude)) {
          points.push({ latitude: point.latitude, longitude: point.longitude })
        }
      })
    })

    if (!points.length) {
      this.setData({ latitude: DEFAULT_CENTER.latitude, longitude: DEFAULT_CENTER.longitude, scale: DEFAULT_SCALE })
      return
    }

    if (ctx && typeof ctx.includePoints === 'function') {
      ctx.includePoints({ padding: [120, 120, 120, 120], points })
      return
    }

    const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length
    const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length
    this.setData({ latitude, longitude, scale: DEFAULT_SCALE })
  },

  _rebuildMapDisplay(autoFit = true) {
    if (this.data.type === 'attraction') {
      this._applyAttractionFilters(autoFit)
      return
    }
    if (this.data.type === 'checkin') {
      this._applyCheckinFilters(autoFit)
      return
    }
    this._applyTrackDisplay(autoFit)
  },

  onSearchChange(e: any) {
    const searchKeyword = e?.detail?.value ?? ''
    this.setData({ searchKeyword }, () => {
      this._rebuildMapDisplay(false)
    })
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' }, () => {
      this._rebuildMapDisplay(false)
    })
  },

  onFilterTap() {
    if (this.data.type !== 'attraction') return
    this.setData({ showTypeFilter: true })
  },

  onFilterConfirm(e: any) {
    this.setData({
      selectedTypeIds: e?.detail?.value ?? [],
      showTypeFilter: false,
    }, () => {
      this._applyAttractionFilters(false)
    })
  },

  onFilterCancel() {
    this.setData({ showTypeFilter: false })
  },

  onMarkerTap(e: any) {
    const markerId = e?.detail?.markerId
    const item = this._markerDataMap[markerId]
    if (!item) return
    let panel: PanelInfo
    if (item.__mapKind === 'attraction') {
      panel = {
        title: item.attractionsName || '景点',
        tag: (item.types ?? []).map((typeItem: any) => typeItem?.typeName).filter(Boolean).join(' / '),
        detail: item.attractionsDescription || '',
        image: item.attractionsImage || '',
        targetId: item.id || '',
      }
    } else if (item.__mapKind === 'checkin') {
      panel = {
        title: item.user?.userNickname || item.user?.userAccount || '未知用户',
        tag: item.createTime ? formatDateTime(item.createTime) : '',
        detail: item.checkinAddress || '',
        image: '',
        targetId: item.id || '',
      }
    } else {
      const pointTime = item.trackTimestamp ? formatDateTime(new Date(item.trackTimestamp)) : ''
      panel = {
        title: item.__trackPointLabel || '轨迹点',
        tag: pointTime,
        detail: `坐标：${Number(item.trackLat).toFixed(6)}, ${Number(item.trackLng).toFixed(6)}`,
        image: '',
        targetId: item.id || '',
      }
    }
    this.setData({ showPanel: true, panel })
  },

  onPanelClose() {
    this.setData({ showPanel: false })
  },

  onMapTap() {
    if (this.data.showPanel) this.setData({ showPanel: false })
  },

  onViewDetail() {
    const { panel } = this.data
    if (!panel?.targetId || this.data.type !== 'attraction') return
    wx.navigateTo({ url: `/pages/workbench/attraction-detail/index?id=${panel.targetId}` })
  },

  onFitTap() {
    this._fitToCurrentData()
  },

  onLocateTap() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({ latitude: res.latitude, longitude: res.longitude })
        const ctx = this._mapCtx as any
        if (ctx && typeof ctx.moveToLocation === 'function') {
          ctx.moveToLocation({ latitude: res.latitude, longitude: res.longitude })
        }
      },
      fail: () => {
        Toast({ context: this, selector: '#t-toast', message: '定位失败，请检查定位权限', theme: 'error' })
      },
    })
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

  onToggleOverlooking() {
    this.setData({ overlooking: !this.data.overlooking })
  },

  onRouteTap() {
    wx.navigateTo({ url: '/pages/workbench/route/index' })
  },
}))