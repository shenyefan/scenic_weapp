import { addTaskCheckin } from '../../../api/taskCheckinController'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    lng: 116.397428,
    lat: 39.90923,
    hour: '00',
    minute: '00',
    locationReady: false,
    isSigningIn: false
  },

  onLoad() {
    this.updateTime()
    this.getCurrentLocation()
    // 每分钟更新一次时间
    setInterval(() => {
      this.updateTime()
    }, 60000)
  },

  // 更新时间显示
  updateTime() {
    const now = new Date()
    const hour = now.getHours().toString().padStart(2, '0')
    const minute = now.getMinutes().toString().padStart(2, '0')
    this.setData({ hour, minute })
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        Notify({ type: 'primary', message: '获取当前位置成功' }),
        this.setData({
          lng: res.longitude,
          lat: res.latitude,
          locationReady: true
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        Notify({ type: 'danger', message: '获取位置失败，请检查定位权限' })
      }
    })
  },

  // 签到功能
  async signIn() {
    if (this.data.isSigningIn) return
    
    if (!this.data.locationReady) {
      Notify({ type: 'warning', message: '正在获取位置信息，请稍后再试' })
      return
    }

    this.setData({ isSigningIn: true })
    Notify({ type: 'primary', message: '签到中...' })

    try {
      // 获取详细地址
      const address = await this.getAddressByLocation(this.data.lng, this.data.lat)
      
      // 调用签到接口
      const result = await addTaskCheckin({
        checkinLng: this.data.lng,
        checkinLat: this.data.lat,
        checkinAddress: address
      })

      if (result.code === 200) {
        Notify({ type: 'success', message: '签到成功' })
      } else {
        Notify({ type: 'danger', message: result.message || '签到失败' })
      }
    } catch (error) {
      console.error('签到失败:', error)
      Notify({ type: 'danger', message: '签到失败，请重试' })
    } finally {
      this.setData({ isSigningIn: false })
    }
  },

  // 通过坐标获取地址
  getAddressByLocation(lng: number, lat: number): Promise<string> {
    return new Promise((resolve) => {
      wx.request({
        url: `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=12fbc83af77bf4386e8ba0218af2dbb4&extensions=base&output=JSON`,
        success: (res: any) => {
          if (res.data.status === '1') {
            // 高德地图返回的地址信息
            const regeocode = res.data.regeocode
            const address = regeocode.formatted_address || '未知位置'
            resolve(address)
          } else {
            console.error('逆地理编码失败:', res.data.info)
            resolve('未知位置')
          }
        },
        fail: (error) => {
          console.error('请求失败:', error)
          resolve('未知位置')
        }
      })
    })
  },

  // 跳转到历史记录页面
  history() {
    wx.navigateTo({
      url: '/subpages/manage/checkin_history/index'
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})