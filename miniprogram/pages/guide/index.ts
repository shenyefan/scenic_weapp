// pages/guide/index.ts
import { chat } from '../../utils/ai'
import { MessageHandler, Message } from '../../utils/ai'

// 常量定义
const INITIAL_MESSAGE: Message = {
  type: 'bot',
  content: '您好，欢迎来到北普陀山景区，我是您的AI导览小助手，有什么疑问都可以问我哦。',
  suggestions: [
    '门票多少钱',
    '有什么景点推荐',
    '为我规划一天的行程'
  ]
};

const ERROR_MESSAGES = {
  NETWORK_ERROR: '抱歉，网络连接异常，请稍后重试。',
  SEND_FAILED: '发送消息失败:'
} as const;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    messages: [INITIAL_MESSAGE] as Message[],
    inputValue: '',
    scrollTop: 0,
    isLoading: false,
    streamingMessageIndex: -1
  },

  // 消息处理器实例
  messageHandler: null as MessageHandler | null,

  /**
   * 检查是否可以发送消息
   */
  canSendMessage(): boolean {
    return !this.data.isLoading && !!this.messageHandler;
  },

  /**
   * 安全地执行消息处理器操作
   */
  safeExecuteHandler<T>(operation: (handler: MessageHandler) => T): T | null {
    if (!this.messageHandler) {
      console.warn('MessageHandler not initialized');
      return null;
    }
    return operation(this.messageHandler);
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e: any) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  async sendMessage() {
    const { inputValue } = this.data;
    if (!inputValue.trim() || !this.canSendMessage()) return;

    this.addMessageAndSend(inputValue);
  },

  /**
   * 点击建议按钮
   */
  async onSuggestionTap(e: any) {
    const suggestion = e.currentTarget.dataset.suggestion;
    
    if (!this.canSendMessage()) return;
    
    // 特殊处理重新发送
    if (suggestion === '重新发送') {
      const lastUserMessage = this.safeExecuteHandler(handler => handler.getLastUserMessage());
      if (lastUserMessage) {
        this.setData({ inputValue: lastUserMessage.content });
        this.sendMessage();
        return;
      }
    }
    
    this.addMessageAndSend(suggestion);
  },

  /**
   * 添加消息并发送（统一处理逻辑）
   */
  async addMessageAndSend(content: string) {
    const streamingIndex = this.safeExecuteHandler(handler => handler.addUserMessage(content));
    if (streamingIndex === null) return;
    
    // 清空输入框
    this.setData({ inputValue: '' });

    try {
      const requestTask = chat(
        content,
        (message) => {
          if (message.type === 'delta') {
            // 追加消息内容
            this.safeExecuteHandler(handler => handler.appendMessageContent(message.content || '', streamingIndex));
          } else if (message.type === 'done') {
            // 完成流式传输
            this.safeExecuteHandler(handler => handler.finishStreaming());
          } else if (message.type === 'error') {
            // 处理错误
            this.safeExecuteHandler(handler => handler.handleError(message.content || ERROR_MESSAGES.NETWORK_ERROR, streamingIndex));
          }
        }
      );
      
      // 保存请求任务
      this.safeExecuteHandler(handler => handler.setCurrentRequestTask(requestTask));
      
    } catch (error) {
      console.error(ERROR_MESSAGES.SEND_FAILED, error);
      this.safeExecuteHandler(handler => handler.handleError(ERROR_MESSAGES.NETWORK_ERROR, streamingIndex));
    }
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 999999 });
    }, 100);
  },

  /**
   * 初始化消息处理器
   */
  initMessageHandler() {
    this.messageHandler = new MessageHandler([INITIAL_MESSAGE], {
      onMessagesUpdate: (messages) => {
        this.setData({ messages });
      },
      onLoadingChange: (isLoading) => {
        this.setData({ isLoading });
      },
      onScrollToBottom: () => {
        this.scrollToBottom();
      },
      onStreamingIndexChange: (index) => {
        this.setData({ streamingMessageIndex: index });
      }
    });

    // 初始化页面数据
    this.setData({
      messages: this.messageHandler.getMessages(),
      isLoading: this.messageHandler.getIsLoading(),
      streamingMessageIndex: -1
    });
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.initMessageHandler();
  },

  onUnload() {
    // 清理资源
    this.safeExecuteHandler(handler => handler.reset());
    this.messageHandler = null;
  }
});