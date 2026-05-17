import Toast from 'tdesign-miniprogram/toast/index'
import {
  addTicket,
  getTicketById,
  updateTicket,
} from '../../../api/controller/ticket-controller/ticket-controller'

const STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '上架', value: 'on_sale' },
  { label: '下架', value: 'off_sale' },
]

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '草稿',
  on_sale: '上架',
  off_sale: '下架',
}

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    showStatusPicker: false,
    statusPickerValue: ['draft'] as string[],
    statusOptions: STATUS_OPTIONS,
    form: {
      ticketName: '',
      ticketPriceStr: '',
      ticketDescription: '',
      ticketImage: '',
      validDaysStr: '1',
      stockQuantityStr: '0',
      ticketStatus: 'draft',
      statusLabel: '草稿',
    },
  },

  _editId: '',

  onLoad(options: any) {
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getTicketById({ id } as any)
      const item = res?.data
      if (!item) throw new Error()
      const status = (item as any).ticketStatus || 'draft'
      this.setData({
        initLoading: false,
        statusPickerValue: [status],
        form: {
          ticketName: (item as any).ticketName || '',
          ticketPriceStr: item.ticketPrice != null ? String(item.ticketPrice) : '',
          ticketDescription: (item as any).ticketDescription || '',
          ticketImage: (item as any).ticketImage || '',
          validDaysStr: item.validDays != null ? String(item.validDays) : '1',
          stockQuantityStr: item.stockQuantity != null ? String(item.stockQuantity) : '0',
          ticketStatus: status,
          statusLabel: STATUS_LABEL_MAP[status] || status,
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载门票信息失败', theme: 'error' })
    }
  },

  onNameChange(e: any) {
    this.setData({ 'form.ticketName': e.detail?.value ?? '' })
  },

  onPriceChange(e: any) {
    this.setData({ 'form.ticketPriceStr': e.detail?.value ?? '' })
  },

  onDescChange(e: any) {
    this.setData({ 'form.ticketDescription': e.detail?.value ?? '' })
  },

  onImageChange(e: any) {
    this.setData({ 'form.ticketImage': e.detail?.value ?? '' })
  },

  onValidDaysChange(e: any) {
    this.setData({ 'form.validDaysStr': e.detail?.value ?? '' })
  },

  onStockChange(e: any) {
    this.setData({ 'form.stockQuantityStr': e.detail?.value ?? '' })
  },

  onStatusPickerTap() {
    this.setData({ statusPickerValue: [this.data.form.ticketStatus], showStatusPicker: true })
  },

  onStatusPickerCancel() {
    this.setData({ showStatusPicker: false })
  },

  onStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? 'draft'
    this.setData({
      showStatusPicker: false,
      statusPickerValue: [value],
      'form.ticketStatus': value,
      'form.statusLabel': STATUS_LABEL_MAP[value] || value,
    })
  },

  async onSubmit() {
    const { form, isEdit, submitting } = this.data
    if (submitting) return

    const ticketName = form.ticketName.trim()
    const ticketPrice = Number(form.ticketPriceStr)
    const validDays = Number(form.validDaysStr)
    const stockQuantity = Number(form.stockQuantityStr)

    if (!ticketName) {
      Toast({ context: this, selector: '#t-toast', message: '请输入门票名称', theme: 'warning' })
      return
    }
    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      Toast({ context: this, selector: '#t-toast', message: '请输入有效价格', theme: 'warning' })
      return
    }
    if (!Number.isInteger(validDays) || validDays < 1) {
      Toast({ context: this, selector: '#t-toast', message: '有效期至少为1天', theme: 'warning' })
      return
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      Toast({ context: this, selector: '#t-toast', message: '库存不能小于0', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload: Record<string, any> = {
        ticketName,
        ticketPrice,
        ticketDescription: form.ticketDescription.trim() || undefined,
        ticketImage: form.ticketImage || undefined,
        validDays,
        stockQuantity,
        ticketStatus: form.ticketStatus as any,
      }
      if (isEdit) {
        await updateTicket({ ...payload, id: this._editId } as any)
      } else {
        await addTicket(payload as any)
      }
      try {
        this.getOpenerEventChannel().emit('ticketChanged')
      } catch {}
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存成功' : '新建成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存失败' : '新建失败', theme: 'error' })
    }
  },
})
