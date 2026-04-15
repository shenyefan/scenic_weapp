import Toast from 'tdesign-miniprogram/toast/index'
import {
  getAttractionsById,
  addAttractions,
  updateAttractions,
} from '../../../api/controller/attractions-controller/attractions-controller'
import { listAllTypes } from '../../../api/controller/attractions-type-controller/attractions-type-controller'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'
import { uploadFile } from '../../../api/upload'

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    imageUploading: false,
    videoUploading: false,
    showTypePicker: false,
    showInspectorPicker: false,
    typeList: [] as { id: string; typeName: string }[],
    pendingTypeIds: [] as string[],
    inspectorPickerOptions: [] as { label: string; value: string }[],
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
        typeList: (res?.data ?? []).map((t: any) => ({ id: t.id, typeName: t.typeName || '' })),
      })
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

  onPickImage() {
    if (this.data.imageUploading) return
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (!path) return
        this.setData({ imageUploading: true })
        uploadFile(path, 'attraction')
          .then((url) => {
            this.setData({ 'form.attractionsImage': url, imageUploading: false })
          })
          .catch(() => {
            this.setData({ imageUploading: false })
            Toast({ context: this, selector: '#t-toast', message: '图片上传失败', theme: 'error' })
          })
      },
    })
  },

  onClearImage() {
    this.setData({ 'form.attractionsImage': '' })
  },

  onClearVideo() {
    this.setData({ 'form.attractionsVideo': '' })
  },

  onPickVideo() {
    if (this.data.videoUploading) return
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (!path) return
        this.setData({ videoUploading: true })
        uploadFile(path, 'attraction')
          .then((url) => {
            this.setData({ 'form.attractionsVideo': url, videoUploading: false })
          })
          .catch(() => {
            this.setData({ videoUploading: false })
            Toast({ context: this, selector: '#t-toast', message: '视频上传失败', theme: 'error' })
          })
      },
    })
  },

  onNameChange(e: any) { this.setData({ 'form.attractionsName': e.detail?.value ?? '' }) },
  onDescChange(e: any) { this.setData({ 'form.attractionsDescription': e.detail?.value ?? '' }) },
  onLngChange(e: any) { this.setData({ 'form.lngStr': e.detail?.value ?? '' }) },
  onLatChange(e: any) { this.setData({ 'form.latStr': e.detail?.value ?? '' }) },

  // 景点类型多选
  onTypePickerTap() {
    this.setData({ pendingTypeIds: [...this.data.form.typeIds], showTypePicker: true })
  },
  onTypePickerCancel() { this.setData({ showTypePicker: false }) },
  onTypePickerVisibleChange(e: any) {
    if (!e?.detail?.visible) this.setData({ showTypePicker: false })
  },
  onPendingTypeChange(e: any) { this.setData({ pendingTypeIds: e?.detail?.value ?? [] }) },
  onTypePickerConfirm() {
    const { pendingTypeIds, typeList } = this.data
    const typeNames = pendingTypeIds.map((id) => typeList.find((t) => t.id === id)?.typeName ?? '').filter(Boolean)
    this.setData({ 'form.typeIds': pendingTypeIds, 'form.typeNames': typeNames, showTypePicker: false })
  },

  // 巡查员 picker
  onInspectorPickerTap() { this.setData({ showInspectorPicker: true }) },
  onInspectorPickerCancel() { this.setData({ showInspectorPicker: false }) },
  onInspectorPickerConfirm(e: any) {
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
