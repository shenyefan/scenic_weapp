import { getTaskInspectionVoById, updateTaskInspection } from '../../../api/taskInspectionController'
import { uploadFile } from '../../../utils/file'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    id: '',
    loading: false,
    submitting: false,
    formData: {
      inspectionImages: '',
      inspectionDescription: '',
      isAbnormal: 0,
      taskStatus: 0
    },
    inspectionData: null, // 巡查任务信息
    statusOptions: [
      { text: '待开始', value: 0 },
      { text: '进行中', value: 1 },
      { text: '已完成', value: 2 }
    ],
    fileList: [],
    showStatusSelector: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.loadInspectionDetail(options.id)
    } else {
      wx.navigateBack()
      Notify({ type: 'warning', message: '参数错误' })
    }
  },

  async loadInspectionDetail(id: string) {
    this.setData({ loading: true })

    try {
      const result = await getTaskInspectionVoById({ id: id })

      if (result.code === 200 && result.data) {
        const data = result.data
        
        const fileList = data.inspectionImages ? [{
          url: data.inspectionImages,
          name: '巡查图片',
          isImage: true
        }] : []

        // 处理状态文本
        const statusMap = {
          0: '待开始',
          1: '进行中', 
          2: '已完成'
        }
        const statusText = statusMap[data.taskStatus] || '未知状态'

        this.setData({
          formData: {
            inspectionImages: data.inspectionImages,
            inspectionDescription: data.inspectionDescription,
            isAbnormal: data.isAbnormal,
            taskStatus: data.taskStatus
          },
          inspectionData: {
            ...data,
            statusText: statusText
          },
          fileList,
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '加载失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载巡查任务详情失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  // 状态选择相关方法
  showStatusPicker() {
    this.setData({
      showStatusSelector: true
    })
  },

  closeStatusPicker() {
    this.setData({
      showStatusSelector: false
    })
  },

  selectStatus(event) {
    const { value, text } = event.currentTarget.dataset
    this.setData({
      'formData.taskStatus': value,
      showStatusSelector: false
    })
  },

  // 异常状态切换
  onAbnormalChange(event) {
    this.setData({
      'formData.isAbnormal': event.detail ? 1 : 0
    })
  },

  afterRead(e: any) {
    const { file } = e.detail
    
    // 显示上传中的提示
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'task_img'
    })
      .then((res) => {
        if (res.code === 200 && res.data) {
          this.setData({ 
            fileList: [{
              url: res.data,
              name: '巡查图片',
              isImage: true
            }],
            'formData.inspectionImages': res.data
          })
          
          Notify({ type: 'success', message: '上传成功' })
        } else {
          Notify({ type: 'danger', message: res.message || '上传失败' })
        }
      })
      .catch((error) => {
        console.error('上传图片失败:', error)
        Notify({ type: 'danger', message: '上传失败，请重试' })
      })
  },

  deleteImage() {
    this.setData({
      fileList: [],
      'formData.inspectionImages': ''
    })
  },

  // 表单提交方法
  async onFormSubmit(event) {
    const formData = event.detail.value
    
    // 表单验证
    if (!formData.inspectionDescription) {
      return Notify({ type: 'warning', message: '请填写巡查描述' })
    }

    this.setData({ submitting: true })

    try {
      const result = await updateTaskInspection({
        id: this.data.id,
        inspectionImages: this.data.fileList.length > 0 ? this.data.fileList[0].url : '',
        inspectionDescription: formData.inspectionDescription,
        isAbnormal: this.data.formData.isAbnormal,
        taskStatus: this.data.formData.taskStatus
      })

      if (result.code === 200) {
        Notify({ type: 'success', message: '更新成功' })
        
        // 返回上一页并刷新列表
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          
          if (prevPage && prevPage.loadInspectionList) {
            prevPage.loadInspectionList(true)
          }
          
          wx.navigateBack()
        }, 1000)
      } else {
        Notify({ type: 'danger', message: result.message || '操作失败' })
      }
    } catch (error) {
      console.error('提交表单失败:', error)
      Notify({ type: 'danger', message: '操作失败，请重试' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onBack() {
    wx.navigateBack()
  }
})