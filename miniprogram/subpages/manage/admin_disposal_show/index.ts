import { getTaskInspectionVoById } from '../../../api/taskInspectionController'
import { getTaskDisposalVoById } from '../../../api/taskDisposalController'
import Notify from '@vant/weapp/notify/notify'
import { formatISOTime } from '../../../utils/date'

Page({
  data: {
    inspectionId: '',
    disposalId: '',
    loading: false,
    inspectionData: null, // 巡查信息
    disposalData: null    // 处置信息
  },

  onLoad(options) {
    // 可以通过巡查任务ID或处置任务ID进入
    if (options.inspectionId) {
      this.setData({
        inspectionId: options.inspectionId
      })
      this.loadInspectionDetail(options.inspectionId)
      
      // 如果有处置ID，也加载处置信息
      if (options.disposalId) {
        this.setData({
          disposalId: options.disposalId
        })
        this.loadDisposalDetail(options.disposalId)
      }
    } else if (options.disposalId) {
      // 只有处置ID的情况，先加载处置信息，再通过处置信息获取巡查信息
      this.setData({
        disposalId: options.disposalId
      })
      this.loadDisposalDetailAndInspection(options.disposalId)
    } else {
      wx.navigateBack()
      Notify({ type: 'warning', message: '参数错误' })
    }
  },

  // 加载巡查详情
  async loadInspectionDetail(id: string) {
    this.setData({ loading: true })

    try {
      const result = await getTaskInspectionVoById({ id: id })

      if (result.code === 200 && result.data) {
        const data = result.data
        
        // 处理状态文本
        const statusMap = {
          0: '待开始',
          1: '进行中', 
          2: '已完成'
        }
        const statusText = statusMap[data.taskStatus] || '未知状态'
        
        this.setData({
          inspectionData: {
            ...data,
            statusText: statusText
          },
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '加载巡查信息失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载巡查任务详情失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 加载处置详情
  async loadDisposalDetail(id: string) {
    try {
      const result = await getTaskDisposalVoById({ id: id })
      
      if (result.code === 200 && result.data) {
        // 预处理状态文本和类型，以及格式化时间
        const disposalData = {
          ...result.data,
          statusText: this.getDisposalStatusText(result.data.disposalStatus || 0),
          statusType: this.getDisposalStatusType(result.data.disposalStatus || 0),
          formattedCreateTime: result.data.createTime ? formatISOTime(result.data.createTime) : '未知时间'
        }
        
        this.setData({
          disposalData: disposalData
        })
      } else {
        console.error('加载处置信息失败:', result.message)
      }
    } catch (error) {
      console.error('加载处置信息失败:', error)
    }
  },

  // 通过处置ID加载处置信息和巡查信息
  async loadDisposalDetailAndInspection(disposalId: string) {
    this.setData({ loading: true })
  
    try {
      const result = await getTaskDisposalVoById({ id: disposalId })
      
      if (result.code === 200 && result.data) {
        // 预处理状态文本和类型，以及格式化时间
        const disposalData = {
          ...result.data,
          statusText: this.getDisposalStatusText(result.data.disposalStatus || 0),
          statusType: this.getDisposalStatusType(result.data.disposalStatus || 0),
          formattedCreateTime: result.data.createTime ? formatISOTime(result.data.createTime) : '未知时间'
        }
        
        this.setData({
          disposalData: disposalData
        })
        
        // 如果有关联的巡查任务ID，加载巡查信息
        if (result.data.inspectionTaskId) {
          this.setData({
            inspectionId: result.data.inspectionTaskId
          })
          await this.loadInspectionDetail(result.data.inspectionTaskId)
        } else {
          this.setData({ loading: false })
        }
      } else {
        Notify({ type: 'danger', message: result.message || '加载处置信息失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载处置信息失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 获取处置状态文本
  getDisposalStatusText(status: number) {
    const statusMap = {
      0: '待处理',
      1: '处理中',
      2: '已完成'
    }
    return statusMap[status] || '未知状态'
  },

  // 获取处置状态标签类型
  getDisposalStatusType(status: number) {
    const typeMap = {
      0: 'warning',  // 待处理 - 橙色
      1: 'primary',  // 处理中 - 蓝色
      2: 'success'   // 已完成 - 绿色
    }
    return typeMap[status] || 'default'
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  }
})