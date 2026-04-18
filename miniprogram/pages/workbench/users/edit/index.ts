import Toast from 'tdesign-miniprogram/toast/index'
import { getUserById, updateUser } from '../../../../api/controller/user-controller/user-controller'
import { uploadFile } from '../../../../api/upload'

const ROLE_OPTIONS = [
  { label: '普通用户', value: 'user' },
  { label: '巡查员', value: 'inspector' },
  { label: '处置员', value: 'disposer' },
  { label: '管理员', value: 'admin' },
  { label: '封禁', value: 'ban' },
]

const GENDER_OPTIONS = [
  { label: '未设置', value: '' },
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const ROLE_LABEL_MAP: Record<string, string> = {
  user: '普通用户', inspector: '巡查员', disposer: '处置员', admin: '管理员', ban: '封禁',
}

Page({
  data: {
    initLoading: true,
    submitting: false,
    avatarUploading: false,
    showRolePicker: false,
    showGenderPicker: false,
    rolePickerValue: ['user'] as string[],
    genderPickerValue: [''] as string[],
    roleOptions: ROLE_OPTIONS.map((r) => ({ label: r.label, value: r.value })),
    genderOptions: GENDER_OPTIONS.map((g) => ({ label: g.label, value: g.value })),
    form: {
      userNickname: '',
      userAccount: '',
      userPhone: '',
      userEmail: '',
      userProfile: '',
      userAvatar: '',
      userGender: '',
      genderLabel: '未设置',
      userRole: 'user',
      roleLabel: '普通用户',
      userPassword: '',
    },
  },

  _editId: '',

  onLoad(options: any) {
    if (options?.id) {
      this._editId = options.id
      this.fetchDetail(options.id)
    } else {
      Toast({ context: this, selector: '#t-toast', message: '参数错误', theme: 'error' })
      this.setData({ initLoading: false })
    }
  },

  async fetchDetail(id: string) {
    try {
      const res = await getUserById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const role = (item as any).userRole || 'user'
      const gender = (item as any).userGender || ''
      const genderLabel = gender || '未设置'
      this.setData({
        initLoading: false,
        rolePickerValue: [role],
        genderPickerValue: [gender],
        form: {
          userAvatar: (item as any).userAvatar || '',
          userNickname: (item as any).userNickname || '',
          userAccount: (item as any).userAccount || '',
          userPhone: (item as any).userPhone || '',
          userEmail: (item as any).userEmail || '',
          userProfile: (item as any).userProfile || '',
          userGender: gender,
          genderLabel,
          userRole: role,
          roleLabel: ROLE_LABEL_MAP[role] || role,
          userPassword: '',
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载用户信息失败', theme: 'error' })
    }
  },

  async onChooseAvatar(e: any) {
    const tempFilePath: string = e.detail.avatarUrl
    if (!tempFilePath) return
    this.setData({ avatarUploading: true })
    try {
      const url = await uploadFile(tempFilePath, 'avatar')
      this.setData({ 'form.userAvatar': url, avatarUploading: false })
    } catch {
      this.setData({ avatarUploading: false })
      Toast({ context: this, selector: '#t-toast', message: '头像上传失败', theme: 'error' })
    }
  },

  onNicknameChange(e: any) {
    this.setData({ 'form.userNickname': e.detail.value ?? '' })
  },

  onAccountChange(e: any) {
    this.setData({ 'form.userAccount': e.detail.value ?? '' })
  },

  onPhoneChange(e: any) {
    this.setData({ 'form.userPhone': e.detail.value ?? '' })
  },

  onEmailChange(e: any) {
    this.setData({ 'form.userEmail': e.detail.value ?? '' })
  },

  onProfileChange(e: any) {
    this.setData({ 'form.userProfile': e.detail.value ?? '' })
  },

  onPasswordChange(e: any) {
    this.setData({ 'form.userPassword': e.detail.value ?? '' })
  },

  onRolePickerTap() {
    this.setData({ rolePickerValue: [this.data.form.userRole], showRolePicker: true })
  },

  onRolePickerCancel() {
    this.setData({ showRolePicker: false })
  },

  onRolePickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? 'user'
    this.setData({
      showRolePicker: false,
      rolePickerValue: [value],
      'form.userRole': value,
      'form.roleLabel': ROLE_LABEL_MAP[value] || value,
    })
  },

  onGenderPickerTap() {
    this.setData({ genderPickerValue: [this.data.form.userGender], showGenderPicker: true })
  },

  onGenderPickerCancel() {
    this.setData({ showGenderPicker: false })
  },

  onGenderPickerConfirm(e: any) {
    const value: string = e.detail.value?.[0] ?? ''
    this.setData({
      showGenderPicker: false,
      genderPickerValue: [value],
      'form.userGender': value,
      'form.genderLabel': value || '未设置',
    })
  },

  async onSubmit() {
    const { form, submitting } = this.data
    if (submitting) return

    if (!form.userNickname.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入昵称', theme: 'warning' })
      return
    }
    if (!form.userAccount.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入登录账号', theme: 'warning' })
      return
    }
    if (form.userPassword && form.userPassword.length < 8) {
      Toast({ context: this, selector: '#t-toast', message: '新密码不能少于8位', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload: Record<string, any> = {
        id: this._editId,
        userAvatar: form.userAvatar || undefined,
        userNickname: form.userNickname.trim(),
        userAccount: form.userAccount.trim(),
        userPhone: form.userPhone.trim() || undefined,
        userEmail: form.userEmail.trim() || undefined,
        userProfile: form.userProfile.trim() || undefined,
        userGender: form.userGender || undefined,
        userRole: form.userRole as any,
      }
      if (form.userPassword) {
        payload.userPassword = form.userPassword
      }
      await updateUser(payload as any)
      Toast({ context: this, selector: '#t-toast', message: '保存成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: '保存失败', theme: 'error' })
    }
  },
})
