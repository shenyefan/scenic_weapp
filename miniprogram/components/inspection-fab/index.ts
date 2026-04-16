import { inspectionTracker, type InspectionTrackerSnapshot } from '../../utils/inspection-tracker'

const FAB_WIDTH = 112
const FAB_HEIGHT = 44
const EDGE_GAP = 16

const getPositionStyle = (left: number, top: number) => `left: ${left}px; top: ${top}px;`

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

Component({
  data: {
    visible: false,
    dragStyle: '',
  },

  _unsubscribe: null as null | (() => void),
  _left: 0,
  _top: 0,
  _dragStartX: 0,
  _dragStartY: 0,
  _dragStartLeft: 0,
  _dragStartTop: 0,
  _dragReady: false,
  _dragMoved: false,
  _ignoreTap: false,
  _hasCustomPosition: false,

  lifetimes: {
    attached() {
      this.checkCurrentPage()
      this.startTracking()
    },

    detached() {
      this.stopTracking()
    },
  },

  pageLifetimes: {
    show() {
      this.checkCurrentPage()
      this.updateVisibility(inspectionTracker.getSnapshot())
    },
  },

  methods: {
    checkCurrentPage() {
      const isInspectionPage = this.getCurrentPageIsInspection()
      if (isInspectionPage) {
        this.setData({ visible: false })
      }
    },

    async startTracking() {
      try {
        await inspectionTracker.bootstrap()
        const snapshot = inspectionTracker.getSnapshot()
        this.updateVisibility(snapshot)
        this.subscribeTracker()
      } catch {
        this.setData({ visible: false })
      }
    },

    stopTracking() {
      if (this._unsubscribe) {
        this._unsubscribe()
        this._unsubscribe = null
      }
    },

    subscribeTracker() {
      if (this._unsubscribe) return
      this._unsubscribe = inspectionTracker.subscribe((snapshot) => {
        this.updateVisibility(snapshot)
      })
    },

    updateVisibility(snapshot: InspectionTrackerSnapshot) {
      const isRunning = snapshot.status === 'running'
      const isInspectionPage = this.getCurrentPageIsInspection()
      const visible = isRunning && !isInspectionPage
      this.setData({ visible })
    },

    getCurrentPageIsInspection() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (!currentPage) return false
      const route = currentPage.route || ''
      return route.includes('workbench/inspection/index')
    },

    onTouchStart(e: WechatMiniprogram.TouchEvent) {
      const touch = e.touches[0]
      if (!touch) return
      this._dragStartX = touch.clientX
      this._dragStartY = touch.clientY
      this._dragReady = false
      this._dragMoved = false

      if (this._hasCustomPosition) {
        this._dragStartLeft = this._left
        this._dragStartTop = this._top
        this._dragReady = true
        return
      }

      this.createSelectorQuery()
        .select('.inspection-fab')
        .boundingClientRect((rect) => {
          if (!rect) return
          this._left = rect.left
          this._top = rect.top
          this._dragStartLeft = rect.left
          this._dragStartTop = rect.top
          this._dragReady = true
        })
        .exec()
    },

    onTouchMove(e: WechatMiniprogram.TouchEvent) {
      const touch = e.touches[0]
      if (!touch) return
      if (!this._dragReady) return

      const moveX = touch.clientX - this._dragStartX
      const moveY = touch.clientY - this._dragStartY
      if (Math.abs(moveX) > 4 || Math.abs(moveY) > 4) {
        this._dragMoved = true
      }

      const info = wx.getSystemInfoSync()
      const maxLeft = info.windowWidth - FAB_WIDTH - EDGE_GAP
      const maxTop = info.windowHeight - FAB_HEIGHT - EDGE_GAP
      const left = clamp(this._dragStartLeft + moveX, EDGE_GAP, maxLeft)
      const top = clamp(this._dragStartTop + moveY, EDGE_GAP, maxTop)

      this._left = left
      this._top = top
      this._hasCustomPosition = true
      this.setData({ dragStyle: `${getPositionStyle(left, top)} right: auto; bottom: auto;` })
    },

    onTouchEnd() {
      this._ignoreTap = this._dragMoved
      if (this._ignoreTap) {
        setTimeout(() => {
          this._ignoreTap = false
        }, 80)
      }
    },

    onFabTap() {
      if (this._ignoreTap) return
      this.navigateToInspection()
    },

    navigateToInspection() {
      wx.navigateTo({ url: '/pages/workbench/inspection/index' })
    },
  },
})
