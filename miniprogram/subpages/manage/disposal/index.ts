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
    refreshing: false
  },

  onLoad() {
    this.loadDisposalList()
  },

  async loadDisposalList(isRefresh = false): Promise<void> {
    // 设置加载状态
    this.setData({ loading: true })
    
    if (isRefresh) {
      this.setData({ disposalList: [] })
    }

    try {
      const result = await listTaskDisposalVoByPage({
        current: 1,
        pageSize: 999,
        sortField: 'createTime',
        sortOrder: 'descend'
      })

      if (result.code === 200 && result.data) {
        const formattedList = (result.data.records || []).map(item => ({
          ...item,
          formattedCreateTime: formatISOTimeDetailed(item.createTime || ''),
          statusText: this.getStatusText(item.disposalStatus || 0)
        }))

        this.setData({
          disposalList: formattedList,
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