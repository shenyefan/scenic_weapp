import Toast from 'tdesign-miniprogram/toast/index'
import {
  getInspectionTaskById,
  addInspectionTask,
  updateInspectionTask,
} from '../../../api/controller/task-inspection-controller/task-inspection-controller'
import { listAttractionsByPage } from '../../../api/controller/attractions-controller/attractions-controller'
import { listUserByPage } from '../../../api/controller/user-controller/user-controller'

const TASK_STATUS_OPTIONS = [
  { label: '巡查中', value: 'in_progress' },
  { label: '待处置', value: 'waiting_disposal' },
  { label: '已完成', value: 'completed' },
  { label: '已超时', value: 'timeout' },
]

const ABNORMAL_STATUS_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '异常', value: 'abnormal' },
  { label: '待确认', value: 'unknown' },
]

Page({
  data: {
    role: 'user',
    isEdit: false,
    initLoading: false,
    submitting: false,
    // picker
    showAttractionsPicker: false,
    showInspectorPicker: false,
    showTaskStatusPicker: false,
    showAbnormalStatusPicker: false,
    showDatePicker: false,
    attractionsPickerOptions: [] as { label: string; value: string }[],
    attractionsPickerValue: [''] as string[],
    inspectorPickerOptions: [] as { label: string; value: string }[],
    inspectorPickerValue: [''] as string[],
    taskStatusPickerOptions: TASK_STATUS_OPTIONS,
    taskStatusPickerValue: ['in_progress'] as string[],
    abnormalStatusPickerOptions: ABNORMAL_STATUS_OPTIONS,
    abnormalStatusPickerValue: ['unknown'] as string[],
    datePickerValue: new Date().toISOString().split('T')[0],
    form: {
      attractionsId: '',
      attractionsName: '',
      inspectorId: '',
      inspectorName: '',
      taskDate: new Date().toISOString().split('T')[0],
      inspectionImages: '',
      inspectionDescription: '',
      taskStatus: 'in_progress',
      taskStatusLabel: '巡查中',
      abnormalStatus: 'unknown',
      abnormalStatusLabel: '待确认',
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
      this.fetchAttractions()
      this.fetchInspectors()
    }
    if (options?.id) {
      this._editId = options.id
      this.setData({ isEdit: true, initLoading: true })
      this.fetchDetail(options.id)
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getInspectionTaskById({ id })
      const item = res?.data
      if (!item) throw new Error('not found')
      const taskStatus = item.taskStatus || 'in_progress'
      const abnormalStatus = item.abnormalStatus || 'unknown'
      const taskStatusLabel = TASK_STATUS_OPTIONS.find(o => o.value === taskStatus)?.label || taskStatus
      const abnormalStatusLabel = ABNORMAL_STATUS_OPTIONS.find(o => o.value === abnormalStatus)?.label || abnormalStatus
      this.setData({
        initLoading: false,
        attractionsPickerValue: [item.attractions?.id || ''],
        inspectorPickerValue: [item.inspector?.id || ''],
        taskStatusPickerValue: [taskStatus],
        abnormalStatusPickerValue: [abnormalStatus],
        datePickerValue: item.taskDate || this.data.form.taskDate,
        form: {
          attractionsId: item.attractions?.id || '',
          attractionsName: item.attractions?.attractionsName || '',
          inspectorId: item.inspector?.id || '',
          inspectorName: item.inspector?.userNickname || item.inspector?.userAccount || '',
          taskDate: item.taskDate || '',
          inspectionImages: item.inspectionImages || '',
          inspectionDescription: item.inspectionDescription || '',
          taskStatus,
          taskStatusLabel,
          abnormalStatus,
          abnormalStatusLabel,
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' })
    }
  },

  async fetchAttractions() {
    try {
      const res = await listAttractionsByPage({ current: 1, pageSize: 100 })
      const attractionsPickerOptions = [
        { label: '请选择景点', value: '' },
        ...(res?.data?.records ?? []).map((a: any) => ({
          label: a.attractionsName || a.id,
          value: a.id,
        })),
      ]
      this.setData({ attractionsPickerOptions })
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

  // ===== Picker 事件 =====
  onAttractionsPickerTap() { this.setData({ showAttractionsPicker: true }) },
  onAttractionsPickerCancel() { this.setData({ showAttractionsPicker: false }) },
  onAttractionsPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      attractionsPickerValue: [value],
      'form.attractionsId': value,
      'form.attractionsName': value ? label : '',
      showAttractionsPicker: false,
    })
  },

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

  onDatePickerTap() { this.setData({ showDatePicker: true }) },
  onDatePickerCancel() { this.setData({ showDatePicker: false }) },
  onDatePickerConfirm(e: any) {
    const value = e.detail.value
    if (value) {
      this.setData({ datePickerValue: value, 'form.taskDate': value, showDatePicker: false })
    } else {
      this.setData({ showDatePicker: false })
    }
  },

  onTaskStatusPickerTap() { this.setData({ showTaskStatusPicker: true }) },
  onTaskStatusPickerCancel() { this.setData({ showTaskStatusPicker: false }) },
  onTaskStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      taskStatusPickerValue: [value],
      'form.taskStatus': value,
      'form.taskStatusLabel': label,
      showTaskStatusPicker: false,
    })
  },

  onAbnormalStatusPickerTap() { this.setData({ showAbnormalStatusPicker: true }) },
  onAbnormalStatusPickerCancel() { this.setData({ showAbnormalStatusPicker: false }) },
  onAbnormalStatusPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    const label: string = e.detail.label?.[0] ?? ''
    this.setData({
      abnormalStatusPickerValue: [value],
      'form.abnormalStatus': value,
      'form.abnormalStatusLabel': label,
      showAbnormalStatusPicker: false,
    })
  },

  onDescChange(e: any) {
    this.setData({ 'form.inspectionDescription': e.detail?.value ?? '' })
  },

  onImageChange(e: any) {
    this.setData({ 'form.inspectionImages': e.detail?.value ?? '' })
  },

  // ===== 提交 =====
  async onSubmit() {
    const { form, isEdit, role } = this.data
    if (role === 'admin' && !form.attractionsId) {
      Toast({ context: this, selector: '#t-toast', message: '请选择景点', theme: 'warning' })
      return
    }
    if (role === 'admin' && !form.inspectorId) {
      Toast({ context: this, selector: '#t-toast', message: '请选择巡查员', theme: 'warning' })
      return
    }
    if (role === 'admin' && !form.taskDate) {
      Toast({ context: this, selector: '#t-toast', message: '请选择任务日期', theme: 'warning' })
      return
    }
    this.setData({ submitting: true })
    try {
      if (isEdit) {
        const updateData: any = {
          id: this._editId,
          inspectionImages: form.inspectionImages || undefined,
          inspectionDescription: form.inspectionDescription || undefined,
          abnormalStatus: form.abnormalStatus as any,
          taskStatus: form.taskStatus as any,
        }
        if (role === 'admin') {
          updateData.attractionsId = form.attractionsId
          updateData.inspectorId = form.inspectorId
        }
        await updateInspectionTask(updateData)
        Toast({ context: this, selector: '#t-toast', message: '更新成功', theme: 'success' })
      } else {
        await addInspectionTask({
          attractionsId: form.attractionsId,
          inspectorId: form.inspectorId,
          taskDate: form.taskDate,
          inspectionImages: form.inspectionImages || undefined,
          inspectionDescription: form.inspectionDescription || undefined,
          abnormalStatus: form.abnormalStatus as any,
        })
        Toast({ context: this, selector: '#t-toast', message: '创建成功', theme: 'success' })
      }
      this.setData({ submitting: false })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '更新失败' : '创建失败', theme: 'error' })
    }
  },
})
