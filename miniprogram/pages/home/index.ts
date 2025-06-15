import { listAttractionsVoByPage } from '../../api/attractionsController'
import { listPublicizeVideoVoByPage } from '../../api/publicizeVideoController'
import { listPublicizeWxPlatformVoByPage } from '../../api/publicizeWxPlatformController'
import { getWeatherInfo, WeatherData } from '../../utils/weather'
import { getCurrentDateString } from '../../utils/date'
import Notify from '@vant/weapp/notify/notify';

Page({
  data: {
    // 弹窗相关
    show: false,
    popupImg: '',
    // 日期和天气数据
    currentDate: '--月--日',
    weather: {
      temperature: '--',
      text: '--',
    },
    // 列表数据
    attractionList: [],
    videoList: [],
    newsList: [],
    // 分页和加载状态
    loading: false,
    // 景点分页状态
    attractionPage: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 视频分页状态
    videoPage: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 新闻分页状态
    newsPage: {
      current: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initData()
    this.getCurrentDate()
    this.getWeatherInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 防止重复触发
    if (this.data.loading) return
    
    // 根据当前tab判断是否还有更多数据
    let hasMore = false
    switch(this.data.active) {
      case 0:
        hasMore = this.data.attractionPage.hasMore
        break
      case 1:
        hasMore = this.data.videoPage.hasMore
        break
      case 2:
        hasMore = this.data.newsPage.hasMore
        break
    }
    
    // 如果还有更多数据，则自动加载
    if (hasMore) {
      this.loadMore()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 初始化数据
  async initData() {
    await this.getAttractionsList(true)
    await this.getVideoList()
    await this.getNewsList()
  },

  // 获取当前日期
  getCurrentDate() {
    const dateStr = getCurrentDateString()
    this.setData({
      currentDate: dateStr
    })
  },

  // 获取天气信息
  async getWeatherInfo() {
    const weatherData: WeatherData | null = await getWeatherInfo()
    
    if (weatherData) {
      this.setData({
        weather: weatherData
      })
    } else {
      this.showError('获取天气信息失败')
    }
  },

  // Tab切换事件
  onChange(event) {
    const { name } = event.detail
    this.setData({ active: name })
    
    // 根据不同tab加载对应数据
    switch(name) {
      case 0:
        if (this.data.attractionList.length === 0) {
          this.getAttractionsList(true)
        }
        break
      case 1:
        if (this.data.videoList.length === 0) {
          this.getVideoList()
        }
        break
      case 2:
        if (this.data.newsList.length === 0) {
          this.getNewsList()
        }
        break
    }
  },

  // 显示弹窗
  showPopup(e) {
    const { img } = e.currentTarget.dataset
    this.setData({
      show: true,
      popupImg: img
    })
  },

  // 关闭弹窗
  onClose() {
    this.setData({
      show: false,
      popupImg: ''
    })
  },
  
  // 获取景点列表
  async getAttractionsList(refresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const pageInfo = this.data.attractionPage
      const params = {
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
      }
      
      const res = await listAttractionsVoByPage(params)
      
      if (res.code === 200 && res.data) {
        const formattedRecords = this.formatAttractionData(res.data.records)
        const newList = refresh ? formattedRecords : [...this.data.attractionList, ...formattedRecords]
        
        this.setData({
          attractionList: newList,
          'attractionPage.current': refresh ? 2 : pageInfo.current + 1,
          'attractionPage.total': res.data.total,
          'attractionPage.hasMore': newList.length < res.data.total
        })
      } else {
        this.showError('获取景点数据失败')
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
      this.showError('网络请求失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 格式化景点数据
  formatAttractionData(records) {
    return records.map(item => {

      // 处理图片URL
      const image = item.attractionsImg 

      return {
        id: item.id,
        name: item.attractionsName || '未命名景点',
        description: item.attractionsNote || '暂无描述',
        image: image,
        lng: item.attractionsLng,
        lat: item.attractionsLat,
        types: item.attractionsTypes || []
      }
    })
  },
  
  // 显示错误信息
  showError(message) {
    Notify({ type: 'danger', message: message ,safeAreaInsetTop: true });
  },
  
  // 获取视频列表
  async getVideoList(refresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const pageInfo = this.data.videoPage
      const params = {
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
      
      const res = await listPublicizeVideoVoByPage(params)
      
      if (res.code === 200 && res.data) {
        const formattedRecords = this.formatVideoData(res.data.records)
        const newList = refresh ? formattedRecords : [...this.data.videoList, ...formattedRecords]
        
        this.setData({
          videoList: newList,
          'videoPage.current': refresh ? 2 : pageInfo.current + 1,
          'videoPage.total': res.data.total,
          'videoPage.hasMore': newList.length < res.data.total
        })
      } else {
        this.showError('获取视频数据失败')
      }
    } catch (error) {
      console.error('获取视频列表失败:', error)
      this.showError('网络请求失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 格式化视频数据
  formatVideoData(records) {
    return records.map(item => ({
      id: item.id,
      title: item.videoTitle || '未命名视频',
      description: item.videoNote || '暂无描述',
      videoUrl: item.videoUrl,
      createTime: item.createTime,
      user: item.user
    }))
  },
  
  // 获取新闻列表
  async getNewsList(refresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const pageInfo = this.data.newsPage
      const params = {
        current: refresh ? 1 : pageInfo.current,
        pageSize: pageInfo.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
      
      const res = await listPublicizeWxPlatformVoByPage(params)
      
      if (res.code === 200 && res.data) {
        const formattedRecords = this.formatNewsData(res.data.records)
        const newList = refresh ? formattedRecords : [...this.data.newsList, ...formattedRecords]
        
        this.setData({
          newsList: newList,
          'newsPage.current': refresh ? 2 : pageInfo.current + 1,
          'newsPage.total': res.data.total,
          'newsPage.hasMore': newList.length < res.data.total
        })
      } else {
        this.showError('获取新闻数据失败')
      }
    } catch (error) {
      console.error('获取新闻列表失败:', error)
      this.showError('网络请求失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 格式化新闻数据
  formatNewsData(records) {
    return records.map(item => ({
      id: item.id,
      title: item.wxTitle || '未命名新闻',
      summary: item.wxNote || '暂无摘要',
      url: item.wxUrl,
      publishTime: this.formatTime(item.createTime),
      user: item.user
    }))
  },
  
  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  },
  
  // 点击景点项
  onAttractionTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    
    wx.navigateTo({
      url: `/pages/attraction-detail/index?id=${id}`,
      fail: () => {
        this.showError('页面跳转失败')
      }
    })
  },

  // 新闻
  viewNews(e) {
    const { id } = e.currentTarget.dataset
    const newsItem = this.data.newsList.find(item => item.id === id)
    
    if (!newsItem) {
      this.showError('新闻数据无效')
      return
    }
    
    wx.setClipboardData({
      data: newsItem.url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  },

  // 加载更多 - 根据当前tab加载对应数据
  loadMore() {
    switch(this.data.active) {
      case 0:
        if (this.data.attractionPage.hasMore) {
          this.getAttractionsList(false)
        }
        break
      case 1:
        if (this.data.videoPage.hasMore) {
          this.getVideoList(false)
        }
        break
      case 2:
        if (this.data.newsPage.hasMore) {
          this.getNewsList(false)
        }
        break
    }
  },
})