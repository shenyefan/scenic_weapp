// pages/workbench/index.ts

interface GridItem {
  text: string
  image: string
  url: string
}

interface GridSection {
  title: string
  items: GridItem[]
}

function buildSections(role: string): GridSection[] {
  const sections: GridSection[] = []

  // 通用（所有人可见）
  sections.push({
    title: '通用',
    items: [
      { text: '景点信息', image: '/assets/workbench/attraction.svg', url: '/pages/workbench/attraction/index' },
      { text: '游览路线', image: '/assets/workbench/route.svg', url: '/pages/workbench/route/index' },
      { text: '天气信息', image: '/assets/workbench/weather.svg', url: '/pages/workbench/weather/index' },
      { text: '灾害信息', image: '/assets/workbench/disaster.svg', url: '/pages/workbench/disaster/index' },
    ],
  })

  // 票务管理
  if (role === 'admin') {
    sections.push({
      title: '票务管理',
      items: [
        { text: '门票购买', image: '/assets/workbench/ticket.svg', url: '/pages/workbench/ticket/index' },
        { text: '订单管理', image: '/assets/workbench/order.svg', url: '/pages/workbench/order-manage/index' },
        { text: '扫码检票', image: '/assets/workbench/scan.svg', url: '/pages/workbench/scan/index' },
      ],
    })
  } else {
    sections.push({
      title: '票务管理',
      items: [
        { text: '门票购买', image: '/assets/workbench/ticket.svg', url: '/pages/workbench/ticket/index' },
        { text: '我的订单', image: '/assets/workbench/order.svg', url: '/pages/workbench/orders/index' },
      ],
    })
  }

  // 工作台公共（登录且非普通用户）
  if (role === 'inspector' || role === 'disposer' || role === 'admin') {
    const common: GridItem[] = [
      { text: '签到', image: '/assets/workbench/checkin.svg', url: '/pages/workbench/checkin/index' },
      { text: '签到记录', image: '/assets/workbench/checkin.svg', url: '/pages/workbench/checkin-record/index' },
      { text: '通讯录', image: '/assets/workbench/directory.svg', url: '/pages/workbench/directory/index' },
    ]

    if (role === 'inspector') {
      sections.push({
        title: '工作台',
        items: [
          ...common,
          { text: '巡查任务', image: '/assets/workbench/task.svg', url: '/pages/workbench/inspection/index' },
          { text: '巡查检查', image: '/assets/workbench/inspect.svg', url: '/pages/workbench/inspection/index' },
          { text: '巡查记录', image: '/assets/workbench/track.svg', url: '/pages/workbench/inspection-record/index' },
        ],
      })
    } else if (role === 'disposer') {
      sections.push({
        title: '工作台',
        items: [
          ...common,
          { text: '问题处置', image: '/assets/workbench/disposal.svg', url: '/pages/workbench/disposal/index' },
        ],
      })
    } else if (role === 'admin') {
      sections.push({
        title: '工作台',
        items: [
          ...common,
          { text: '巡查任务', image: '/assets/workbench/task.svg', url: '/pages/workbench/inspection/index' },
          { text: '巡查轨迹', image: '/assets/workbench/track.svg', url: '/pages/workbench/track/index' },
          { text: '处置任务', image: '/assets/workbench/disposal.svg', url: '/pages/workbench/disposal/index' },
          { text: '用户管理', image: '/assets/workbench/users.svg', url: '/pages/workbench/users/index' },
        ],
      })
    }
  }

  return sections
}

Page({
  data: {
    sections: [] as GridSection[],
    showNavBar: false,
  },

  onPageScroll({ scrollTop }: { scrollTop: number }) {
    const showNavBar = scrollTop > 10
    if (showNavBar !== this.data.showNavBar) {
      this.setData({ showNavBar })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 2 })
    }
    this._loadSections()
  },

  _loadSections() {
    let role = ''
    const token = wx.getStorageSync('token')
    if (token) {
      try {
        const raw = wx.getStorageSync('userInfo')
        const info = raw ? JSON.parse(raw) : null
        role = info?.role || 'user'
      } catch {
        role = 'user'
      }
    }
    this.setData({ sections: buildSections(role) })
  },

  onGridItemTap(e: any) {
    const url: string = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({ url })
    }
  },
})