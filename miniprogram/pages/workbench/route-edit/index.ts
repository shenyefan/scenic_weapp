import Toast from 'tdesign-miniprogram/toast/index'
import {
  getRouteById,
  addRoute,
  updateRoute,
} from '../../../api/controller/attractions-route-controller/attractions-route-controller'
import { listAttractionsByPage } from '../../../api/controller/attractions-controller/attractions-controller'

let _itemKeyCounter = 0

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    showAttractionPicker: false,
    attractionPickerOptions: [] as { label: string; value: string }[],
    attractionPickerValue: [''] as string[],
    form: {
      routeName: '',
      routeDescription: '',
      routeImage: '',
      routeVideo: '',
      durationStr: '',
      routeItems: [] as {
        _key: number
        attractionsId: string
        attractionName: string
        stayStr: string
        stopNote: string
      }[],
    },
  },

  _editId: '',
  _editingItemIndex: -1,

  onLoad(options: any) {
    this.fetchAttractions()
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  async fetchAttractions() {
    try {
      const res = await listAttractionsByPage({ current: 1, pageSize: 100, sortField: 'updateTime', sortOrder: 'descend' })
      const options = (res?.data?.records ?? []).map((a: any) => ({
        label: a.attractionsName || '未命名景点',
        value: a.id || '',
      }))
      this.setData({ attractionPickerOptions: options })
    } catch {}
  },

  async fetchDetail(id: string) {
    try {
      const res = await getRouteById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const routeItems = (item.routeItems ?? []).map((ri: any) => ({
        _key: _itemKeyCounter++,
        attractionsId: ri.attractionsId || '',
        attractionName: ri.attractions?.attractionsName || '',
        stayStr: ri.estimatedStayMinutes != null ? String(ri.estimatedStayMinutes) : '',
        stopNote: ri.stopNote || '',
      }))
      this.setData({
        initLoading: false,
        form: {
          routeName: item.routeName || '',
          routeDescription: item.routeDescription || '',
          routeImage: item.routeImage || '',
          routeVideo: item.routeVideo || '',
          durationStr: item.estimatedDurationMinutes != null ? String(item.estimatedDurationMinutes) : '',
          routeItems,
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  onImageChange(e: any) { this.setData({ 'form.routeImage': e.detail?.value ?? '' }) },
  onVideoChange(e: any) { this.setData({ 'form.routeVideo': e.detail?.value ?? '' }) },
  onNameChange(e: any) { this.setData({ 'form.routeName': e.detail?.value ?? '' }) },
  onDescChange(e: any) { this.setData({ 'form.routeDescription': e.detail?.value ?? '' }) },
  onDurationChange(e: any) { this.setData({ 'form.durationStr': e.detail?.value ?? '' }) },

  onStayChange(e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`form.routeItems[${index}].stayStr`]: e.detail?.value ?? '' })
  },

  onStopNoteChange(e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`form.routeItems[${index}].stopNote`]: e.detail?.value ?? '' })
  },

  onAddItem() {
    const routeItems = [...this.data.form.routeItems, {
      _key: _itemKeyCounter++,
      attractionsId: '',
      attractionName: '',
      stayStr: '30',
      stopNote: '',
    }]
    this.setData({ 'form.routeItems': routeItems })
  },

  onRemoveItem(e: any) {
    const index = e.currentTarget.dataset.index
    const routeItems = this.data.form.routeItems.filter((_, i) => i !== index)
    this.setData({ 'form.routeItems': routeItems })
  },

  onMoveItemUp(e: any) {
    const index = e.currentTarget.dataset.index
    if (index <= 0) return
    const routeItems = [...this.data.form.routeItems]
    const tmp = routeItems[index - 1]
    routeItems[index - 1] = routeItems[index]
    routeItems[index] = tmp
    this.setData({ 'form.routeItems': routeItems })
  },

  onMoveItemDown(e: any) {
    const index = e.currentTarget.dataset.index
    const routeItems = [...this.data.form.routeItems]
    if (index >= routeItems.length - 1) return
    const tmp = routeItems[index + 1]
    routeItems[index + 1] = routeItems[index]
    routeItems[index] = tmp
    this.setData({ 'form.routeItems': routeItems })
  },

  onAttractionPickerTap(e: any) {
    const index = e.currentTarget.dataset.index
    this._editingItemIndex = index
    const item = this.data.form.routeItems[index]
    this.setData({
      showAttractionPicker: true,
      attractionPickerValue: [item.attractionsId || ''],
    })
  },

  onAttractionPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    const index = this._editingItemIndex
    if (index >= 0) {
      this.setData({
        [`form.routeItems[${index}].attractionsId`]: value,
        [`form.routeItems[${index}].attractionName`]: label,
      })
    }
    this.setData({ showAttractionPicker: false })
    this._editingItemIndex = -1
  },

  onAttractionPickerCancel() {
    this.setData({ showAttractionPicker: false })
    this._editingItemIndex = -1
  },

  async onSubmit() {
    const { form, isEdit } = this.data
    if (!form.routeName.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入路线名称', theme: 'warning' })
      return
    }
    const routeItems = form.routeItems.map((item, index) => ({
      attractionsId: item.attractionsId,
      sortOrder: index,
      stopNote: item.stopNote || undefined,
      estimatedStayMinutes: item.stayStr ? Number(item.stayStr) : undefined,
    }))
    const duration = form.durationStr ? Number(form.durationStr) : undefined
    this.setData({ submitting: true })
    try {
      if (isEdit) {
        await updateRoute({
          id: this._editId,
          routeName: form.routeName,
          routeDescription: form.routeDescription || undefined,
          routeImage: form.routeImage || undefined,
          routeVideo: form.routeVideo || undefined,
          estimatedDurationMinutes: duration,
          routeItems,
        })
      } else {
        await addRoute({
          routeName: form.routeName,
          routeDescription: form.routeDescription || undefined,
          routeImage: form.routeImage || undefined,
          routeVideo: form.routeVideo || undefined,
          estimatedDurationMinutes: duration,
          routeItems,
        })
      }
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存成功' : '新建成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存失败' : '提交失败', theme: 'error' })
    }
  },
})
