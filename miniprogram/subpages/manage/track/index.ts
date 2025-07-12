import { listTaskTrackVoByPage } from '../../../api/taskTrackController'
import { formatISOTimeDetailed } from '../../../utils/date'
import Notify from '@vant/weapp/notify/notify'

interface TaskTrackWithFormattedTime extends API.TaskTrackVO {
  formattedStartTime: string;
  formattedEndTime: string;
  statusText: string;
}

Page({
  data: {
    trackList: [] as TaskTrackWithFormattedTime[],
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.loadTrackHistory()
  },

  async loadTrackHistory(isRefresh = false): Promise<void> {
    // 设置加载状态
    this.setData({ loading: true })
    
    if (isRefresh) {
      this.setData({ trackList: [] })
    }

    try {
      const result = await listTaskTrackVoByPage({
        current: 1,
        pageSize: 999,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const formattedList = (result.data.records || []).map(item => ({
          ...item,
          formattedStartTime: formatISOTimeDetailed(item.trackStartTime || ''),
          formattedEndTime: item.trackEndTime ? formatISOTimeDetailed(item.trackEndTime) : '进行中',
          statusText: item.trackStatus === 1 ? '已完成' : '进行中'
        }))

        this.setData({
          trackList: formattedList,
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '加载失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载轨迹历史失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  onBack() {
    wx.navigateBack()
  },
})