import Toast from 'tdesign-miniprogram/toast/index'
import {
  addWeather,
  getWeatherById,
  updateWeather,
} from '../../../api/controller/natural-weather-controller/natural-weather-controller'

function formatInputDateTime(value?: string) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 19)
}

function defaultDateTime() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : NaN
}

Page({
  data: {
    isEdit: false,
    initLoading: false,
    submitting: false,
    showTimePicker: false,
    timePickerValue: defaultDateTime(),
    form: {
      weatherTime: defaultDateTime(),
      tempStr: '',
      humidityStr: '',
      pressureStr: '',
      windSpeedStr: '',
      windDegStr: '',
      rainStr: '',
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
      const res = await getWeatherById({ id })
      const item = res?.data
      if (!item) throw new Error()
      const weatherTime = formatInputDateTime(item.weatherTime) || defaultDateTime()
      this.setData({
        initLoading: false,
        timePickerValue: weatherTime,
        form: {
          weatherTime,
          tempStr: item.temp != null ? String(item.temp) : '',
          humidityStr: item.humidity != null ? String(item.humidity) : '',
          pressureStr: item.pressure != null ? String(item.pressure) : '',
          windSpeedStr: item.windSpeed != null ? String(item.windSpeed) : '',
          windDegStr: item.windDeg != null ? String(item.windDeg) : '',
          rainStr: item.rain != null ? String(item.rain) : '',
        },
      })
    } catch {
      this.setData({ initLoading: false })
      Toast({ context: this, selector: '#t-toast', message: '加载天气信息失败', theme: 'error' })
    }
  },

  onTimePickerTap() { this.setData({ showTimePicker: true }) },
  onTimePickerCancel() { this.setData({ showTimePicker: false }) },
  onTimePickerConfirm(e: any) {
    const value = String(e.detail?.value ?? '')
    this.setData({ timePickerValue: value, 'form.weatherTime': value, showTimePicker: false })
  },

  onTimePickerColumnChange(e: any) {
    const value = String(e.detail?.value ?? '')
    if (value) this.setData({ timePickerValue: value })
  },

  onTempChange(e: any) { this.setData({ 'form.tempStr': e.detail?.value ?? '' }) },
  onHumidityChange(e: any) { this.setData({ 'form.humidityStr': e.detail?.value ?? '' }) },
  onPressureChange(e: any) { this.setData({ 'form.pressureStr': e.detail?.value ?? '' }) },
  onWindSpeedChange(e: any) { this.setData({ 'form.windSpeedStr': e.detail?.value ?? '' }) },
  onWindDegChange(e: any) { this.setData({ 'form.windDegStr': e.detail?.value ?? '' }) },
  onRainChange(e: any) { this.setData({ 'form.rainStr': e.detail?.value ?? '' }) },

  async onSubmit() {
    const { form, isEdit, submitting } = this.data
    if (submitting) return
    if (!form.weatherTime) {
      Toast({ context: this, selector: '#t-toast', message: '请选择记录时间', theme: 'warning' })
      return
    }

    const temp = parseOptionalNumber(form.tempStr)
    const humidity = parseOptionalNumber(form.humidityStr)
    const pressure = parseOptionalNumber(form.pressureStr)
    const windSpeed = parseOptionalNumber(form.windSpeedStr)
    const windDeg = parseOptionalNumber(form.windDegStr)
    const rain = parseOptionalNumber(form.rainStr)
    if ([temp, humidity, pressure, windSpeed, windDeg, rain].some((n) => Number.isNaN(n))) {
      Toast({ context: this, selector: '#t-toast', message: '请输入有效数值', theme: 'warning' })
      return
    }
    if (humidity != null && (humidity < 0 || humidity > 100)) {
      Toast({ context: this, selector: '#t-toast', message: '湿度需在0-100之间', theme: 'warning' })
      return
    }
    if (windDeg != null && (windDeg < 0 || windDeg > 360)) {
      Toast({ context: this, selector: '#t-toast', message: '风向角需在0-360之间', theme: 'warning' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload: Record<string, any> = { weatherTime: form.weatherTime, temp, humidity, pressure, windSpeed, windDeg, rain }
      if (isEdit) await updateWeather({ ...payload, id: this._editId } as any)
      else await addWeather(payload as any)
      try { this.getOpenerEventChannel().emit('weatherChanged') } catch {}
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存成功' : '新建成功', theme: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch {
      this.setData({ submitting: false })
      Toast({ context: this, selector: '#t-toast', message: isEdit ? '保存失败' : '新建失败', theme: 'error' })
    }
  },
})
