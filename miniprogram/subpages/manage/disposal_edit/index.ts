import { getTaskDisposalVoById, updateTaskDisposal } from '../../../api/taskDisposalController'
import { getTaskInspectionVoById } from '../../../api/taskInspectionController'
import { uploadFile } from '../../../utils/file'
import Notify from '@vant/weapp/notify/notify'

Page({
  data: {
    id: '',
    loading: false,
    submitting: false,
    formData: {
      inspectionTaskId: '',
      disposerId: '',
      disposalImages: '',
      disposalDescription: '',
      disposalStatus: 0
    },
    inspectionData: null,
    statusOptions: ['待处理', '处理中', '已完成'],
    statusValues: [0, 1, 2],
    fileList: [],
    showStatusSelector: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.loadDisposalDetail(options.id)
      
      if (options.inspectionTaskId) {
        this.loadInspectionDetail(options.inspectionTaskId)
      }
    } else {
      wx.navigateBack()
      Notify({ type: 'warning', message: '参数错误' })
    }
  },

  async loadDisposalDetail(id: string) {
    this.setData({ loading: true })

    try {
      const result = await getTaskDisposalVoById({ id: id })

      if (result.code === 200 && result.data) {
        const data = result.data
        
        const fileList = data.disposalImages ? [{
          url: data.disposalImages,
          name: '处置图片',
          isImage: true
        }] : []

        this.setData({
          formData: {
            inspectionTaskId: data.inspectionTaskId,
            disposerId: data.disposerId,
            disposalImages: data.disposalImages,
            disposalDescription: data.disposalDescription,
            disposalStatus: data.disposalStatus
          },
          fileList,
          loading: false
        })
      } else {
        Notify({ type: 'danger', message: result.message || '加载失败' })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载问题处置详情失败:', error)
      Notify({ type: 'danger', message: '加载失败，请重试' })
      this.setData({ loading: false })
    }
  },

  async loadInspectionDetail(inspectionTaskId: string) {
    try {
      const result = await getTaskInspectionVoById({ id: inspectionTaskId })
      
      if (result.code === 200 && result.data) {
        const statusMap = {
          0: '待开始',
          1: '进行中', 
          2: '已完成'
        }
        const statusText = statusMap[result.data.taskStatus] || '未知状态'
        
        this.setData({
          inspectionData: {
            ...result.data,
            statusText: statusText
          }
        })
      }
    } catch (error) {
      console.error('加载巡查信息失败:', error)
    }
  },

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
    const { detail } = event
    const selectedValue = this.data.statusValues[detail.index]
    
    this.setData({
      'formData.disposalStatus': selectedValue,
      showStatusSelector: false
    })
  },

  afterRead(e: any) {
    const { file } = e.detail
    
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
              name: '处置图片',
              isImage: true
            }],
            'formData.disposalImages': res.data
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
      'formData.disposalImages': ''
    })
  },

  async onFormSubmit(event) {
    const formData = event.detail.value
    
    if (!formData.disposalDescription) {
      return Notify({ type: 'warning', message: '请填写处置描述' })
    }

    this.setData({ submitting: true })

    try {
      const result = await updateTaskDisposal({
        id: this.data.id,
        disposalImages: this.data.fileList.length > 0 ? this.data.fileList[0].url : '',
        disposalDescription: formData.disposalDescription,
        disposalStatus: this.data.formData.disposalStatus
      })

      if (result.code === 200) {
        Notify({ type: 'success', message: '更新成功' })
        
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          
          if (prevPage && prevPage.loadDisposalList) {
            prevPage.loadDisposalList(true)
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
  },
})