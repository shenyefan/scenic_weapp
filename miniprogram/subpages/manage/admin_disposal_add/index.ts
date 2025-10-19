import { addTaskDisposal } from '../../../api/taskDisposalController'
import { listTaskInspectionVoByPage } from '../../../api/taskInspectionController'
import { listUserByPage } from '../../../api/userController'
import Notify from '@vant/weapp/notify/notify'
import { formatISODate } from '../../../utils/date'

Page({
  data: {
    loading: false,
    submitting: false,
    formData: {
      inspectionTaskId: '',
      disposerId: '',
      disposalStatus: 0
    },
    
    // 选择器相关
    showInspectionPopup: false,
    showDisposerPopup: false,
    showStatusPopup: false,
    
    // 选项数据
    inspectionOptions: [],
    disposerOptions: [],
    statusOptions: [
      { text: '待处置', value: 0 },
      { text: '处置中', value: 1 },
      { text: '已完成', value: 2 }
    ],
    
    // 选中的值和文本
    selectedInspectionText: '',
    selectedDisposerText: '',
    selectedStatusText: '待处置'
  },

  onLoad() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })

    try {
      // 并行加载异常巡查任务和处置员列表
      await Promise.all([
        this.loadInspectionTasks(),
        this.loadDisposers()
      ])
      
      this.setData({ loading: false })
    } catch (error) {
      console.error('加载数据失败:', error)
      Notify({ type: 'danger', message: '加载数据失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 加载异常巡查任务列表
  async loadInspectionTasks() {
    try {
      const result = await listTaskInspectionVoByPage({
        current: 1,
        pageSize: 999,
        isAbnormal: 2, // 只获取异常的巡查任务
        taskStatus: 1  // 只获取执行中的巡查任务
      })

      if (result.code === 200 && result.data && Array.isArray(result.data.records)) {
        const options = result.data.records.map((item: any) => ({
          text: `${item.attractionsName} - ${formatISODate(item.taskDate)}`,
          value: item.id
        }))
        
        this.setData({ inspectionOptions: options })
      }
    } catch (error) {
      console.error('加载巡查任务失败:', error)
      throw error
    }
  },

  // 加载处置员列表
  async loadDisposers() {
    try {
      const result = await listUserByPage({
        current: 1,
        pageSize: 999,
        userRole: 'disposer' // 只获取处置员
      })

      if (result.code === 200 && result.data && Array.isArray(result.data.records)) {
        const options = result.data.records.map((user: any) => ({
          text: user.userName,
          value: user.id
        }))
        
        this.setData({ disposerOptions: options })
      }
    } catch (error) {
      console.error('加载处置员列表失败:', error)
      throw error
    }
  },

  // 显示巡查任务选择器
  showInspectionPicker() {
    this.setData({ showInspectionPopup: true })
  },

  // 隐藏巡查任务选择器
  hideInspectionPicker() {
    this.setData({ showInspectionPopup: false })
  },

  // 确认选择巡查任务
  onInspectionConfirm(e: any) {
    const { value, index } = e.detail
    const selectedOption = this.data.inspectionOptions[index]
    
    this.setData({
      'formData.inspectionTaskId': selectedOption.value,
      selectedInspectionText: selectedOption.text,
      showInspectionPopup: false
    })
  },

  // 显示处置员选择器
  showDisposerPicker() {
    this.setData({ showDisposerPopup: true })
  },

  // 隐藏处置员选择器
  hideDisposerPicker() {
    this.setData({ showDisposerPopup: false })
  },

  // 确认选择处置员
  onDisposerConfirm(e: any) {
    const { value, index } = e.detail
    const selectedOption = this.data.disposerOptions[index]
    
    this.setData({
      'formData.disposerId': selectedOption.value,
      selectedDisposerText: selectedOption.text,
      showDisposerPopup: false
    })
  },

  // 显示状态选择器
  showStatusPicker() {
    this.setData({ showStatusPopup: true })
  },

  // 隐藏状态选择器
  hideStatusPicker() {
    this.setData({ showStatusPopup: false })
  },

  // 确认选择状态
  onStatusConfirm(e: any) {
    const { value, index } = e.detail
    const selectedOption = this.data.statusOptions[index]
    
    this.setData({
      'formData.disposalStatus': selectedOption.value,
      selectedStatusText: selectedOption.text,
      showStatusPopup: false
    })
  },

  // 表单提交
  async onFormSubmit(event: any) {
    // 表单验证
    if (!this.data.formData.inspectionTaskId) {
      return Notify({ type: 'warning', message: '请选择关联的巡查任务' })
    }
    
    if (!this.data.formData.disposerId) {
      return Notify({ type: 'warning', message: '请选择处置员' })
    }

    this.setData({ submitting: true })

    try {
      const result = await addTaskDisposal({
        inspectionTaskId: this.data.formData.inspectionTaskId,
        disposerId: this.data.formData.disposerId,
        disposalStatus: this.data.formData.disposalStatus
      })

      if (result.code === 200) {
        Notify({ type: 'success', message: '分配成功' })
        
        // 返回上一页并刷新列表
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          
          if (prevPage && prevPage.loadDisposalList) {
            prevPage.loadDisposalList(true)
          }
          
          wx.navigateBack()
        }, 1000)
      } else {
        Notify({ type: 'danger', message: result.message || '分配失败' })
      }
    } catch (error) {
      console.error('提交表单失败:', error)
      Notify({ type: 'danger', message: '分配失败，请重试' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onBack() {
    wx.navigateBack()
  }
})