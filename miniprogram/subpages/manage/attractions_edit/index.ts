
import Notify from '@vant/weapp/notify/notify'
import { addAttractions, getAttractionsVoById, updateAttractions, deleteAttractions } from '../../../api/attractionsController'
import { getAllTypes } from '../../../api/attractionsTypeController'
import { listUserVoByPage } from '../../../api/userController'
import { uploadFile } from '../../../utils/file'

Page({
  data: {
    id: '',
    attraction: null as API.AttractionsVO | null,
    loading: true,
    submitting: false,
    fileList: [] as any[],
    videoList: [] as any[],
    typeList: [] as API.AttractionsTypeVO[],
    inspectorList: [] as API.UserVO[],
    selectedTypes: [] as number[],
    selectedTypesText: '',
    tempSelectedTypes: [] as number[],
    showTypeSelector: false,
    showInspectorSelector: false,
    selectedInspector: null as number | null,
    selectedInspectorName: '',
    showDeleteConfirm: false, // 添加删除确认弹窗状态
  },

  onLoad(options: { id?: string }) {
    const id = options.id || ''
    this.setData({ id })
    
    // 根据是否有ID判断是新增还是编辑
    if (id) {
      // 编辑模式
      wx.setNavigationBarTitle({ title: '编辑景点' })
      this.loadAttractionDetail()
    } else {
      // 新增模式
      wx.setNavigationBarTitle({ title: '新增景点' })
      // 初始化一个空的景点对象
      this.setData({
        attraction: {
          attractionsName: '',
          attractionsNote: '',
          attractionsLng: '',
          attractionsLat: ''
        },
        loading: false
      })
    }
    
    // 无论新增还是编辑都需要加载这些数据
    this.loadTypeList()
    this.loadInspectorList()
  },

  // 加载景点详情
  async loadAttractionDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        // 设置景点信息
        this.setData({
          attraction: res.data
        })
        
        // 设置图片列表
        if (res.data.attractionsImg) {
          this.setData({
            fileList: [{
              url: res.data.attractionsImg,
              name: '景点图片',
              isImage: true
            }]
          })
        }
        
        // 设置视频列表
        if (res.data.attractionsVideo) {
          this.setData({
            videoList: [{
              url: res.data.attractionsVideo,
              name: '景点视频',
              isVideo: true
            }]
          })
        }
        
        // 设置已选类型
        if (res.data.attractionsTypes && res.data.attractionsTypes.length > 0) {
          const typeIds = res.data.attractionsTypes.map(item => item.id)
          const typeNames = res.data.attractionsTypes.map(item => item.typeName).join(', ')
          
          this.setData({
            selectedTypes: typeIds,
            tempSelectedTypes: typeIds,
            selectedTypesText: typeNames
          })
        }
        
        // 设置已选巡查员
        if (res.data.inspectorId) {
          this.setData({
            selectedInspector: res.data.inspectorId,
            selectedInspectorName: res.data.inspectorName || ''
          })
        }
      } else {
        Notify({ type: 'danger', message: '获取景点详情失败' })
      }
    } catch (error) {
      console.error('获取景点详情失败:', error)
      Notify({ type: 'danger', message: '网络请求失败，请稍后重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载景点类型列表
  async loadTypeList() {
    try {
      const res = await getAllTypes()
      
      if (res.code === 200 && res.data) {
        this.setData({
          typeList: res.data
        })
      }
    } catch (error) {
      console.error('获取景点类型列表失败:', error)
    }
  },

  // 加载巡查员列表
  async loadInspectorList() {
    try {
      const res = await listUserVoByPage({
        pageSize: 100,
        current: 1,
        userRole: "inspector",
      })
      
      if (res.code === 200 && res.data && res.data.records) {
        this.setData({
          inspectorList: res.data.records
        })
      }
    } catch (error) {
      console.error('获取巡查员列表失败:', error)
    }
  },

  // 上传图片后的回调
  afterRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传图片
    uploadFile({
      filePath: file.url,
      biz: 'attractions_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
        this.setData({
          fileList: [{
            url: res.data,
            name: '景点图片',
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

  // 删除图片
  onDeleteImage() {
    this.setData({
      fileList: []
    })
  },

  // 上传视频后的回调
  afterVideoRead(event) {
    const { file } = event.detail
    
    // 显示上传中
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    // 上传视频
    uploadFile({
      filePath: file.url,
      biz: 'attractions_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新文件列表
        this.setData({
          videoList: [{
            url: res.data,
            name: '景点视频',
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

  // 删除视频
  onDeleteVideo() {
    this.setData({
      videoList: []
    })
  },

  // 获取当前位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'attraction.attractionsLng': res.longitude,
          'attraction.attractionsLat': res.latitude
        })
        Notify({ type: 'success', message: '位置获取成功' })
      },
      fail: () => {
        Notify({ type: 'danger', message: '获取位置失败，请检查定位权限' })
      }
    })
  },

  
  // 表单提交
  async onFormSubmit(event) {
    const formData = event.detail.value
    
    // 表单验证
    if (!formData.attractionsName) {
      Notify({ type: 'warning', message: '请输入景点名称' })
      return
    }
    
    this.setData({ submitting: true })
    
    try {
      // 构建请求参数
      const params: any = {
        attractionsName: formData.attractionsName,
        attractionsNote: formData.attractionsNote,
        attractionsLng: formData.attractionsLng ? Number(formData.attractionsLng) : undefined,
        attractionsLat: formData.attractionsLat ? Number(formData.attractionsLat) : undefined,
        attractionsImg: this.data.fileList.length > 0 ? this.data.fileList[0].url : undefined,
        attractionsVideo: this.data.videoList.length > 0 ? this.data.videoList[0].url : undefined,
        attractionsTypeIds: this.data.selectedTypes.length > 0 ? this.data.selectedTypes : undefined,
        inspectorId: this.data.selectedInspector || undefined
      }
      
      let res
      if (this.data.id) {
        // 编辑模式 - 更新
        params.id = this.data.id
        res = await updateAttractions(params)
      } else {
        // 新增模式 - 添加
        res = await addAttractions(params)
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
      console.error(this.data.id ? '更新景点信息失败:' : '新增景点信息失败:', error)
      Notify({ type: 'danger', message: this.data.id ? '保存失败，请稍后重试' : '新增失败，请稍后重试' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 显示类型选择弹窗
  showTypePopup() {
    this.setData({
      showTypeSelector: true,
      tempSelectedTypes: [...this.data.selectedTypes]
    })
  },
  
  // 关闭类型选择弹窗
  onTypePopupClose() {
    this.setData({
      showTypeSelector: false
    })
  },
  
  // 类型选择变化
  onTypeChange(event) {
    this.setData({
      tempSelectedTypes: event.detail
    })
  },
  
  // 点击单元格切换选中状态
  toggleType(event) {
    const { index } = event.currentTarget.dataset
    const typeId = this.data.typeList[index].id
    const tempSelectedTypes = [...this.data.tempSelectedTypes]
    
    const typeIndex = tempSelectedTypes.indexOf(typeId)
    if (typeIndex > -1) {
      tempSelectedTypes.splice(typeIndex, 1)
    } else {
      tempSelectedTypes.push(typeId)
    }
    
    this.setData({
      tempSelectedTypes
    })
  },
  
  // 确认类型选择
  onTypePopupConfirm() {
    // 获取选中类型的名称
    const selectedTypeNames = this.data.typeList
      .filter(item => this.data.tempSelectedTypes.includes(item.id))
      .map(item => item.typeName)
    
    this.setData({
      selectedTypes: this.data.tempSelectedTypes,
      selectedTypesText: selectedTypeNames.join(', ') || '请选择',
      showTypeSelector: false
    })
  },
  
  // 显示巡查员选择弹窗
  showInspectorPopup() {
    this.setData({
      showInspectorSelector: true
    })
  },
  
  // 关闭巡查员选择弹窗
  onInspectorPopupClose() {
    this.setData({
      showInspectorSelector: false
    })
  },
  
  // 选择巡查员
  selectInspector(event) {
    const { id, name } = event.currentTarget.dataset
    
    this.setData({
      selectedInspector: id,
      selectedInspectorName: name,
      'attraction.inspectorName': name,
      showInspectorSelector: false
    })
  },
  
  // 空函数，用于阻止事件冒泡
  noop() {},
  
  // 添加onShow方法，用于页面显示时的处理
  onShow() {
    // 页面显示时加载数据
    this.loadTypeList()
    this.loadInspectorList()
  },
  
  // 显示删除确认弹窗
  showDeleteConfirm() {
    if (!this.data.id) return
    this.setData({ showDeleteConfirm: true })
  },
  
  // 关闭删除确认弹窗
  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false })
  },
  
  // 确认删除景点
  async confirmDelete() {
    if (!this.data.id) return
    
    this.setData({ submitting: true })
    
    try {
      const res = await deleteAttractions({ id: this.data.id })
      
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
      console.error('删除景点失败:', error)
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