// pages/guide/index.ts
import { streamAiChatMp } from '../../api/sse'
import { listSessions, listMessages, deleteSession } from '../../api/controller/ai-chat-controller/ai-chat-controller'
import { AiChatMessageRole } from '../../api/models/aiChatMessageRole'
import { formatDate } from '../../utils/util'

const BOT_AVATAR = 'https://tdesign.gtimg.com/site/chat-avatar.png'
const DEFAULT_USER_AVATAR = 'https://tdesign.gtimg.com/site/chat-avatar.png'

let uniqueId = 0
function genId() {
  uniqueId += 1
  return `guide-${uniqueId}`
}

function makeWelcomeMessage() {
  return {
    avatar: BOT_AVATAR,
    role: 'assistant',
    status: 'complete',
    content: [
      {
        type: 'text',
        data: '你好！我是智慧导览助手，可以为你介绍景区景点、路线规划、游玩攻略等，有什么需要帮助的吗？',
      },
    ],
    chatId: genId(),
  }
}

Page({
  data: {
    contentHeight: '100vh',
    navHeight: 0,
    chatList: [] as any[],
    value: '',
    loading: false,
    disabled: false,
    sessionId: undefined as string | undefined,
    renderPresets: [{ name: 'send', type: 'icon' }],
    activePopoverId: '',
    sessions: [] as any[],
    sessionsLoading: false,
  },

  _requestTask: null as WechatMiniprogram.RequestTask | null,

  onLoad() {
    this.setData({ chatList: [makeWelcomeMessage()] })
  },

  onShow() {
    // 每次显示时预加载会话列表（静默）
    this.fetchSessions()
  },

  onUnload() {
    this._requestTask?.abort()
    this._requestTask = null
  },

  // 会话列表

  fetchSessions() {
    this.setData({ sessionsLoading: true })
    listSessions({
      current: 1,
      pageSize: 50,
      sortField: 'updateTime',
      sortOrder: 'descend',
    })
      .then((res: any) => {
        const records = res?.data?.records || []
        const sessions = records.map((s: any) => ({
          ...s,
          _timeLabel: s.updateTime ? formatDate(s.updateTime) : '',
        }))
        this.setData({ sessions, sessionsLoading: false })
      })
      .catch(() => {
        this.setData({ sessionsLoading: false })
      })
  },

  openDrawer() {
    this.fetchSessions()
    this.setData({ drawerVisible: true })
  },

  closeDrawer() {
    this.setData({ drawerVisible: false })
  },

  onDrawerVisibleChange(e: WechatMiniprogram.CustomEvent) {
    if (!e.detail.visible) {
      this.setData({ drawerVisible: false })
    }
  },

  onSelectSession(e: WechatMiniprogram.CustomEvent) {
    const sid = e.currentTarget.dataset.sid as string
    if (!sid || sid === this.data.sessionId) {
      this.setData({ drawerVisible: false })
      return
    }

    // 终止进行中的请求
    this._requestTask?.abort()
    this._requestTask = null

    this.setData({
      sessionId: sid,
      loading: false,
      disabled: false,
      value: '',
      drawerVisible: false,
      chatList: [],
    })

    // 加载历史消息
    this.loadSessionMessages(sid)
  },

  loadSessionMessages(sid: string) {
    listMessages({ sessionId: sid })
      .then((res: any) => {
        const list = res?.data || []
        const mapped = list
          .filter((m: any) => m.role)
          .map((m: any) => ({
            chatId: m.id || genId(),
            avatar: m.role === AiChatMessageRole.ASSISTANT ? BOT_AVATAR : DEFAULT_USER_AVATAR,
            role: m.role === AiChatMessageRole.USER ? 'user' : 'assistant',
            status: 'complete',
            content: [{ type: 'markdown', data: m.content || '' }],
          }))
          .reverse()
        this.setData({ chatList: mapped.length > 0 ? mapped : [makeWelcomeMessage()] })
      })
      .catch(() => {
        wx.showToast({ title: '加载历史失败', icon: 'none' })
        this.setData({ chatList: [makeWelcomeMessage()] })
      })
  },

  handleNew() {
    this._requestTask?.abort()
    this._requestTask = null
    this.setData({
      sessionId: undefined,
      chatList: [makeWelcomeMessage()],
      value: '',
      loading: false,
      disabled: false,
    })
  },

  handleNewFromDrawer() {
    this.handleNew()
    this.setData({ drawerVisible: false })
  },

  onDeleteSession(e: WechatMiniprogram.CustomEvent) {
    const sid = e.currentTarget.dataset.sid as string
    if (!sid) return

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个会话吗？',
      success: (res) => {
        if (!res.confirm) return
        deleteSession({ id: sid })
          .then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            // 如果删的是当前会话，重置
            if (sid === this.data.sessionId) {
              this.handleNew()
            }
            this.fetchSessions()
          })
          .catch((err: any) => {
            wx.showToast({ title: err?.message || '删除失败', icon: 'none' })
          })
      },
    })
  },

  // 发送消息
  onSend(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.detail
    if (!value || value.trim() === '' || this.data.loading) return

    const userMessage = {
      role: 'user',
      avatar: DEFAULT_USER_AVATAR,
      content: [{ type: 'text', data: value.trim() }],
      chatId: genId(),
    }

    this.setData({
      chatList: [userMessage, ...this.data.chatList],
      value: '',
    })

    this.startStream(value.trim())
  },

  startStream(text: string) {
    this.setData({ loading: true, disabled: true })

    const asstMessage = {
      avatar: BOT_AVATAR,
      role: 'assistant',
      status: 'pending',
      content: [{ type: 'markdown', data: '' }],
      chatId: genId(),
    }

    this.setData({
      chatList: [asstMessage, ...this.data.chatList],
    })

    const sessionId = this.data.sessionId || undefined

    this._requestTask = streamAiChatMp(
      { message: text, sessionId },
      {
        onSessionId: (sid: string) => {
          this.setData({ sessionId: sid })
        },
        onContent: (chunk: string) => {
          this.setData({
            'chatList[0].status': 'streaming',
            'chatList[0].content[0].data': this.data.chatList[0].content[0].data + chunk,
          })
        },
        onDone: () => {
          this._requestTask = null
          this.setData({
            'chatList[0].status': 'complete',
            loading: false,
            disabled: false,
          })
        },
        onError: (msg: string) => {
          this._requestTask = null
          this.setData({
            'chatList[0].status': 'error',
            'chatList[0].content[0].data': msg || '请求出错，请稍后重试',
            loading: false,
            disabled: false,
          })
          wx.showToast({ title: msg || '请求出错', icon: 'none', duration: 2000 })
        },
      },
    )
  },

  onStop() {
    this._requestTask?.abort()
    this._requestTask = null
    if (this.data.chatList[0]?.status !== 'complete') {
      this.setData({ 'chatList[0].status': 'complete' })
    }
    this.setData({ loading: false, disabled: false })
  },

  showPopover(e: WechatMiniprogram.CustomEvent) {
    const { id, longPressPosition } = e.detail
    let role = ''
    this.data.chatList.forEach((item: any) => {
      if (item.chatId === id) {
        role = item.role
      }
    })
    if (role !== 'user') return
    this.setData({ activePopoverId: id, longPressPosition })
  },
})