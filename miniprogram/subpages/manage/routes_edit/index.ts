// @ts-ignore
import Notify from '@vant/weapp/notify/notify'
import { addAttractionsRoute, getAttractionsRouteVoById, updateAttractionsRoute, deleteAttractionsRoute } from '../../../api/attractionsRouteController'
import { listAttractionsVoByPage } from '../../../api/attractionsController'

Page({
  data: {
    id: '',
    route: null as API.AttractionsRouteVO | null,
    loading: true,
    submitting: false,
    // 景点相关数据
    attractionList: [] as API.AttractionsVO[],
    selectedAttractions: [] as API.AttractionsVO[], // 已选择的景点列表
    showAttractionSelector: false,
    // 路线备注
    routeNote: '',
    // 删除确认
    showDeleteConfirm: false
  },

  async onLoad(options: any) {
    const { id } = options
    if (id) {
      this.setData({ id })
      wx.setNavigationBarTitle({ title: '编辑路线' })
      this.loadRouteDetail()
    } else {
      wx.setNavigationBarTitle({ title: '新增路线' })
      // 新建模式下，先加载景点列表，然后设置loading为false
      await this.loadAttractionList()
      this.setData({ loading: false })
      return
    }
    this.loadAttractionList()
  },

  // 加载路线详情
  async loadRouteDetail() {
    if (!this.data.id) return
    
    try {
      this.setData({ loading: true })

      const res = await getAttractionsRouteVoById({ id: this.data.id })
      
      if (res.code === 200 && res.data) {
        const route = res.data
        this.setData({
          route: route,
          selectedAttractions: route.attractions || [],
          routeNote: route.routeNote || ''
        })
        
        // 更新景点列表的选中状态
        this.updateAttractionListSelection()
      } else {
        Notify({ type: 'danger', message: res.message || '获取路线详情失败' })
      }
    } catch (error) {
      console.error('获取路线详情失败:', error)
      Notify({ type: 'danger', message: '获取路线详情失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载景点列表
  async loadAttractionList() {
    try {
      const res = await listAttractionsVoByPage({
        current: 1,
        pageSize: 999 // 获取所有景点
      })
      
      if (res.code === 200 && res.data && res.data.records) {
        this.setData({
          attractionList: res.data.records
        })
        this.updateAttractionListSelection()
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
    }
  },

  // 更新景点列表的选中状态
  updateAttractionListSelection() {
    const attractionList = this.data.attractionList.map(attraction => ({
      ...attraction,
      selected: this.data.selectedAttractions.some(selected => selected.id === attraction.id)
    }))
    this.setData({ attractionList })
  },

  // 显示景点选择器
  showAttractionPopup() {
    this.setData({
      showAttractionSelector: true
    })
  },
  
  // 关闭景点选择器
  onAttractionPopupClose() {
    this.setData({
      showAttractionSelector: false
    })
  },

  // 选择景点
  selectAttraction(e: any) {
    const { index } = e.currentTarget.dataset
    const attraction = this.data.attractionList[index]
    
    // 检查是否已经选择过该景点
    const isSelected = this.data.selectedAttractions.some(item => item.id === attraction.id)
    if (isSelected) {
      Notify({ type: 'warning', message: '该景点已经添加过了' })
      return
    }
    
    // 添加到已选择列表
    const newSelectedAttractions = [...this.data.selectedAttractions, attraction]
    this.setData({
      selectedAttractions: newSelectedAttractions
    })
    
    // 更新景点列表的选中状态
    this.updateAttractionListSelection()
  },

  // 移除景点
  removeAttraction(e: any) {
    const { index } = e.currentTarget.dataset
    const newSelectedAttractions = this.data.selectedAttractions.filter((_, i) => i !== index)
    this.setData({
      selectedAttractions: newSelectedAttractions
    })
    
    // 更新景点列表的选中状态
    this.updateAttractionListSelection()
  },

  // 上移景点
  moveAttractionUp(e: any) {
    const { index } = e.currentTarget.dataset
    if (index === 0) return
    
    const attractions = [...this.data.selectedAttractions]
    const temp = attractions[index]
    attractions[index] = attractions[index - 1]
    attractions[index - 1] = temp
    
    this.setData({
      selectedAttractions: attractions
    })
  },

  // 下移景点
  moveAttractionDown(e: any) {
    const { index } = e.currentTarget.dataset
    if (index === this.data.selectedAttractions.length - 1) return
    
    const attractions = [...this.data.selectedAttractions]
    const temp = attractions[index]
    attractions[index] = attractions[index + 1]
    attractions[index + 1] = temp
    
    this.setData({
      selectedAttractions: attractions
    })
  },

  // 路线备注输入
  onRouteNoteInput(e: any) {
    this.setData({
      routeNote: e.detail.value
    })
  },

  // 表单提交
  async onFormSubmit(e: any) {
    if (this.data.selectedAttractions.length < 2) {
      Notify({ type: 'warning', message: '请至少选择2个景点' })
      return
    }
    
    this.setData({ submitting: true })
    
    try {
      const attractionIds = this.data.selectedAttractions.map(item => item.id)
      
      // 从表单数据中获取routeNote，如果没有则使用页面data中的值作为备用
      const formData = e.detail.value || {}
      const routeNote = formData.routeNote || this.data.routeNote || ''
      
      const params: any = {
        attractionIds: attractionIds,
        routeNote: routeNote
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
            const prevPage = pages[pages.length - 2] as any
            if (prevPage.setData) {
              prevPage.setData({
                needRefresh: true
              })
            }
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

  // 显示删除确认
  showDeleteConfirm() {
    if (!this.data.id) return
    this.setData({ showDeleteConfirm: true })
  },
  
  // 关闭删除确认
  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false })
  },
  
  // 确认删除
  async confirmDelete() {
    if (!this.data.id) return
    
    this.setData({ submitting: true })
    
    try {
      const res = await deleteAttractionsRoute({ id: this.data.id })
      
      if (res.code === 200) {
        Notify({ type: 'success', message: '删除成功' })
        
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2] as any
            if (prevPage.setData) {
              prevPage.setData({
                needRefresh: true
              })
            }
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

  // 返回
  onBack() {
    wx.navigateBack()
  }
})