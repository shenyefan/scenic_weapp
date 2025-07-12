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
    refreshing: false,
    pageInfo: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    }
  },

  onLoad() {
    this.loadTrackHistory(true)
  },

  async loadTrackHistory(refresh = false): Promise<void> {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    if (refresh) {
      this.setData({ trackList: [] })
    }

    try {
      const pageInfo = this.data.pageInfo
      const result = await listTaskTrackVoByPage({
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const { records, total } = result.data
        const formattedList = (records || []).map(item => ({
          ...item,
          formattedStartTime: formatISOTimeDetailed(item.trackStartTime || ''),
          formattedEndTime: item.trackEndTime ? formatISOTimeDetailed(item.trackEndTime) : '进行中',
          statusText: item.trackStatus === 1 ? '已完成' : '进行中'
        }))
        
        const newList = refresh ? formattedList : [...this.data.trackList, ...formattedList]
        const hasMore = records.length > 0 && newList.length < total

        this.setData({
          trackList: newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total,
          'pageInfo.hasMore': hasMore,
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

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading) return
    
    if (this.data.pageInfo.hasMore) {
      this.loadTrackHistory(false)
    }
  },

  onBack() {
    wx.navigateBack()
  },
})