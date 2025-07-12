const app = getApp<IAppOption>()

Component({
  properties: {
    // 是否显示按钮
    show: {
      type: Boolean,
      value: true
    }
  },

  data: {
    isPatrolling: false,
    position: {
      x: 20, // 左下角位置
      y: 0   // 将在ready中计算
    },
    // 拖拽相关
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    startTouch: { x: 0, y: 0 }
  },

  lifetimes: {
    ready() {
      // 获取屏幕尺寸，设置初始位置在左下角
      const systemInfo = wx.getSystemInfoSync()
      const bottomPosition = systemInfo.windowHeight - 200 // 距离底部120px
      
      this.setData({
        'position.y': bottomPosition
      })
      
      // 监听全局巡查状态变化
      this.checkPatrolStatus()
      
      // 定时检查状态
      setInterval(() => {
        this.checkPatrolStatus()
      }, 1000)
    }
  },

  methods: {
    // 检查巡查状态
    checkPatrolStatus() {
      if (app.getPatrolStatus) {
        const status = app.getPatrolStatus()
        this.setData({
          isPatrolling: status.isPatrolling
        })
      }
    },

    // 触摸开始
    onTouchStart(e: any) {
      const touch = e.touches[0]
      this.setData({
        isDragging: false,
        startPosition: {
          x: this.data.position.x,
          y: this.data.position.y
        },
        startTouch: {
          x: touch.clientX,
          y: touch.clientY
        }
      })
    },

    // 触摸移动
    onTouchMove(e: any) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.data.startTouch.x
      const deltaY = touch.clientY - this.data.startTouch.y
      
      // 如果移动距离超过阈值，认为是拖拽
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.setData({ isDragging: true })
      }
      
      if (this.data.isDragging) {
        const systemInfo = wx.getSystemInfoSync()
        let newX = this.data.startPosition.x + deltaX
        let newY = this.data.startPosition.y + deltaY
        
        // 边界限制
        newX = Math.max(0, Math.min(newX, systemInfo.windowWidth - 60))
        newY = Math.max(0, Math.min(newY, systemInfo.windowHeight - 60))
        
        this.setData({
          position: { x: newX, y: newY }
        })
      }
    },

    // 触摸结束
    onTouchEnd() {
      if (this.data.isDragging) {
        // 拖拽结束后，自动吸附到屏幕边缘
        this.snapToEdge()
      }
      
      this.setData({ isDragging: false })
    },

    // 吸附到屏幕边缘
    snapToEdge() {
      const systemInfo = wx.getSystemInfoSync()
      const centerX = systemInfo.windowWidth / 2
      let newX = this.data.position.x
      
      // 根据当前位置决定吸附到左边还是右边
      if (this.data.position.x < centerX) {
        newX = 20 // 吸附到左边
      } else {
        newX = systemInfo.windowWidth - 80 // 吸附到右边
      }
      
      this.setData({
        'position.x': newX
      })
    },

    // 点击事件
    onTap() {
      // 如果刚刚拖拽过，不触发点击
      if (this.data.isDragging) {
        return
      }
      
      // 跳转到巡查地图页面
      wx.navigateTo({
        url: '/subpages/manage/inspection_map/index',
        fail: (error) => {
          console.error('跳转失败:', error)
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          })
        }
      })
    }
  }
})