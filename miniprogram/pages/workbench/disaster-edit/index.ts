import Toast from 'tdesign-miniprogram/toast/index'
import {
  addDisasters,
  getDisastersById,
  updateDisasters,
} from '../../../api/controller/natural-disasters-controller/natural-disasters-controller'

const SEVERITY_OPTIONS = [
  { label: '轻微', value: 'minor' },
  { label: '一般', value: 'moderate' },
  { label: '重大', value: 'severe' },
  { label: '极端', value: 'extreme' },
]

const SEVERITY_LABEL_MAP: Record<string, string> = {
  minor: '轻微',
  mild: '轻微',
  moderate: '一般',
  medium: '一般',
  severe: '重大',
  high: '重大',
  extreme: '极端',
  critical: '极端'
}

const SEVERITY_VALUE_MAP: Record<string, string> = {
  minor: 'minor',
  mild: 'minor',
  moderate: 'moderate',
  medium: 'moderate',
  severe: 'severe',
  high: 'severe',
  extreme: 'extreme',
  critical: 'extreme',
  '轻微': 'minor',
  '一般': 'moderate',
  '重大': 'severe',
  '极端': 'extreme',
}

function formatInputDateTime(value?: string) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 19)
}

function defaultDateTime(offsetHours = 0) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    showStartPicker: false,
    showEndPicker: false,
    showSeverityPicker: false,
    startPickerValue: defaultDateTime(),
    endPickerValue: defaultDateTime(1),
    severityPickerValue: ['moderate'] as string[],
    severityOptions: SEVERITY_OPTIONS,
    form: {
      disastersTitle: '',
      disastersDescription: '',
      disastersStartTime: defaultDateTime(),
      disastersEndTime: defaultDateTime(1),
      disastersSeverity: 'moderate',
      severityLabel: '一般',
    },
  },

  _editId: '',

  onLoad(options: any) {
    if (!this.isAdmin()) {
      Toast({ context: this, selector: '#t-toast', message: '仅管理员可操作', theme: 'warning' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  isAdmin() {
    try {
      const raw = wx.getStorageSync('userInfo')
      return raw ? JSON.parse(raw)?.role === 'admin' : false
    } catch {
      return false
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getDisastersById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const rawSeverity = String(item.disastersSeverity || 'moderate')
      const severity = SEVERITY_VALUE_MAP[rawSeverity] || SEVERITY_VALUE_MAP[rawSeverity.toLowerCase()] || 'moderate'
      const startTime = formatInputDateTime(item.disastersStartTime) || defaultDateTime()
      const endTime = formatInputDateTime(item.disastersEndTime) || defaultDateTime(1)
      this.setData({
        initLoading: false,
        startPickerValue: startTime,
        endPickerValue: endTime,
        severityPickerValue: [severity],
        form: {
          disastersTitle: item.disastersTitle || '',
          disastersDescription: item.disastersDescription || '',
          disastersStartTime: startTime,
          disastersEndTime: endTime,
          disastersSeverity: severity,
          severityLabel: SEVERITY_LABEL_MAP[rawSeverity] || SEVERITY_LABEL_MAP[rawSeverity.toLowerCase()] || SEVERITY_LABEL_MAP[severity],
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载灾害信息失败', theme: 'error' })
    }
  },

  onTitleChange(e: any) { this.setData({ 'form.disastersTitle': e.detail?.value ?? '' }) },
  onDescChange(e: any) { this.setData({ 'form.disastersDescription': e.detail?.value ?? '' }) },

  onStartPickerTap() { this.setData({ showStartPicker: true }) },
  onStartPickerCancel() { this.setData({ showStartPicker: false }) },
  onStartPickerConfirm(e: any) {
    const value = String(e.detail?.value ?? '')
    this.setData({ startPickerValue: value, 'form.disastersStartTime': value, showStartPicker: false })
  },

  onStartPickerColumnChange(e: any) {
    const value = String(e.detail?.value ?? '')
    if (value) this.setData({ startPickerValue: value })
  },

  onEndPickerTap() { this.setData({ showEndPicker: true }) },
  onEndPickerCancel() { this.setData({ showEndPicker: false }) },
  onEndPickerConfirm(e: any) {
    const value = String(e.detail?.value ?? '')
    this.setData({ endPickerValue: value, 'form.disastersEndTime': value, showEndPicker: false })
  },

  onEndPickerColumnChange(e: any) {
    const value = String(e.detail?.value ?? '')
    if (value) this.setData({ endPickerValue: value })
  },

  onSeverityPickerTap() { this.setData({ severityPickerValue: [this.data.form.disastersSeverity], showSeverityPicker: true }) },
  onSeverityPickerCancel() { this.setData({ showSeverityPicker: false }) },
  onSeverityPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? 'moderate'
    const label: string = e.detail.label?.[0] ?? (SEVERITY_LABEL_MAP[value] || value)
    this.setData({
      severityPickerValue: [value],
      'form.disastersSeverity': value,
      'form.severityLabel': label,
      showSeverityPicker: false,
    })
  },

  async onSubmit() {
    const { form, isEdit, submitting } = this.data
    if (submitting) return
    if (!form.disastersTitle.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入灾害标题', theme: 'warning' })
      return
    }
    if (!form.disastersStartTime || !form.disastersEndTime) {
      Toast({ context: this, selector: '#t-toast', message: '请选择开始和结束时间', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload = {
        disastersTitle: form.disastersTitle.trim(),
        disastersDescription: form.disastersDescription.trim() || '暂无描述',
        disastersStartTime: form.disastersStartTime,
        disastersEndTime: form.disastersEndTime,
        disastersSeverity: form.disastersSeverity,
      }
      if (isEdit) await updateDisasters({ ...payload, id: this._editId })
      else await addDisasters(payload)
      try { this.getOpenerEventChannel().emit('disasterChanged') } catch {}
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存成功' : '新建成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存失败' : '新建失败', theme: 'error' })
    }
  },
})
