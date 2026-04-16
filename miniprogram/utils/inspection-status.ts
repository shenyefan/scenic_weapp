import { inspectionTracker, type InspectionTrackerSnapshot } from './inspection-tracker'

type PageOptionsWithInspectionStatus = WechatMiniprogram.Page.Options<Record<string, any>, Record<string, any>> & {
  data?: Record<string, any>
  onShow?: (...args: any[]) => any
  onHide?: (...args: any[]) => any
  onUnload?: (...args: any[]) => any
  _unsubscribeInspection?: null | (() => void)
  _startInspectionStatus?: () => Promise<void>
  _stopInspectionStatus?: () => void
  _updateInspectionStatus?: (snapshot: InspectionTrackerSnapshot) => void
}

export const withInspectionStatus = (options: PageOptionsWithInspectionStatus) => {
  const originalOnShow = options.onShow
  const originalOnHide = options.onHide
  const originalOnUnload = options.onUnload

  return {
    ...options,
    data: {
      ...(options.data || {}),
      isInspectionRunning: false,
    },

    onShow(...args: any[]) {
      originalOnShow?.apply(this, args)
      ;(this as any)._startInspectionStatus()
    },

    onHide(...args: any[]) {
      originalOnHide?.apply(this, args)
      ;(this as any)._stopInspectionStatus()
    },

    onUnload(...args: any[]) {
      originalOnUnload?.apply(this, args)
      ;(this as any)._stopInspectionStatus()
    },

    async _startInspectionStatus() {
      const page = this as any
      try {
        await inspectionTracker.bootstrap()
        page._updateInspectionStatus(inspectionTracker.getSnapshot())
        if (!page._unsubscribeInspection) {
          page._unsubscribeInspection = inspectionTracker.subscribe((snapshot) => {
            page._updateInspectionStatus(snapshot)
          })
        }
      } catch {
        page.setData({ isInspectionRunning: false })
      }
    },

    _stopInspectionStatus() {
      const page = this as any
      if (page._unsubscribeInspection) {
        page._unsubscribeInspection()
        page._unsubscribeInspection = null
      }
    },

    _updateInspectionStatus(snapshot: InspectionTrackerSnapshot) {
      const page = this as any
      const isInspectionRunning = snapshot.status === 'running'
      if (isInspectionRunning !== page.data.isInspectionRunning) {
        page.setData({ isInspectionRunning })
      }
    },
  }
}
