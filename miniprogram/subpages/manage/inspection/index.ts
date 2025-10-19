import { listMyTaskInspectionVoByPage } from '../../../api/taskInspectionController'
import { formatISOTimeDetailed, formatISODate } from '../../../utils/date'

interface TaskInspectionWithFormattedTime extends API.TaskInspectionVO {
  formattedTaskDate: string;
  statusText: string;
  abnormalText: string;
}

Page({
  data: {
    inspectionList: [] as TaskInspectionWithFormattedTime[],
    loading: false,
    refreshing: false,
    pageInfo: {
      current: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    },
    // 日期选择器相关
    showDatePickerPopup: false,
    selectedDate: '',
    selectedDateText: '全部日期',
    currentDate: new Date().getTime(),
    minDate: new Date(2025, 0, 1).getTime(),
    maxDate: new Date().getTime(),
    // 异常状态筛选相关
    showAbnormalPickerPopup: false,
    selectedAbnormal: -1,
    selectedAbnormalText: '全部状态',
    abnormalOptions: ['全部状态', '未知', '正常', '异常'],
    // 任务状态筛选相关
    showStatusPickerPopup: false,
    selectedStatus: -1,
    selectedStatusText: '全部状态',
    statusOptions: ['全部状态', '待开始', '进行中', '已完成']
  },

  onLoad() {
    this.loadInspectionList(true)
  },

  async loadInspectionList(refresh = false): Promise<void> {
    if (this.data.loading) return
    
    // 如果没有更多数据且不是刷新操作，则直接返回
    if (!refresh && !this.data.pageInfo.hasMore) return
    
    this.setData({ loading: true })
    
    if (refresh) {
      this.setData({ inspectionList: [] })
    }

    try {
      const pageInfo = this.data.pageInfo
      const requestData: any = {
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
      
      // 添加日期筛选参数
      if (this.data.selectedDate) {
        requestData.taskDate = this.data.selectedDate
      }
      
      // 添加异常状态筛选参数
      if (this.data.selectedAbnormal !== -1) {
        requestData.isAbnormal = this.data.selectedAbnormal
      }
      
      // 添加任务状态筛选参数
      if (this.data.selectedStatus !== -1) {
        requestData.taskStatus = this.data.selectedStatus
      }
      
      const result = await listMyTaskInspectionVoByPage(requestData)

      if (result.code === 200 && result.data) {
        const { records = [], total = 0 } = result.data
        const formattedList = records.map(item => ({
          ...item,
          formattedTaskDate: item.taskDate ? formatISODate(item.taskDate) : '未设置',
          statusText: this.getStatusText(item.taskStatus || 0),
          abnormalText: this.getAbnormalText(item.isAbnormal || 0)
        }))
        
        const newList = refresh ? formattedList : [...this.data.inspectionList, ...formattedList]
        const hasMore = records.length > 0 && newList.length < total

        this.setData({
          inspectionList: newList,
          'pageInfo.current': refresh ? 2 : pageInfo.current + 1,
          'pageInfo.total': total,
          'pageInfo.hasMore': hasMore,
          loading: false
        })
      } else {
        wx.showToast({ title: result.message || '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载巡查任务失败:', error)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 显示日期选择器
  showDatePicker() {
    this.setData({ showDatePickerPopup: true })
  },

  // 隐藏日期选择器
  hideDatePicker() {
    this.setData({ showDatePickerPopup: false })
  },

  // 确认选择日期
  onDateConfirm(event: any) {
    const selectedTimestamp = event.detail
    const selectedDate = new Date(selectedTimestamp)
    // 使用本地时间格式化，避免时区问题
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    const displayText = `${year}年${month}月${day}日`
    
    this.setData({
      selectedDate: dateString,
      selectedDateText: displayText,
      showDatePickerPopup: false
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  // 清除日期筛选
  clearDateFilter(event: any) {
    event.stopPropagation() // 阻止事件冒泡
    this.setData({
      selectedDate: '',
      selectedDateText: '全部日期'
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  // 显示异常状态选择器
  showAbnormalPicker() {
    this.setData({ showAbnormalPickerPopup: true })
  },

  // 隐藏异常状态选择器
  hideAbnormalPicker() {
    this.setData({ showAbnormalPickerPopup: false })
  },

  // 确认选择异常状态
  onAbnormalConfirm(event: any) {
    const { value, index } = event.detail
    
    // 根据索引映射到数字值：0=全部状态(-1), 1=未知(0), 2=正常(1), 3=异常(2)
    let abnormalValue = -1
    if (index === 1) abnormalValue = 0  // 未知
    else if (index === 2) abnormalValue = 1  // 正常
    else if (index === 3) abnormalValue = 2  // 异常
    
    this.setData({
      selectedAbnormal: abnormalValue,
      selectedAbnormalText: value,
      showAbnormalPickerPopup: false
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  // 清除异常状态筛选
  clearAbnormalFilter(event: any) {
    event.stopPropagation() // 阻止事件冒泡
    this.setData({
      selectedAbnormal: '',
      selectedAbnormalText: '全部状态'
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  // 显示任务状态选择器
  showStatusPicker() {
    this.setData({ showStatusPickerPopup: true })
  },

  // 隐藏任务状态选择器
  hideStatusPicker() {
    this.setData({ showStatusPickerPopup: false })
  },

  // 确认选择任务状态
  onStatusConfirm(event: any) {
    const { value, index } = event.detail
    
    // 根据索引映射到数字值：0=全部状态(-1), 1=待开始(0), 2=进行中(1), 3=已完成(2)
    let statusValue = -1
    if (index === 1) statusValue = 0  // 待开始
    else if (index === 2) statusValue = 1  // 进行中
    else if (index === 3) statusValue = 2  // 已完成
    
    this.setData({
      selectedStatus: statusValue,
      selectedStatusText: value,
      showStatusPickerPopup: false
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  // 清除任务状态筛选
  clearStatusFilter(event: any) {
    event.stopPropagation() // 阻止事件冒泡
    this.setData({
      selectedStatus: '',
      selectedStatusText: '全部状态'
    })
    
    // 重新加载数据
    this.loadInspectionList(true)
  },

  getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: '待开始',
      1: '进行中',
      2: '已完成'
    }
    return statusMap[status] || '未知状态'
  },

  getAbnormalText(abnormal: number): string {
    const abnormalMap: Record<number, string> = {
      0: '未知',
      1: '正常',
      2: '异常'
    }
    return abnormalMap[abnormal] || '未知'
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading) return
    
    if (this.data.pageInfo.hasMore) {
      this.loadInspectionList(false)
    }
  },

  navigateToEdit(e: any) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const item = this.data.inspectionList[index]
    
    wx.navigateTo({
      url: `/subpages/manage/inspection_edit/index?id=${id}`
    })
  },

  onBack() {
    wx.navigateBack()
  },
})