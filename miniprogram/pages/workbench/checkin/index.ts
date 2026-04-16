import Toast from 'tdesign-miniprogram/toast/index'
import { addTaskCheckin } from '../../../api/controller/task-checkin-controller/task-checkin-controller'
import { formatDateTime } from '../../../utils/util'

const TENCENT_MAP_KEY = 'KDLBZ-XX7EV-BCMPK-5IHBO-3JVUF-EVBLH'

Page({
  data: {
    latitude: 41.1731307,
    longitude: 121.0499674,
    scale: 16,
    minScale: 5,
    maxScale: 18,
    setting: {
      skew: 0,
      rotate: 0,
      enableRotate: false,
      enableScroll: true,
      enableZoom: true,
    },
    locLatitude: 0,
    locLongitude: 0,
    address: '正在解析当前位置...',
    addressLoading: false,
    timeStr: '',
    dateStr: '',
    checkinDone: false,
    checkinLoading: false,
  },

  _timerInterval: null as any,
  _mapCtx: null as WechatMiniprogram.MapContext | null,

  onLoad() {
    this._startClock()
    this._locateAndDecode()
  },

  onReady() {
    this._mapCtx = wx.createMapContext('checkin-map', this)
  },

  onUnload() {
    if (this._timerInterval) clearInterval(this._timerInterval)
  },

  _startClock() {
    const tick = () => {
      const now = new Date()
      const [datePart = '', timePart = ''] = formatDateTime(now).split(' ')
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      this.setData({
        timeStr: timePart,
        dateStr: `${datePart} ${weekDays[now.getDay()]}`,
      })
    }
    tick()
    this._timerInterval = setInterval(tick, 1000)
  },

  _locateAndDecode() {
    this.setData({ addressLoading: true, address: '正在解析当前位置...' })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({ latitude, longitude, locLatitude: latitude, locLongitude: longitude, scale: 16 })
        this._reverseGeocode(latitude, longitude)
        this._mapCtx?.moveToLocation({ latitude, longitude })
      },
      fail: () => {
        this.setData({ addressLoading: false, address: '定位失败，请检查权限' })
        Toast({ context: this, selector: '#t-toast', message: '获取位置失败，请检查位置权限', theme: 'error' })
      },
    })
  },

  _reverseGeocode(latitude: number, longitude: number) {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      method: 'GET',
      data: {
        location: `${latitude},${longitude}`,
        key: TENCENT_MAP_KEY,
        get_poi: 0,
        poi_options: 'policy=5',
      },
      success: (res: any) => {
        const address =
          res?.data?.result?.formatted_addresses?.recommend ||
          res?.data?.result?.address ||
          '未知位置'

        this.setData({
          address,
          locLatitude: latitude,
          locLongitude: longitude,
          addressLoading: false,
        })
      },
      fail: () => {
        this.setData({
          address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          locLatitude: latitude,
          locLongitude: longitude,
          addressLoading: false,
        })
      },
    })
  },

  onRelocalTap() {
    this._locateAndDecode()
  },

  async onCheckinTap() {
    if (this.data.checkinLoading || this.data.checkinDone) return
    if (!this.data.locLatitude || !this.data.locLongitude) {
      Toast({ context: this, selector: '#t-toast', message: '请先获取位置后再签到', theme: 'warning' })
      return
    }
    this.setData({ checkinLoading: true })
    try {
      await addTaskCheckin({
        checkinLng: this.data.locLongitude,
        checkinLat: this.data.locLatitude,
        checkinAddress: this.data.address,
      })
      this.setData({ checkinDone: true, checkinLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '签到成功！', theme: 'success' })
    } catch {
      this.setData({ checkinLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '签到失败，请重试', theme: 'error' })
    }
  },

  onHistoryTap() {
    wx.navigateTo({ url: '../checkin-record/index' })
  },
})

