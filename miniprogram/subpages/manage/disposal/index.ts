import { listTaskDisposalVoByPage } from '../../../api/taskDisposalController'
import { formatISOTimeDetailed } from '../../../utils/date'
import Notify from '@vant/weapp/notify/notify'

interface TaskDisposalWithFormattedTime extends API.TaskDisposalVO {
  formattedCreateTime: string;
  statusText: string;
}

Page({
  data: {
    disposalList: [] as TaskDisposalWithFormattedTime[],
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
    this.loadDisposalList(true)
  },

  async loadDisposalList(refresh = false): Promise<void> {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    if (refresh) {
      this.setData({ disposalList: [] })
    }

    try {
      const pageInfo = this.data.pageInfo
      const result = await listTaskDisposalVoByPage({
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const { records, total } = result.data
        const formattedList = (records || []).map(item => ({
          ...item,
          formattedCreateTime: formatISOTimeDetailed(item.createTime || ''),
          statusText: this.getStatusText(item.disposalStatus || 0)
        }))
        
        const newList = refresh ? formattedList : [...this.data.disposalList, ...formattedList]
        const hasMore = records.length > 0 && newList.length < total

        this.setData({
          disposalList: newList,
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
      console.error('加载问题处置记录失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: '待处理',
      1: '处理中',
      2: '已完成'
    }
    return statusMap[status] || '未知状态'
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading) return
    
    if (this.data.pageInfo.hasMore) {
      this.loadDisposalList(false)
    }
  },

  navigateToEdit(e: any) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const item = this.data.disposalList[index]
    
    wx.navigateTo({
      url: `/subpages/manage/disposal_edit/index?id=${id}&inspectionTaskId=${item.inspectionTaskId}`
    })
  },

  onBack() {
    wx.navigateBack()
  },
})