import Toast from 'tdesign-miniprogram/toast/index'
import { addType, updateType } from '../../../api/controller/attractions-type-controller/attractions-type-controller'

Page({
  data: {
    isEdit: false,
    submitting: false,
    form: {
      typeName: '',
      typeDescription: '',
    },
  },

  _editId: '',

  onLoad(options: any) {
    if (options?.id) {
      this._editId = options.id
      this.setData({
        isEdit: true,
        form: {
          typeName: decodeURIComponent(options.name || ''),
          typeDescription: decodeURIComponent(options.desc || ''),
        },
      })
    }
  },

  onNameChange(e: any) {
    this.setData({ 'form.typeName': e.detail?.value ?? '' })
  },

  onDescChange(e: any) {
    this.setData({ 'form.typeDescription': e.detail?.value ?? '' })
  },

  async onSubmit() {
    const { form, isEdit, submitting } = this.data
    if (submitting) return

    const typeName = form.typeName.trim()
    const typeDescription = form.typeDescription.trim()
    if (!typeName) {
      Toast({ context: this, selector: '#t-toast', message: '请输入类型名称', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload = {
        typeName,
        typeDescription: typeDescription || undefined,
      }
      if (isEdit) {
        await updateType({ ...payload, id: this._editId })
      } else {
        await addType(payload)
      }
      try {
        this.getOpenerEventChannel().emit('typeChanged')
      } catch {}
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存成功' : '新建成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存失败' : '新建失败', theme: 'error' })
    }
  },
})
