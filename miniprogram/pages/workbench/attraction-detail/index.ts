import Toast from 'tdesign-miniprogram/toast/index'
import { getAttractionsById } from '../../../api/controller/attractions-controller/attractions-controller'
import { formatDateTime } from '../../../utils/util'

Page({
  data: {
    loading: true,
    role: 'user',
    detail: null as any,
  },

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

  async fetchDetail(id: string) {
    try {
      const res = await getAttractionsById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      this.setData({
        loading: false,
        detail: {
          id: item.id,
          name: item.attractionsName || '未命名景点',
          image: item.attractionsImage || '',
          video: item.attractionsVideo || '',
          description: item.attractionsDescription || '',
          lng: item.attractionsLng,
          lat: item.attractionsLat,
          types: (item.types ?? []).map((t: any) => t?.typeName).filter(Boolean),
          typeIds: (item.types ?? []).map((t: any) => t?.id).filter(Boolean),
          inspectorName: item.inspector?.userNickname || item.inspector?.userAccount || '',
          inspectorId: item.inspector?.id || '',
          updateTime: formatDateTime(item.updateTime),
        },
      })
    } catch {
      this.setData({ loading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  onEditTap() {
    const { detail } = this.data
    if (!detail) return
    wx.navigateTo({ url: `../attraction-edit/index?id=${detail.id}` })
  },
})
