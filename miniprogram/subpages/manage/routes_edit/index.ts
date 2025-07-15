import Notify from '@vant/weapp/notify/notify'
import { addAttractionsRoute, getAttractionsRouteVoById, updateAttractionsRoute, deleteAttractionsRoute } from '../../../api/attractionsRouteController'
import { listAttractionsVoByPage } from '../../../api/attractionsController'
import { uploadFile } from '../../../utils/file'

Page({
  data: {
    id: '',
    route: null as API.AttractionsRouteVO | null,
    loading: true,
    submitting: false,
    startAttractionFileList: [] as any[],
    endAttractionFileList: [] as any[],
    startAttractionVideoList: [] as any[],
    endAttractionVideoList: [] as any[],
    attractionList: [] as API.AttractionsVO[],
    attractionPickerList: [] as string[],
    showStartAttractionSelector: false,
    showEndAttractionSelector: false,
    selectedStartAttraction: null as number | null,
    selectedEndAttraction: null as number | null,
    selectedStartAttractionName: '',
    selectedEndAttractionName: '',
    showDeleteConfirm: false
  },

  onLoad(options: { id?: string }) {
    const id = options.id || ''
    this.setData({ id })
    
    if (id) {
      wx.setNavigationBarTitle({ title: '编辑游览路线' })
      this.loadRouteDetail()
    } else {
      wx.setNavigationBarTitle({ title: '新增游览路线' })
      this.setData({
        route: {
          startAttractionName: '',
          endAttractionName: '',
          routeNote: ''
        },
        selectedStartAttractionName: '',
        selectedEndAttractionName: '',
        loading: false
      })
    }
    
    this.loadAttractionList()
  },

  async loadRouteDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsRouteVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        this.setData({
          route: res.data
        })
        
        if (res.data.startAttractionImg) {
          this.setData({
            startAttractionFileList: [{
              url: res.data.startAttractionImg,
              name: '起点图片',
              isImage: true
            }]
          })
        }
        
        if (res.data.endAttractionImg) {
          this.setData({
            endAttractionFileList: [{
              url: res.data.endAttractionImg,
              name: '终点图片',
              isImage: true
            }]
          })
        }
        
        if (res.data.startAttractionVideo) {
          this.setData({
            startAttractionVideoList: [{
              url: res.data.startAttractionVideo,
              name: '起点视频',
              isVideo: true
            }]
          })
        }
        
        if (res.data.endAttractionVideo) {
          this.setData({
            endAttractionVideoList: [{
              url: res.data.endAttractionVideo,
              name: '终点视频',
              isVideo: true
            }]
          })
        }
        
        // 处理起点景点信息
        if (res.data.startAttractionId) {
          this.setData({
            selectedStartAttraction: res.data.startAttractionId,
            selectedStartAttractionName: res.data.startAttractionName || ''
          })
        } else {
          this.setData({
            selectedStartAttractionName: res.data.startAttractionName || ''
          })
        }
        
        // 处理终点景点信息
        if (res.data.endAttractionId) {
          this.setData({
            selectedEndAttraction: res.data.endAttractionId,
            selectedEndAttractionName: res.data.endAttractionName || ''
          })
        } else {
          this.setData({
            selectedEndAttractionName: res.data.endAttractionName || ''
          })
        }
      } else {
        Notify({ type: 'danger', message: '获取路线详情失败' })
      }
    } catch (error) {
      console.error('获取路线详情失败:', error)
      Notify({ type: 'danger', message: '网络请求失败，请稍后重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadAttractionList() {
    try {
      const res = await listAttractionsVoByPage({
        pageSize: 999,
        current: 1
      })
      
      if (res.code === 200 && res.data && res.data.records) {
        const attractionPickerList = res.data.records.map(item => item.attractionsName)
        
        this.setData({
          attractionList: res.data.records,
          attractionPickerList
        })
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
    }
  },

  afterStartImgRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          startAttractionFileList: [{
            url: res.data,
            name: '起点图片',
            isImage: true
          }]
        })
        Notify({ type: 'success', message: '上传成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '上传失败' })
      }
    }).catch(err => {
      console.error('上传图片失败:', err)
      Notify({ type: 'danger', message: '上传失败' })
    })
  },

  onDeleteStartImg() {
    this.setData({
      startAttractionFileList: []
    })
  },

  afterEndImgRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          endAttractionFileList: [{
            url: res.data,
            name: '终点图片',
            isImage: true
          }]
        })
        Notify({ type: 'success', message: '上传成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '上传失败' })
      }
    }).catch(err => {
      console.error('上传图片失败:', err)
      Notify({ type: 'danger', message: '上传失败' })
    })
  },

  onDeleteEndImg() {
    this.setData({
      endAttractionFileList: []
    })
  },

  afterStartVideoRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          startAttractionVideoList: [{
            url: res.data,
            name: '起点视频',
            isVideo: true
          }]
        })
        Notify({ type: 'success', message: '上传成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '上传失败' })
      }
    }).catch(err => {
      console.error('上传视频失败:', err)
      Notify({ type: 'danger', message: '上传失败' })
    })
  },

  onDeleteStartVideo() {
    this.setData({
      startAttractionVideoList: []
    })
  },

  afterEndVideoRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          endAttractionVideoList: [{
            url: res.data,
            name: '终点视频',
            isVideo: true
          }]
        })
        Notify({ type: 'success', message: '上传成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '上传失败' })
      }
    }).catch(err => {
      console.error('上传视频失败:', err)
      Notify({ type: 'danger', message: '上传失败' })
    })
  },

  onDeleteEndVideo() {
    this.setData({
      endAttractionVideoList: []
    })
  },
  
  async onFormSubmit(event) {
    const formData = event.detail.value
    
    if (!this.data.selectedStartAttraction) {
      Notify({ type: 'warning', message: '请选择起点景点' })
      return
    }
    
    if (!this.data.selectedEndAttraction) {
      Notify({ type: 'warning', message: '请选择终点景点' })
      return
    }
    
    this.setData({ submitting: true })
    
    try {
      const params: any = {
        startAttractionId: this.data.selectedStartAttraction,
        endAttractionId: this.data.selectedEndAttraction,
        startAttractionImg: this.data.startAttractionFileList.length > 0 ? this.data.startAttractionFileList[0].url : undefined,
        endAttractionImg: this.data.endAttractionFileList.length > 0 ? this.data.endAttractionFileList[0].url : undefined,
        startAttractionVideo: this.data.startAttractionVideoList.length > 0 ? this.data.startAttractionVideoList[0].url : undefined,
        endAttractionVideo: this.data.endAttractionVideoList.length > 0 ? this.data.endAttractionVideoList[0].url : undefined,
        routeNote: formData.routeNote
      }
      
      let res
      if (this.data.id) {
        params.id = this.data.id
        res = await updateAttractionsRoute(params)
      } else {
        res = await addAttractionsRoute(params)
      }
      
      if (res.code === 200) {
        Notify({ type: 'success', message: this.data.id ? '保存成功' : '新增成功' })
        
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            prevPage.setData({
              needRefresh: true
            })
          }
          wx.navigateBack()
        }, 1500)
      } else {
        Notify({ type: 'danger', message: res.message || (this.data.id ? '保存失败' : '新增失败') })
      }
    } catch (error) {
      console.error(this.data.id ? '更新路线信息失败:' : '新增路线信息失败:', error)
      Notify({ type: 'danger', message: this.data.id ? '保存失败，请稍后重试' : '新增失败，请稍后重试' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  showStartAttractionPopup() {
    this.setData({
      showStartAttractionSelector: true
    })
  },
  
  onStartAttractionPopupClose() {
    this.setData({
      showStartAttractionSelector: false
    })
  },

  showEndAttractionPopup() {
    this.setData({
      showEndAttractionSelector: true
    })
  },
  
  onEndAttractionPopupClose() {
    this.setData({
      showEndAttractionSelector: false
    })
  },

  selectStartAttraction(event) {
    const { detail } = event
    const selectedAttraction = this.data.attractionList[detail.index]
    
    this.setData({
      selectedStartAttraction: selectedAttraction.id,
      selectedStartAttractionName: selectedAttraction.attractionsName,
      'route.startAttractionName': selectedAttraction.attractionsName,
      showStartAttractionSelector: false
    })
  },

  selectEndAttraction(event) {
    const { detail } = event
    const selectedAttraction = this.data.attractionList[detail.index]
    
    this.setData({
      selectedEndAttraction: selectedAttraction.id,
      selectedEndAttractionName: selectedAttraction.attractionsName,
      'route.endAttractionName': selectedAttraction.attractionsName,
      showEndAttractionSelector: false
    })
  },

  noop() {},
  
  showDeleteConfirm() {
    if (!this.data.id) return
    this.setData({ showDeleteConfirm: true })
  },
  
  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false })
  },
  
  async confirmDelete() {
    if (!this.data.id) return
    
    this.setData({ submitting: true })
    
    try {
      const res = await deleteAttractionsRoute({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        Notify({ type: 'success', message: '删除成功' })
        
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            prevPage.setData({
              needRefresh: true
            })
          }
          wx.navigateBack()
        }, 1500)
      } else {
        Notify({ type: 'danger', message: res.message || '删除失败' })
      }
    } catch (error) {
      console.error('删除路线失败:', error)
      Notify({ type: 'danger', message: '删除失败，请稍后重试' })
    } finally {
      this.setData({ 
        submitting: false,
        showDeleteConfirm: false
      })
    }
  },

  onBack() {
    wx.navigateBack()
  },
})