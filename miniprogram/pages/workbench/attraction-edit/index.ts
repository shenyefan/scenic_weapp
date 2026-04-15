import Toast from 'tdesign-miniprogram/toast/index'
import {
  getAttractionsById,
  addAttractions,
  updateAttractions,
} from '../../../api/controller/attractions-controller/attractions-controller'
import { listAllTypes } from '../../../api/controller/attractions-type-controller/attractions-type-controller'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    showTypePicker: false,
    showInspectorPicker: false,
    typeOptions: [] as { id: string; label: string }s { label: string; value: string }[],
    inspectorPickerValue: [''] as string[],
    form: {
      attractionsName: '',
      attractionsDescription: '',
      attractionsImage: '',
      attractionsVideo: '',
      lngStr: '',
      latStr: '',
      typeIds: [] as string[],
      typeNames: [] as string[],
      inspectorId: '',
      inspectorName: '',
    },
  },

  _editId: '',

  onLoad(options: any) {
    this.fetchTypes()
    this.fetchInspectors()
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getAttractionsById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const typeIds: string[] = (item.types ?? []).map((t: any) => t?.id).filter(Boolean)
      const typeNames: string[] = (item.types ?? []).map((t: any) => t?.typeName).filter(Boolean)
      const inspectorId: string = item.inspector?.id || ''
      const inspectorName: string = item.inspector?.userNickname || item.inspector?.userAccount || ''
      this.setData({
        initLoading: false,
        inspectorPickerValue: [inspectorId],
        form: {
          attractionsName: item.attractionsName || '',
          attractionsDescription: item.attractionsDescription || '',
          attractionsImage: item.attractionsImage || '',
          attractionsVideo: item.attractionsVideo || '',
          lngStr: item.attractionsLng != null ? String(item.attractionsLng) : '',
          latStr: item.attractionsLat != null ? String(item.attractionsLat) : '',
          typeIds,
          typeNames,
          inspectorId,
          inspectorName,
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  async fetchTypes() {
    try {
      const res = await listAllTypes()
      this.setData({
        typeOptions: (res?.data ?? []).map((t: any) => ({ id: t.id, label: t.typeName || '' })),
      })Options: (res?.data ?? []).map((t: any) => ({ id: t.id, label
    } catch {}
  },

  async fetchInspectors() {
    try {
      const res = await listUserByPage({ current: 1, pageSize: 100, userRole: 'inspector' as any })
      const inspectorPickerOptions = [
        { label: '不指定', value: '' },
        ...(res?.data?.records ?? []).map((u: any) => ({
          label: u.userNickname || u.userAccount,
          value: u.id,
        })),
      ]
      this.setData({ inspectorPickerOptions })
    } catch {}
  },

  onImageChange(e: any) { this.setData({ 'form.attractionsImage': e.detail?.value ?? '' }) },
  onVideoChange(e: any) { this.setData({ 'form.attractionsVideo': e.detail?.value ?? '' }) },

  onNameChange(e: any) { this.setData({ 'form.attractionsName': e.detail?.value ?? '' }) },
  onDescChange(e: any) { this.setData({ 'form.attractionsDescription': e.detail?.value ?? '' }) },
  onLngChange(e: any) { this.setData({ 'form.lngStr': e.detail?.value ?? '' }) },
  onLatChange(e: any) { this.setData({ 'form.latStr': e.detail?.value ?? '' }) },

  // 景点类型多选
  onTypePickerTap() { this.setData({ showTypePicker: true }) },
  onTypePickerCancel( this.setData({ showTypePicker: true }) },
  onTypePickerCancel() { this.setData({ showTypePicker: false }) },
  onTypePickerConfirm(e: any) {
    const value: string[] = e?.detail?.value ?? []
    const { typeOptions } = this.data
    const typeNames = value.map((id) => typeOptions.find((t) => t.id === id)?.label ?? '').filter(Boolean)
    this.setData({ 'form.typeIds': value
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      inspectorPickerValue: [value],
      'form.inspectorId': value,
      'form.inspectorName': value ? label : '',
      showInspectorPicker: false,
    })
  },

  async onSubmit() {
    const { form, isEdit } = this.data
    if (!form.attractionsName.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入景点名称', theme: 'warning' })
      return
    }
    const lng = form.lngStr ? parseFloat(form.lngStr) : undefined
    const lat = form.latStr ? parseFloat(form.latStr) : undefined
    this.setData({ submitting: true })
    try {
      if (isEdit) {
        await updateAttractions({
          id: this._editId,
          attractionsName: form.attractionsName,
          attractionsDescription: form.attractionsDescription || undefined,
          attractionsImage: form.attractionsImage || undefined,
          attractionsVideo: form.attractionsVideo || undefined,
          attractionsLng: lng,
          attractionsLat: lat,
          typeIds: form.typeIds.length > 0 ? form.typeIds : undefined,
          inspectorId: form.inspectorId || undefined,
        })
      } else {
        await addAttractions({
          attractionsName: form.attractionsName,
          attractionsDescription: form.attractionsDescription || undefined,
          attractionsImage: form.attractionsImage || undefined,
          attractionsVideo: form.attractionsVideo || undefined,
          attractionsLng: lng ?? 0,
          attractionsLat: lat ?? 0,
          typeIds: form.typeIds.length > 0 ? form.typeIds : undefined,
          inspectorId: form.inspectorId || undefined,
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
