Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '' },
    /** [{id: string, label: string}] */
    options: { type: Array, value: [] },
    /** 当前已选中的 id 数组 */
    value: { type: Array, value: [] },
  },

  data: {
    pendingValue: [] as string[],
  },

  observers: {
    visible(val: boolean) {
      if (val) {
        this.setData({ pendingValue: [...this.data.value] })
      }
    },
  },

  methods: {
    onPendingChange(e: any) {
      this.setData({ pendingValue: e?.detail?.value ?? [] })
    },

    onConfirm() {
      this.triggerEvent('confirm', { value: [...this.data.pendingValue] })
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onVisibleChange(e: any) {
      if (!e?.detail?.visible) this.triggerEvent('cancel')
    },
  },
})
