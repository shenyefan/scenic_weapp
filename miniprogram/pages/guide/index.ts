// pages/guide/index.ts
import { sendCozeMessage } from '../../api/cozeController'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    messages: [
      {
        type: 'bot',
        content: '您好，欢迎来到大芦花风景区，我是您的AI导览小助手，有什么疑问都可以问我哦。',
        suggestions: [
          '门票多少钱',
          '有什么景点推荐',
          '为我规划一天的行程'
        ]
      }
    ],
    inputValue: '',
    scrollTop: 0,
    isLoading: false,
    streamingMessageIndex: -1,
    currentRequestTask: null
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
    const { inputValue, messages, isLoading } = this.data;
    if (!inputValue.trim() || isLoading) return;

    this.addMessageAndSend(inputValue);
  },

  /**
   * 点击建议按钮
   */
  async onSuggestionTap(e: any) {
    const suggestion = e.currentTarget.dataset.suggestion;
    const { messages, isLoading } = this.data;
    
    if (isLoading) return;
    
    // 特殊处理重新发送
    if (suggestion === '重新发送') {
      const lastUserMessage = messages.slice().reverse().find(msg => msg.type === 'user');
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
    const { messages } = this.data;
    
    // 添加用户消息和Bot消息占位符
    const userMessage = { type: 'user', content };
    const botMessage = { type: 'bot', content: '', suggestions: [] };
    
    const newMessages = [...messages, userMessage, botMessage];
    const streamingIndex = newMessages.length - 1;

    this.setData({
      messages: newMessages,
      inputValue: '',
      isLoading: true,
      streamingMessageIndex: streamingIndex
    });

    this.scrollToBottom();

    try {
      const requestTask = sendCozeMessage(
        "7526481233669472292",
        content,
        "12345678",
        (message) => this.handleStreamMessage(message, streamingIndex)
      );
      
      this.setData({ currentRequestTask: requestTask });
      
    } catch (error) {
      console.error('发送消息失败:', error);
      this.handleError(streamingIndex, '抱歉，网络连接异常，请稍后重试。');
      // 确保重置isLoading状态
      this.setData({
        isLoading: false,
        streamingMessageIndex: -1,
        currentRequestTask: null
      });
    }
  },

  /**
   * 处理流式消息
   */
  handleStreamMessage(message: any, streamingIndex?: number) {
    const index = streamingIndex !== undefined ? streamingIndex : this.data.streamingMessageIndex;
    if (index === -1) return;

    try {
      const messages = [...this.data.messages];
      
      // 处理不同的事件类型
      if (message.event === 'conversation.message.delta' || message.event_type === 'conversation.message.delta') {
        // 增量消息内容
        const content = (message.data && message.data.content) || message.content || '';
        messages[index].content += content;
        this.setData({ messages });
        this.scrollToBottom();
        
      } else if (message.event === 'conversation.message.completed' || message.event_type === 'conversation.message.completed') {
        // 消息完成
        if (message.type === 'follow_up' && message.content) {
          // 处理建议消息
          if (!messages[index].suggestions) {
            messages[index].suggestions = [];
          }
          messages[index].suggestions.push(message.content);
        } else {
          // 普通消息完成
          const finalContent = (message.data && message.data.content) || messages[index].content;
          messages[index].content = finalContent;
        }
        
        this.setData({ messages });
        
      } else if (message.event_type === 'conversation.chat.completed' || message.type === 'done' || message.event_type === 'done') {
        this.finishStreaming();
        
      } else if (message.event === 'error' || message.type === 'error') {
        this.handleError(index, '抱歉，处理您的请求时出现了错误，请稍后重试。');
        
      } else if (message.content && message.role === 'assistant') {
        // 其他类型的助手消息
        if (message.type === 'answer') {
          messages[index].content = message.content;
        } else {
          messages[index].content += message.content;
        }
        this.setData({ messages });
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('处理流式消息失败:', error);
      this.handleError(index, '处理消息时出现错误');
    }
  },

  /**
   * 处理错误
   */
  handleError(streamingIndex: number, errorMessage: string) {
    const messages = [...this.data.messages];
    messages[streamingIndex].content = errorMessage;
    messages[streamingIndex].suggestions = ['重新发送'];
    
    this.setData({
      messages,
      isLoading: false,
      streamingMessageIndex: -1,
      currentRequestTask: null
    });
    
    this.scrollToBottom();
  },

  /**
   * 完成流式传输
   */
  finishStreaming() {
    this.setData({
      isLoading: false,
      streamingMessageIndex: -1,
      currentRequestTask: null
    });
    this.scrollToBottom();
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 999999 });
    }, 100);
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    // 页面加载时的初始化
  },

  onUnload() {
    // 页面卸载时取消正在进行的请求
    if (this.data.currentRequestTask) {
      this.data.currentRequestTask.abort();
    }
  }
});