import { getAttractionsVoById } from '../../../api/attractionsController'
import Notify from '@vant/weapp/notify/notify';

Page({
  data: {
    loading: true,
    attraction: null as API.AttractionsVO | null,
    id: ''
  },

  onLoad(options: { id?: string }) {
    console.log(options.id)
    const id = options.id || ''
    if (!id) {
      Notify({ type: 'danger', message: '景点ID无效' });
      wx.navigateBack()
      return
    }
    
    this.setData({ id })
    this.getAttractionDetail()
  },

  // 获取景点详情
  async getAttractionDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        this.setData({
          attraction: res.data
        })
      } else {
        Notify({ type: 'danger', message: '获取景点详情失败' });
      }
    } catch (error) {
      console.error('获取景点详情失败:', error)
      Notify({ type: 'danger', message: '网络请求失败，请稍后重试' });
    } finally {
      this.setData({ loading: false })
    }
  },

  // 预览图片
  previewImage() {
    const { attraction } = this.data
    if (!attraction || !attraction.attractionsImg) return
    
    wx.previewImage({
      urls: [attraction.attractionsImg],
      current: attraction.attractionsImg
    })
  },

  // 视频播放出错
  onVideoError(e: any) {
    console.error('视频播放出错:', e)
    Notify({ type: 'danger', message: '视频播放失败，请检查网络连接' });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})