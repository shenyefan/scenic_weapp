import Toast from 'tdesign-miniprogram/toast/index'
import { listAttractionsByPage } from '../../api/controller/attractions-controller/attractions-controller'
import { listWeatherByPage } from '../../api/controller/natural-weather-controller/natural-weather-controller'
import { listVideosByPage } from '../../api/controller/publicize-video-controller/publicize-video-controller'
import { listWxPlatformsByPage } from '../../api/controller/publicize-wx-platform-controller/publicize-wx-platform-controller'
import { formatDate, formatDateTime } from '../../utils/util'

const PAGE_SIZE = 10

const SHORTCUTS = [
  { text: '周边门票', image: '/assets/home/surrounding.svg' },
  { text: '一日游', image: '/assets/home/daytour.svg' },
  { text: '酒店', image: '/assets/home/hotel.svg' },
  { text: '周边交通', image: '/assets/home/bus.svg' },
]

function getCurrentDateStr() {
  const d = new Date()
  return formatDateTime(d).split(' ')[0]
}

Page({
  data: {
    shortcuts: SHORTCUTS,
    currentDate: getCurrentDateStr(),
    weatherTemp: '--',
    weatherText: '天气数据更新中',
    noticeText: '锦州北普陀山景区欢迎您！',
    activeTab: 'attractions',
    // 骨架屏
    skeletonAttractions: true,
    skeletonVideo: true,
    skeletonNews: true,
    // 导航栏
    showNavBar: false,
    navBarHeight: 0,
    // 景点
    attractionList: [] as any[],
    attractionListLeft: [] as any[],
    attractionListRight: [] as any[],
    attractionPage: 1,
    attractionHasMore: true,
    attractionLoadingMore: false,
    // 视频
    videoList: [] as any[],
    videoPage: 1,
    videoHasMore: true,
    videoLoadingMore: false,
    // 新闻
    newsList: [] as any[],
    newsPage: 1,
    newsHasMore: true,
    newsLoadingMore: false,
  },

  onLoad() {
    // 从全局读取导航栏高度
    const navBarHeight = getApp<IAppOption>().globalData?.navBarHeight ?? 0
    this.setData({ navBarHeight })

    this.fetchWeather()
    this.fetchAttractions(1)
    this.fetchVideos(1)
    this.fetchNews(1)
  },

  onPageScroll({ scrollTop }: { scrollTop: number }) {
    const showNavBar = scrollTop > 10
    if (showNavBar !== this.data.showNavBar) {
      this.setData({ showNavBar })
    }
  },

  onReachBottom() {
    const { activeTab } = this.data
    if (activeTab === 'attractions') this.loadMoreAttractions()
    else if (activeTab === 'video') this.loadMoreVideos()
    else if (activeTab === 'news') this.loadMoreNews()
  },

  onPullDownRefresh() {
    this.setData({
      currentDate: getCurrentDateStr(),
      attractionList: [], attractionListLeft: [], attractionListRight: [],
      attractionPage: 1, attractionHasMore: true,
      videoList: [], videoPage: 1, videoHasMore: true,
      newsList: [], newsPage: 1, newsHasMore: true,
      skeletonAttractions: true, skeletonVideo: true, skeletonNews: true,
    })
    Promise.allSettled([
      this.fetchWeather(),
      this.fetchAttractions(1),
      this.fetchVideos(1),
      this.fetchNews(1),
    ]).finally(() => wx.stopPullDownRefresh())
  },

  onTabsChange(e: any) {
    this.setData({ activeTab: e?.detail?.value || 'attractions' })
  },

  onMapBtnTap() {
    wx.navigateTo({ url: '/pages/map/index?type=attraction' })
  },

  onShortcutTap(e: any) {
    const index = e?.detail?.index ?? e?.currentTarget?.dataset?.index
    const shortcut = SHORTCUTS[index]
    if (!shortcut) return
    if (shortcut.text === '周边门票') {
      wx.navigateToMiniProgram({
        shortLink: '#小程序://携程旅行订酒店机票火车汽车门票/CfOfYOteSpzGRAc',
        fail: () => {
          Toast({ context: this, selector: '#t-toast', message: '跳转失败', theme: 'error' })
        },
      })
    } else if (shortcut.text === '一日游') {
      wx.navigateToMiniProgram({
        shortLink: '#小程序://携程旅行订酒店机票火车汽车门票/NvLX9q74cPQSkiJ',
        fail: () => {
          Toast({ context: this, selector: '#t-toast', message: '跳转失败', theme: 'error' })
        },
      })
    } else if (shortcut.text === '酒店') {
      wx.navigateToMiniProgram({
        shortLink: '#小程序://携程旅行订酒店机票火车汽车门票/5aYJ4dug8H3Rsqt',
        fail: () => {
          Toast({ context: this, selector: '#t-toast', message: '跳转失败', theme: 'error' })
        },
      })
    } else if (shortcut.text === '周边交通') {
      wx.navigateToMiniProgram({
        appId: 'wx7643d5f831302ab0',
        fail: () => {
          Toast({ context: this, selector: '#t-toast', message: '跳转失败', theme: 'error' })
        },
      })
    }
  },

  async fetchWeather() {
    try {
      const res = await listWeatherByPage({ current: 1, pageSize: 1, sortField: 'weatherTime', sortOrder: 'descend' })
      const weather = res?.data?.records?.[0]
      if (!weather) return
      const weatherTemp = weather.temp != null ? `${weather.temp}°` : '--'
      const parts: string[] = []
      if (weather.humidity != null) parts.push(`湿度 ${weather.humidity}%`)
      if (weather.windSpeed != null) parts.push(`风速 ${weather.windSpeed}m/s`)
      const weatherText = parts.length > 0 ? parts.join(' · ') : '实时天气'
      this.setData({ weatherTemp, weatherText })
    } catch {}
  },

  async fetchAttractions(page: number) {
    try {
      const res = await listAttractionsByPage({ current: page, pageSize: PAGE_SIZE, sortField: 'updateTime', sortOrder: 'descend' })
      const records = res?.data?.records || []
      const total = res?.data?.total || 0
      const newItems = records.map((item: any, i: number) => ({
        id: item.id || `a-${page}-${i}`,
        name: item.attractionsName || '未命名景点',
        description: item.attractionsDescription || '',
        image: item.attractionsImage || '',
        tags: (item.types || []).map((t: any) => t?.typeName).filter(Boolean),
      }))
      const attractionList = page === 1 ? newItems : [...this.data.attractionList, ...newItems]
      const attractionListLeft = attractionList.filter((_: any, i: number) => i % 2 === 0)
      const attractionListRight = attractionList.filter((_: any, i: number) => i % 2 === 1)
      this.setData({
        attractionList, attractionListLeft, attractionListRight,
        attractionPage: page,
        attractionHasMore: attractionList.length < total,
        skeletonAttractions: false,
        attractionLoadingMore: false,
      })
    } catch {
      this.setData({ skeletonAttractions: false, attractionLoadingMore: false })
      if (page === 1) Toast({ context: this, selector: '#t-toast', message: '景点数据加载失败', theme: 'error' })
    }
  },

  loadMoreAttractions() {
    const { attractionHasMore, attractionLoadingMore, attractionPage } = this.data
    if (!attractionHasMore || attractionLoadingMore) return
    this.setData({ attractionLoadingMore: true })
    this.fetchAttractions(attractionPage + 1)
  },

  async fetchVideos(page: number) {
    try {
      const res = await listVideosByPage({ current: page, pageSize: PAGE_SIZE, sortField: 'updateTime', sortOrder: 'descend' })
      const records = res?.data?.records || []
      const total = res?.data?.total || 0
      const newItems = records.map((item: any, i: number) => ({
        id: item.id || `v-${page}-${i}`,
        title: item.videoTitle || '未命名视频',
        description: item.videoDescription || '',
        videoUrl: item.videoUrl || '',
        publishTime: formatDate(item.updateTime || item.createTime),
      }))
      const videoList = page === 1 ? newItems : [...this.data.videoList, ...newItems]
      this.setData({
        videoList,
        videoPage: page,
        videoHasMore: videoList.length < total,
        skeletonVideo: false,
        videoLoadingMore: false,
      })
    } catch {
      this.setData({ skeletonVideo: false, videoLoadingMore: false })
      if (page === 1) Toast({ context: this, selector: '#t-toast', message: '视频数据加载失败', theme: 'error' })
    }
  },

  loadMoreVideos() {
    const { videoHasMore, videoLoadingMore, videoPage } = this.data
    if (!videoHasMore || videoLoadingMore) return
    this.setData({ videoLoadingMore: true })
    this.fetchVideos(videoPage + 1)
  },

  async fetchNews(page: number) {
    try {
      const res = await listWxPlatformsByPage({ current: page, pageSize: PAGE_SIZE, sortField: 'updateTime', sortOrder: 'descend' })
      const records = res?.data?.records || []
      const total = res?.data?.total || 0
      const newItems = records.map((item: any, i: number) => ({
        id: item.id || `n-${page}-${i}`,
        title: item.wxTitle || '未命名动态',
        description: item.wxDescription || '',
        url: item.wxUrl || '',
        publishTime: formatDate(item.updateTime || item.createTime),
      }))
      const newsList = page === 1 ? newItems : [...this.data.newsList, ...newItems]
      this.setData({
        newsList,
        newsPage: page,
        newsHasMore: newsList.length < total,
        skeletonNews: false,
        newsLoadingMore: false,
      })
    } catch {
      this.setData({ skeletonNews: false, newsLoadingMore: false })
      if (page === 1) Toast({ context: this, selector: '#t-toast', message: '新闻数据加载失败', theme: 'error' })
    }
  },

  onAttractionTap(e: any) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/workbench/attraction-detail/index?id=' + id })
  },

  onNewsTap(e: any) {
    const { url } = e.currentTarget.dataset
    if (!url) return
    wx.openOfficialAccountArticle({
      url,
      fail: () => {
        Toast({ context: this, selector: '#t-toast', message: '文章打开失败', theme: 'error' })
      },
    })
  },

  loadMoreNews() {
    const { newsHasMore, newsLoadingMore, newsPage } = this.data
    if (!newsHasMore || newsLoadingMore) return
    this.setData({ newsLoadingMore: true })
    this.fetchNews(newsPage + 1)
  },
  onShareAppMessage() {
    return {
      title: '锦州北普陀山景区',
      path: '/pages/home/index'
    };
  },
})