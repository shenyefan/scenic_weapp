import { getTaskInspectionVoById, updateTaskInspection } from '../../../api/taskInspectionController'
import { uploadFile } from '../../../utils/file'

Page({
  data: {
    id: '',
    loading: false,
    submitting: false,
    formData: {
      inspectionImages: '',
      inspectionDescription: '',
      isAbnormal: 0
    },
    inspectionData: null as any,
    fileList: [] as any[],
    abnormalOptions: ['未知', '正常', '异常'],
    showAbnormalPickerPopup: false,
    abnormalText: '未知'
  },

  onLoad(options: any) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.loadInspectionDetail(options.id)
    } else {
      wx.navigateBack()
      wx.showToast({ title: '参数错误', icon: 'none' })
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
        const statusMap: Record<number, string> = {
          0: '待开始',
          1: '进行中', 
          2: '已完成'
        }
        const statusText = statusMap[data.taskStatus || 0] || '未知状态'
        
        const abnormalValue = Number(data.isAbnormal) || 0
        const abnormalText = this.data.abnormalOptions[abnormalValue] || '未知'
        
        this.setData({
          formData: {
            inspectionImages: data.inspectionImages || '',
            inspectionDescription: data.inspectionDescription || '',
            isAbnormal: abnormalValue
          },
          inspectionData: {
            ...data,
            statusText: statusText
          },
          fileList,
          abnormalText,
          loading: false
        })
      } else {
        wx.showToast({ title: result.message || '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载巡查任务详情失败:', error)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  afterRead(e: any) {
    const { file } = e.detail
    
    // 显示上传中的提示
    wx.showLoading({ title: '上传中...' })
    
    uploadFile({
      filePath: file.url,
      biz: 'task_img'
    })
      .then((res) => {
        wx.hideLoading()
        if (res.code === 200 && res.data) {
          this.setData({ 
            fileList: [{
              url: res.data,
              name: '巡查图片',
              isImage: true
            }],
            'formData.inspectionImages': res.data
          })
          
          wx.showToast({ title: '上传成功', icon: 'success' })
        } else {
          wx.showToast({ title: res.message || '上传失败', icon: 'none' })
        }
      })
      .catch((error) => {
        wx.hideLoading()
        console.error('上传图片失败:', error)
        wx.showToast({ title: '上传失败，请重试', icon: 'none' })
      })
  },

  deleteImage() {
    this.setData({
      fileList: [],
      'formData.inspectionImages': ''
    })
  },

  // 显示异常状态选择器
  showAbnormalPicker() {
    this.setData({
      showAbnormalPickerPopup: true
    })
  },

  // 隐藏异常状态选择器
  hideAbnormalPicker() {
    this.setData({
      showAbnormalPickerPopup: false
    })
  },

  // 确认选择异常状态
  onAbnormalConfirm(event: any) {
    const { value, index } = event.detail
    
    this.setData({
      'formData.isAbnormal': index,
      abnormalText: value,
      showAbnormalPickerPopup: false
    })
  },

  // 取消选择异常状态
  onAbnormalCancel() {
    this.setData({
      showAbnormalPickerPopup: false
    })
  },

  // 表单提交方法
  async onFormSubmit(event: any) {
    const formData = event.detail.value
    
    // 表单验证
    if (!formData.inspectionDescription) {
      return wx.showToast({ title: '请填写巡查描述', icon: 'none' })
    }

    this.setData({ submitting: true })

    try {
      const result = await updateTaskInspection({
        id: this.data.id,
        inspectionImages: this.data.formData.inspectionImages,
        inspectionDescription: formData.inspectionDescription,
        isAbnormal: this.data.formData.isAbnormal
      })

      if (result.code === 200) {
        wx.showToast({ title: '更新成功', icon: 'success' })
        
        // 返回上一页并刷新列表
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2] as any
          
          if (prevPage && prevPage.loadInspectionList) {
            prevPage.loadInspectionList(true)
          }
          
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: result.message || '操作失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交表单失败:', error)
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onBack() {
    wx.navigateBack()
  }
})