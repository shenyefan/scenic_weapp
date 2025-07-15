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
    inspectorPickerList: [] as string[],
    selectedTypes: [] as number[],
    selectedTypesText: '',
    tempSelectedTypes: [] as number[],
    showTypeSelector: false,
    showInspectorSelector: false,
    selectedInspector: null as number | null,
    selectedInspectorName: '',
    showDeleteConfirm: false,
  },

  onLoad(options: { id?: string }) {
    const id = options.id || ''
    this.setData({ id })
    
    if (id) {
      wx.setNavigationBarTitle({ title: '编辑景点' })
      this.loadAttractionDetail()
    } else {
      wx.setNavigationBarTitle({ title: '新增景点' })
      this.setData({
        attraction: {
          attractionsName: '',
          attractionsNote: '',
          attractionsLng: '',
          attractionsLat: '',
          inspectorName: ''
        },
        loading: false,
        selectedInspectorName: ''
      })
    }
    
    this.loadTypeList()
    this.loadInspectorList()
  },

  async loadAttractionDetail() {
    try {
      this.setData({ loading: true })

      const res = await getAttractionsVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        this.setData({
          attraction: res.data
        })
        
        if (res.data.attractionsImg) {
          this.setData({
            fileList: [{
              url: res.data.attractionsImg,
              name: '景点图片',
              isImage: true
            }]
          })
        }
        
        if (res.data.attractionsVideo) {
          this.setData({
            videoList: [{
              url: res.data.attractionsVideo,
              name: '景点视频',
              isVideo: true
            }]
          })
        }
        
        if (res.data.attractionsTypes && res.data.attractionsTypes.length > 0) {
          const typeIds = res.data.attractionsTypes.map(item => item.id)
          const typeNames = res.data.attractionsTypes.map(item => item.typeName).join(', ')
          
          this.setData({
            selectedTypes: typeIds,
            tempSelectedTypes: typeIds,
            selectedTypesText: typeNames
          })
        }
        
        // 修复：正确设置巡查员信息
        if (res.data.inspectorId && res.data.inspectorName) {
          this.setData({
            selectedInspector: res.data.inspectorId,
            selectedInspectorName: res.data.inspectorName
          })
        } else {
          this.setData({
            selectedInspector: null,
            selectedInspectorName: ''
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

  async loadInspectorList() {
    try {
      const res = await listUserVoByPage({
        pageSize: 100,
        current: 1,
        userRole: "inspector",
      })
      
      if (res.code === 200 && res.data && res.data.records) {
        const inspectorPickerList = res.data.records.map(item => item.userName)
        
        this.setData({
          inspectorList: res.data.records,
          inspectorPickerList
        })
      }
    } catch (error) {
      console.error('获取巡查员列表失败:', error)
    }
  },

  afterRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_img'
    }).then(res => {
      if (res.code === 200 && res.data) {
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

  onDeleteImage() {
    this.setData({
      fileList: []
    })
  },

  afterVideoRead(event) {
    const { file } = event.detail
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 })
    
    uploadFile({
      filePath: file.url,
      biz: 'attractions_video'
    }).then(res => {
      if (res.code === 200 && res.data) {
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

  onDeleteVideo() {
    this.setData({
      videoList: []
    })
  },

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

  async onFormSubmit(event) {
    const formData = event.detail.value
    
    if (!formData.attractionsName) {
      Notify({ type: 'warning', message: '请输入景点名称' })
      return
    }
    
    this.setData({ submitting: true })
    
    try {
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
        params.id = this.data.id
        res = await updateAttractions(params)
      } else {
        res = await addAttractions(params)
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
      console.error(this.data.id ? '更新景点信息失败:' : '新增景点信息失败:', error)
      Notify({ type: 'danger', message: this.data.id ? '保存失败，请稍后重试' : '新增失败，请稍后重试' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  showTypePopup() {
    this.setData({
      showTypeSelector: true,
      tempSelectedTypes: [...this.data.selectedTypes]
    })
  },
  
  onTypePopupClose() {
    this.setData({
      showTypeSelector: false
    })
  },
  
  onTypeChange(event) {
    this.setData({
      tempSelectedTypes: event.detail
    })
  },
  
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
  
  onTypePopupConfirm() {
    const selectedTypeNames = this.data.typeList
      .filter(item => this.data.tempSelectedTypes.includes(item.id))
      .map(item => item.typeName)
    
    this.setData({
      selectedTypes: this.data.tempSelectedTypes,
      selectedTypesText: selectedTypeNames.join(', ') || '请选择',
      showTypeSelector: false
    })
  },
  
  showInspectorPopup() {
    this.setData({
      showInspectorSelector: true
    })
  },
  
  onInspectorPopupClose() {
    this.setData({
      showInspectorSelector: false
    })
  },
  
  // 修复：selectInspector方法
  selectInspector(event) {
    const { detail } = event
    const selectedInspector = this.data.inspectorList[detail.index]
    
    // 确保选中的巡查员信息正确更新
    this.setData({
      selectedInspector: selectedInspector.id,
      selectedInspectorName: selectedInspector.userName,
      showInspectorSelector: false
    })
    
    // 同时更新attraction对象中的inspectorName（如果存在）
    if (this.data.attraction) {
      this.setData({
        'attraction.inspectorName': selectedInspector.userName
      })
    }
  },
  
  noop() {},
  
  onShow() {
    this.loadTypeList()
    this.loadInspectorList()
  },
  
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
      const res = await deleteAttractions({ id: this.data.id })
      
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
      console.error('删除景点失败:', error)
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