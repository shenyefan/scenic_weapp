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
    showStartAttractionSelector: false,
    showEndAttractionSelector: false,
    selectedStartAttraction: null as number | null,
    selectedEndAttraction: null as number | null,
    selectedStartAttractionName: '',
    selectedEndAttractionName: ''
  },

  onLoad(options: { id?: string }) {
    const id = options.id || ''
    this.setData({ id })
    
    // 根据是否有ID判断是新增还是编辑
    if (id) {
      // 编辑模式
      wx.setNavigationBarTitle({ title: '编辑游览路线' })
      this.loadRouteDetail()
    } else {
      // 新增模式
      wx.setNavigationBarTitle({ title: '新增游览路线' })
      // 初始化一个空的路线对象
      this.setData({
        route: {
          startAttractionName: '',
          endAttractionName: '',
          routeNote: ''
        },
        loading: false
      })
    }
    
    // 无论新增还是编辑都需要加载景点列表
    this.loadAttractionList()
  },

  // 加载路线详情
  async loadRouteDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsRouteVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        // 设置路线信息
        this.setData({
          route: res.data
        })
        
        // 设置起点图片列表
        if (res.data.startAttractionImg) {
          this.setData({
            startAttractionFileList: [{
              url: res.data.startAttractionImg,
              name: '起点图片',
              isImage: true
            }]
          })
        }
        
        // 设置终点图片列表
        if (res.data.endAttractionImg) {
          this.setData({
            endAttractionFileList: [{
              url: res.data.endAttractionImg,
              name: '终点图片',
              isImage: true
            }]
          })
        }
        
        // 设置起点视频列表
        if (res.data.startAttractionVideo) {
          this.setData({
            startAttractionVideoList: [{
              url: res.data.startAttractionVideo,
              name: '起点视频',
              isVideo: true
            }]
          })
        }
        
        // 设置终点视频列表
        if (res.data.endAttractionVideo) {
          this.setData({
            endAttractionVideoList: [{
              url: res.data.endAttractionVideo,
              name: '终点视频',
              isVideo: true
            }]
          })
        }
        
        // 设置已选起点和终点
        if (res.data.startAttractionId) {
          this.setData({
            selectedStartAttraction: res.data.startAttractionId,
            selectedStartAttractionName: res.data.startAttractionName || ''
          })
        }
        
        if (res.data.endAttractionId) {
          this.setData({
            selectedEndAttraction: res.data.endAttractionId,
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

  // 加载景点列表
  async loadAttractionList() {
    try {
      const res = await listAttractionsVoByPage({
        pageSize: 999,
        current: 1
      })
      
      if (res.code === 200 && res.data && res.data.records) {
        this.setData({
          attractionList: res.data.records
        })
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
    }
  },

  // 上传起点图片后的回调
  afterStartImgRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传图片
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
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

  // 删除起点图片
  onDeleteStartImg() {
    this.setData({
      startAttractionFileList: []
    })
  },

  // 上传终点图片后的回调
  afterEndImgRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传图片
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
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

  // 删除终点图片
  onDeleteEndImg() {
    this.setData({
      endAttractionFileList: []
    })
  },

  // 上传起点视频后的回调
  afterStartVideoRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传视频
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
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

  // 删除起点视频
  onDeleteStartVideo() {
    this.setData({
      startAttractionVideoList: []
    })
  },

  // 上传终点视频后的回调
  afterEndVideoRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传视频
    uploadFile({
      filePath: file.url,
      biz: 'attractions_route_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
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

  // 删除终点视频
  onDeleteEndVideo() {
    this.setData({
      endAttractionVideoList: []
    })
  },
  
  // 表单提交
  async onFormSubmit(event) {
    const formData = event.detail.value
    
    // 表单验证
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
      // 构建请求参数
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
        // 编辑模式 - 更新
        params.id = this.data.id
        res = await updateAttractionsRoute(params)
      } else {
        // 新增模式 - 添加
        res = await addAttractionsRoute(params)
      }
      
      if (res.code === 200) {
        Notify({ type: 'success', message: this.data.id ? '保存成功' : '新增成功' })
        
        // 延迟返回上一页，并设置需要刷新标记
        setTimeout(() => {
          // 设置上一页需要刷新
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            // 设置上一个页面的刷新标记
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

  // 显示起点景点选择弹窗
  showStartAttractionPopup() {
    this.setData({
      showStartAttractionSelector: true
    })
  },
  
  // 关闭起点景点选择弹窗
  onStartAttractionPopupClose() {
    this.setData({
      showStartAttractionSelector: false
    })
  },

  // 显示终点景点选择弹窗
  showEndAttractionPopup() {
    this.setData({
      showEndAttractionSelector: true
    })
  },
  
  // 关闭终点景点选择弹窗
  onEndAttractionPopupClose() {
    this.setData({
      showEndAttractionSelector: false
    })
  },

  // 选择起点景点
  selectStartAttraction(event) {
    const { id, name } = event.currentTarget.dataset
    
    this.setData({
      selectedStartAttraction: id,
      selectedStartAttractionName: name,
      'route.startAttractionName': name,
      showStartAttractionSelector: false
    })
  },

  // 选择终点景点
  selectEndAttraction(event) {
    const { id, name } = event.currentTarget.dataset
    
    this.setData({
      selectedEndAttraction: id,
      selectedEndAttractionName: name,
      'route.endAttractionName': name,
      showEndAttractionSelector: false
    })
  },

  // 阻止冒泡
  noop() {},
  
  // 显示删除确认弹窗
  showDeleteConfirm() {
    if (!this.data.id) return
    this.setData({ showDeleteConfirm: true })
  },
  
  // 关闭删除确认弹窗
  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false })
  },
  
  // 确认删除路线
  async confirmDelete() {
    if (!this.data.id) return
    
    this.setData({ submitting: true })
    
    try {
      const res = await deleteAttractionsRoute({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        Notify({ type: 'success', message: '删除成功' })
        
        // 延迟返回上一页，并设置需要刷新标记
        setTimeout(() => {
          // 设置上一页需要刷新
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            // 设置上一个页面的刷新标记
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

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },
})