import Toast from 'tdesign-miniprogram/toast/index'
import {
  getTaskDisposalById,
  addTaskDisposal,
  updateTaskDisposal,
} from '../../../api/controller/task-disposal-controller/task-disposal-controller'
import {
  listInspectionTasksByPage,
} from '../../../api/controller/task-inspection-controller/task-inspection-controller'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'

const DISPOSAL_STATUS_OPTIONS = [
  { label: '待处置', value: 'pending' },
  { label: '处理中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已超时', value: 'timeout' },
]

Page({
  data: {
    role: 'user',
    isEdit: false,
    initLoading: false,
    submitting: false,
    showInspectionPicker: false,
    showDisposerPicker: false,
    showDisposalStatusPicker: false,
    inspectionPickerOptions: [] as { label: string; value: string }[],
    inspectionPickerValue: [''] as string[],
    disposerPickerOptions: [] as { label: string; value: string }[],
    disposerPickerValue: [''] as string[],
    disposalStatusPickerOptions: DISPOSAL_STATUS_OPTIONS,
    disposalStatusPickerValue: ['pending'] as string[],
    linkedInspection: null as any,
    form: {
      inspectionTaskId: '',
      inspectionTaskLabel: '',
      disposerId: '',
      disposerName: '',
      disposalImages: '',
      disposalDescription: '',
      disposalStatus: 'pending',
      disposalStatusLabel: '待处置',
    },
  },

  _editId: '',

  onLoad(options: any) {
    try {
      const raw = wx.getStorageSync('userInfo')
      if (raw) {
        const info = JSON.parse(raw)
        this.setData({ role: info?.role || 'user' })
      }
    } catch {}
    const { role } = this.data
    if (role === 'admin') {
      this.fetchAbnormalInspections()
      this.fetchDisposers()
    }
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getTaskDisposalById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      const disposalStatus = item.disposalStatus || 'pending'
      const disposalStatusLabel = DISPOSAL_STATUS_OPTIONS.find(o => o.value === disposalStatus)?.label || disposalStatus
      const inspectionTask = item.inspectionTask
      const taskLabel = inspectionTask
        ? `${item.attractions?.attractionsName || ''} - ${inspectionTask.taskDate || ''}`
        : ''
      let linkedInspection: any = null
      if (inspectionTask) {
        linkedInspection = {
          attractionsName: item.attractions?.attractionsName || '未知景点',
          inspectorName: item.attractions?.inspector?.userNickname || item.attractions?.inspector?.userAccount || '',
          taskDate: inspectionTask.taskDate || '',
          taskStatus: inspectionTask.taskStatus || '',
          taskStatusLabel: this._getInspectionStatusLabel(inspectionTask.taskStatus || ''),
          inspectionDescription: inspectionTask.inspectionDescription || '',
          inspectionImages: inspectionTask.inspectionImages || '',
          abnormalStatus: inspectionTask.abnormalStatus || '',
          abnormalStatusLabel: this._getAbnormalStatusLabel(inspectionTask.abnormalStatus || ''),
        }
      }
      this.setData({
        initLoading: false,
        linkedInspection,
        inspectionPickerValue: [item.inspectionTaskId || ''],
        disposerPickerValue: [item.disposer?.id || ''],
        disposalStatusPickerValue: [disposalStatus],
        form: {
          inspectionTaskId: item.inspectionTaskId || '',
          inspectionTaskLabel: taskLabel,
          disposerId: item.disposer?.id || '',
          disposerName: item.disposer?.userNickname || item.disposer?.userAccount || '',
          disposalImages: item.disposalImages || '',
          disposalDescription: item.disposalDescription || '',
          disposalStatus,
          disposalStatusLabel,
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  async fetchAbnormalInspections() {
    try {
      const res = await listInspectionTasksByPage({
        abnormalStatus: 'abnormal' as any,
        taskStatus: 'waiting_disposal' as any,
        pageSize: 100,
      })
      const inspectionPickerOptions = [
        { label: '请选择异常巡查记录', value: '' },
        ...(res?.data?.records ?? []).map((t: any) => ({
          label: `${t.attractions?.attractionsName || ''} - ${t.taskDate || t.id}`,
          value: t.id,
        })),
      ]
      this.setData({ inspectionPickerOptions })
    } catch {}
  },

  async fetchDisposers() {
    try {
      const res = await listUserByPage({ current: 1, pageSize: 100, userRole: 'disposer' as any })
      const disposerPickerOptions = [
        { label: '不指定', value: '' },
        ...(res?.data?.records ?? []).map((u: any) => ({
          label: u.userNickname || u.userAccount,
          value: u.id,
        })),
      ]
      this.setData({ disposerPickerOptions })
    } catch {}
  },

  _getInspectionStatusLabel(status: string) {
    const map: Record<string, string> = {
      in_progress: '巡查中', waiting_disposal: '待处置', completed: '已完成', timeout: '已超时',
    }
    return map[status] || '未知'
  },

  _getAbnormalStatusLabel(status: string) {
    const map: Record<string, string> = { unknown: '待确认', normal: '正常', abnormal: '异常' }
    return map[status] || '未知'
  },

  onInspectionPickerTap() { this.setData({ showInspectionPicker: true }) },
  onInspectionPickerCancel() { this.setData({ showInspectionPicker: false }) },
  onInspectionPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      inspectionPickerValue: [value],
      'form.inspectionTaskId': value,
      'form.inspectionTaskLabel': value ? label : '',
      showInspectionPicker: false,
    })
  },

  onDisposerPickerTap() { this.setData({ showDisposerPicker: true }) },
  onDisposerPickerCancel() { this.setData({ showDisposerPicker: false }) },
  onDisposerPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      disposerPickerValue: [value],
      'form.disposerId': value,
      'form.disposerName': value ? label : '',
      showDisposerPicker: false,
    })
  },

  onDisposalStatusPickerTap() { this.setData({ showDisposalStatusPicker: true }) },
  onDisposalStatusPickerCancel() { this.setData({ showDisposalStatusPicker: false }) },
  onDisposalStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      disposalStatusPickerValue: [value],
      'form.disposalStatus': value,
      'form.disposalStatusLabel': label,
      showDisposalStatusPicker: false,
    })
  },

  onDescChange(e: any) {
    this.setData({ 'form.disposalDescription': e.detail?.value ?? '' })
  },

  onImageChange(e: any) {
    this.setData({ 'form.disposalImages': e.detail?.value ?? '' })
  },

  async onSubmit() {
    const { form, isEdit, role } = this.data
    if (role === 'admin' && !form.inspectionTaskId) {
      Toast({ context: this, selector: '#t-toast', message: '请选择巡查记录', theme: 'warning' })
      return
    }
    if (role === 'admin' && !form.disposerId) {
      Toast({ context: this, selector: '#t-toast', message: '请选择处置员', theme: 'warning' })
      return
    }
    this.setData({ submitting: true })
    try {
      if (isEdit) {
        await updateTaskDisposal({
          id: this._editId,
          disposalImages: form.disposalImages || undefined,
          disposalDescription: form.disposalDescription || undefined,
          disposalStatus: form.disposalStatus as any,
        })
        Toast({ context: this, selector: '#t-toast', message: '更新成功', theme: 'success' })
      } else {
        await addTaskDisposal({
          inspectionTaskId: form.inspectionTaskId,
          disposerId: form.disposerId,
          disposalImages: form.disposalImages || undefined,
          disposalDescription: form.disposalDescription || undefined,
        })
        Toast({ context: this, selector: '#t-toast', message: '派发成功', theme: 'success' })
      }
      this.setData({ submitting: false })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '更新失败' : '派发失败', theme: 'error' })
    }
  },
})
