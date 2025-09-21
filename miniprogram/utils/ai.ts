import TextEncoding from 'text-encoding-shim';

const domain = 'https://scenic.suki.icu'

// 消息类型定义
export interface Message {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
}

// 流式消息类型定义
export interface StreamMessage {
  type: 'delta' | 'done' | 'error';
  content?: string;
}

// 流式消息监听器类型
export type StreamMessageListener = (message: StreamMessage) => void;

// 数据解码监听器类型
type DataListener = (arrayBuffer: ArrayBuffer) => void;

// AI聊天API请求
export function chatRequest(
  message: string, 
  appId?: string,
  options?: {
    success?: () => void;
    fail?: () => void;
  }
): WechatMiniprogram.RequestTask {
  return wx.request({
    url: `${domain}/api/ai/chat`,
    header: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    enableChunked: true,
    data: {
      message: message,
      appId: appId,
      stream: true
    },
    success: options && options.success ? options.success : undefined,
    fail: options && options.fail ? options.fail : undefined
  });
}

// 创建流数据解码器
export function createStreamDecoder(onMessage: StreamMessageListener): DataListener {

  let buffer = ''

  return function (arraybuffer: ArrayBuffer) {
    try {
      const uint8Array = new Uint8Array(arraybuffer)
      const decoder = new TextEncoding.TextDecoder('utf-8')
      const chunk = decoder.decode(uint8Array)
      
      // 将新数据添加到缓冲区
      buffer += chunk
      
      // 按行分割数据
      const lines = buffer.split('\n')
      
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || ''
      
      // 处理完整的行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data:')) {
          // 提取data:后面的内容
          const content = trimmedLine.substring(5).trim()
          
          // 检查是否是结束信号
          if (content === '[DONE]' || content === 'DONE') {
            try {
              onMessage({ type: 'done' })
            } catch (fnErr) {
              console.error('Error calling onMessage for done signal:', fnErr)
            }
          } else {
            try {
              onMessage({ type: 'delta', content: content })
            } catch (fnErr) {
              console.error('Error calling onMessage in decoder:', fnErr)
            }
          }
        } else if (trimmedLine === '') {
          // 空行通常表示事件结束
          continue
        }
      }
    } catch (err) {
      console.log('解码失败:', err)
      try {
        onMessage({ type: 'error', content: '数据解码失败' })
      } catch (fnErr) {
        console.error('Error calling onMessage in error handler:', fnErr)
      }
    }
  }
}

export function chat(
  message: string,
  onMessage: StreamMessageListener,
  appId?: string
): WechatMiniprogram.RequestTask {

  // 创建解码器
  const decoder = createStreamDecoder(onMessage);
  
  // 复用 chatRequest 函数
  const requestTask = chatRequest(message, appId, {
    success: () => {
      // 请求成功完成时发送done信号
      try {
        onMessage({ type: 'done' });
      } catch (err) {
        console.error('Error calling onMessage in success:', err);
      }
    },
    fail: () => {
      // 请求失败时发送error信号
      try {
        onMessage({ type: 'error', content: '网络请求失败' });
      } catch (err) {
        console.error('Error calling onMessage in fail:', err);
      }
    }
  });

  // 监听数据块
  requestTask.onChunkReceived((res) => {
    decoder(res.data);
  });
  
  return requestTask;
}

// 消息处理器类
export class MessageHandler {
  private messages: Message[] = [];
  private isLoading: boolean = false;
  private streamingMessageIndex: number = -1;
  private currentRequestTask: WechatMiniprogram.RequestTask | null = null;
  
  // 回调函数
  private onMessagesUpdate?: (messages: Message[]) => void;
  private onLoadingChange?: (isLoading: boolean) => void;
  private onScrollToBottom?: () => void;
  private onStreamingIndexChange?: (index: number) => void;

  constructor(
    initialMessages: Message[] = [],
    callbacks: {
      onMessagesUpdate?: (messages: Message[]) => void;
      onLoadingChange?: (isLoading: boolean) => void;
      onScrollToBottom?: () => void;
      onStreamingIndexChange?: (index: number) => void;
    } = {}
  ) {
    this.messages = initialMessages.slice();
    this.onMessagesUpdate = callbacks.onMessagesUpdate;
    this.onLoadingChange = callbacks.onLoadingChange;
    this.onScrollToBottom = callbacks.onScrollToBottom;
    this.onStreamingIndexChange = callbacks.onStreamingIndexChange;
  }

  // 获取当前消息列表
  getMessages(): Message[] {
    return [...this.messages];
  }

  // 获取加载状态
  getIsLoading(): boolean {
    return this.isLoading;
  }

  // 添加用户消息并准备接收AI回复
  addUserMessage(content: string): number {
    const userMessage: Message = { type: 'user', content, suggestions: [] };
    const botMessage: Message = { type: 'bot', content: '', suggestions: [] };
    
    this.messages.push(userMessage, botMessage);
    this.streamingMessageIndex = this.messages.length - 1;
    this.isLoading = true;
    
    this.notifyUpdate();
    if (this.onStreamingIndexChange) {
      this.onStreamingIndexChange(this.streamingMessageIndex);
    }
    if (this.onScrollToBottom) {
      this.onScrollToBottom();
    }
    
    return this.streamingMessageIndex;
  }

  // 追加消息内容（用于流式输出）
  appendMessageContent(content: string, messageIndex?: number): void {
    const index = messageIndex !== undefined ? messageIndex : this.streamingMessageIndex;
    if (index === -1 || index >= this.messages.length) return;

    if (content === null || content === undefined || content.trim() === '') {
      this.messages[index].content += '\n';
    } else {
      this.messages[index].content += content;
    }
    
    if (this.onMessagesUpdate) {
      this.onMessagesUpdate(this.getMessages());
    }
    if (this.onScrollToBottom) {
      this.onScrollToBottom();
    }
  }

  // 处理错误
  handleError(errorMessage: string, messageIndex?: number): void {
    const index = messageIndex !== undefined ? messageIndex : this.streamingMessageIndex;
    if (index >= 0 && index < this.messages.length) {
      this.messages[index].content = errorMessage;
      this.messages[index].suggestions = ['重新发送'];
    }
    
    this.finishStreaming();
  }

  // 完成流式传输
  finishStreaming(): void {
    this.isLoading = false;
    this.streamingMessageIndex = -1;
    this.currentRequestTask = null;
    
    this.notifyUpdate();
    if (this.onStreamingIndexChange) {
      this.onStreamingIndexChange(this.streamingMessageIndex);
    }
    if (this.onScrollToBottom) {
      this.onScrollToBottom();
    }
  }

  // 设置当前请求任务
  setCurrentRequestTask(task: WechatMiniprogram.RequestTask | null): void {
    this.currentRequestTask = task;
  }

  // 获取当前请求任务
  getCurrentRequestTask(): WechatMiniprogram.RequestTask | null {
    return this.currentRequestTask;
  }

  // 获取最后一条用户消息
  getLastUserMessage(): Message | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].type === 'user') {
        return this.messages[i];
      }
    }
    return null;
  }

  // 通知更新
  private notifyUpdate(): void {
    if (this.onMessagesUpdate) {
      this.onMessagesUpdate(this.getMessages());
    }
    if (this.onLoadingChange) {
      this.onLoadingChange(this.isLoading);
    }
  }

  // 重置状态
  reset(): void {
    this.isLoading = false;
    this.streamingMessageIndex = -1;
    this.currentRequestTask = null;
  }
}