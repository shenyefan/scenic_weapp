import { listMyTaskCheckinVoByPage } from '../../../api/taskCheckinController'
import { formatISOTimeDetailed } from '../../../utils/date'
import Notify from '@vant/weapp/notify/notify'

interface TaskCheckinWithFormattedTime extends API.TaskCheckinVO {
  formattedTime: string
}

Page({
  data: {
    checkinList: [] as TaskCheckinWithFormattedTime[],
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.loadCheckinHistory()
  },

  async loadCheckinHistory(isRefresh = false): Promise<void> {
    // 设置加载状态
    this.setData({ loading: true })
    
    if (isRefresh) {
      this.setData({ checkinList: [] })
    }

    try {
      const result = await listMyTaskCheckinVoByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const formattedList = (result.data.records || []).map(item => ({
          ...item,
          formattedTime: formatISOTimeDetailed(item.createTime || '')
        }))

        this.setData({
          checkinList: formattedList,
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '加载失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载签到历史失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  onBack() {
    wx.navigateBack()
  },
})