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
    refreshing: false,
    pageInfo: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    }
  },

  onLoad() {
    this.loadCheckinHistory(true)
  },

  async loadCheckinHistory(refresh = false): Promise<void> {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    if (refresh) {
      this.setData({ checkinList: [] })
    }

    try {
      const pageInfo = this.data.pageInfo
      const result = await listMyTaskCheckinVoByPage({
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const { records, total } = result.data
        const formattedList = (records || []).map(item => ({
          ...item,
          formattedTime: formatISOTimeDetailed(item.createTime || '')
        }))
        
        const newList = refresh ? formattedList : [...this.data.checkinList, ...formattedList]
        const hasMore = records.length > 0 && newList.length < total

        this.setData({
          checkinList: newList,
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
      console.error('加载签到历史失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading) return
    
    if (this.data.pageInfo.hasMore) {
      this.loadCheckinHistory(false)
    }
  },

  onBack() {
    wx.navigateBack()
  },
})