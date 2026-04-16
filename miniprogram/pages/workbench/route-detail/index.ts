import { withInspectionStatus } from '../../../utils/inspection-status'
import Toast from 'tdesign-miniprogram/toast/index'
import { getRouteById } from '../../../api/controller/attractions-route-controller/attractions-route-controller'

const DEFAULT_CENTER = {
  latitude: 41.1731307,
  longitude: 121.0499674,
}

const DEFAULT_SCALE = 14

const isValidCoordinate = (latitude: any, longitude: any) => {
  return typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude)
}

const buildRouteCallout = (content: string) => ({
  content,
  color: '#ffffff',
  fontSize: 11,
  borderRadius: 6,
  bgColor: '#0052d9',
  padding: 5,
  display: 'BYCLICK' as const,
  textAlign: 'center' as const,
})

Page(withInspectionStatus({
  data: {
    loading: true,
    role: 'user',
    detail: null as any,
    mapLatitude: DEFAULT_CENTER.latitude,
    mapLongitude: DEFAULT_CENTER.longitude,
    mapScale: DEFAULT_SCALE,
    mapMarkers: [] as any[],
    mapPolyline: [] as any[],
    mapPoints: [] as Array<{ latitude: number; longitude: number }>,
  },

  _mapCtx: null as WechatMiniprogram.MapContext | null,

  onLoad(options: any) {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) this.setData({ role: JSON.parse(raw)?.role || 'user' })
    } catch {}
    const id = options?.id
    if (id) {
      this.fetchDetail(id)
    } else {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '参数错误', theme: 'error' })
    }
  },

  onReady() {
    this._mapCtx = wx.createMapContext('route-detail-map', this)
  },

  async fetchDetail(id: string) {
    try {
      const res = await getRouteById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      const routeItems = [...(item.routeItems ?? [])]
        .sort((left: any, right: any) => (left?.sortOrder ?? 0) - (right?.sortOrder ?? 0))
        .map((routeItem: any, index: number) => ({
          id: routeItem.id || `${index}`,
          order: index + 1,
          attractionName: routeItem.attractions?.attractionsName || '未命名景点',
          attractionImage: routeItem.attractions?.attractionsImage || '',
          attractionDescription: routeItem.attractions?.attractionsDescription || '',
          attractionLat: Number(routeItem.attractions?.attractionsLat),
          attractionLng: Number(routeItem.attractions?.attractionsLng),
          stayMinutes: routeItem.estimatedStayMinutes,
          stopNote: routeItem.stopNote || '',
        }))
      const mapRouteItems = routeItems.filter((routeItem: any) => isValidCoordinate(routeItem.attractionLat, routeItem.attractionLng))
      const mapPoints = mapRouteItems.map((routeItem: any) => ({
        latitude: routeItem.attractionLat,
        longitude: routeItem.attractionLng,
      }))
      const mapMarkers = mapRouteItems.map((routeItem: any, index: number) => ({
        id: index + 1,
        latitude: routeItem.attractionLat,
        longitude: routeItem.attractionLng,
        width: 30,
        height: 38,
        callout: buildRouteCallout(`${routeItem.order}. ${routeItem.attractionName}`),
      }))
      this.setData({
        loading: false,
        mapLatitude: mapPoints[0]?.latitude ?? DEFAULT_CENTER.latitude,
        mapLongitude: mapPoints[0]?.longitude ?? DEFAULT_CENTER.longitude,
        mapScale: mapPoints.length > 1 ? 13 : DEFAULT_SCALE,
        mapMarkers,
        mapPolyline: mapPoints.length > 1
          ? [{
              points: mapPoints,
              color: '#0052d9',
              width: 8,
              borderColor: '#ffffff',
              borderWidth: 2,
              arrowLine: true,
              level: 'abovelabels',
            }]
          : [],
        mapPoints,
        detail: {
          id: item.id || '',
          name: item.routeName || '未命名路线',
          image: item.routeImage || '',
          video: item.routeVideo || '',
          description: item.routeDescription || '',
          duration: item.estimatedDurationMinutes,
          itemCount: routeItems.length,
          routeItems,
        },
      }, () => {
        this.fitMapToPoints()
      })
    } catch {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  fitMapToPoints() {
    const { mapPoints } = this.data
    if (mapPoints.length < 2 || !this._mapCtx || typeof this._mapCtx.includePoints !== 'function') return
    this._mapCtx.includePoints({
      padding: [40, 40, 40, 40],
      points: mapPoints,
    })
  },

  onEditTap() {
    const { detail } = this.data
    if (!detail) return
    wx.navigateTo({ url: `../route-edit/index?id=${detail.id}` })
  },
}))