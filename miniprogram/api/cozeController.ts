import TextEncoding from 'text-encoding-shim';

const domain = 'https://api.coze.cn'
const Authorization = "Bearer pat_GIB5imbrxtNLHmC5JiAJI2Ph0ew63yTyBJlhPJM22BuT1AMnO8LorVwEqVSOmcFr"

// Coze聊天生成
function ApiChat(params: any) {
  return wx.request({
    url: `${domain}/v3/chat`,
    header: {
      "Authorization": Authorization,
      "Content-Type": "application/json"
    },
    method: 'POST',
    enableChunked: true,
    data: {
      ...params,
      stream: true,
    }
  })
}

type Listener = (arrayBuffer: ArrayBuffer) => void

function decodeStream(fn: (messages: any) => void): Listener {
  let buffer = ''
  let currentEvent = ''

  function processBuffer() {
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // 保留最后一个不完整的行
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('event:')) {
        currentEvent = trimmedLine.substring(6).trim()
      } else if (trimmedLine.startsWith('data:')) {
        const data = trimmedLine.substring(5).trim()
        
        if (data === '[DONE]') {
          fn({ type: 'done', event_type: currentEvent })
          return
        }
        
        if (data === '') {
          continue
        }
        
        try {
          const message = JSON.parse(data)
          // 根据事件类型处理消息
          fn({
            ...message,
            event_type: currentEvent
          })
        } catch (err) {
          console.log('解析消息失败:', data, err)
        }
      } else if (trimmedLine === '') {
        // 空行表示一个完整的 SSE 消息结束
        currentEvent = ''
      }
    }
  }
  
  return function (arraybuffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(arraybuffer)
    const chunk = new TextEncoding.TextDecoder('utf-8').decode(uint8Array)
    buffer += chunk
    processBuffer()
  }
}

// Coze聊天参数接口
interface CozeChatParams {
  bot_id: string;
  additional_messages: {
    content: string;
    content_type: 'text';
    role: 'user';
    type: 'question';
  }[];
  parameters?: Record<string, any>;
  user_id: string;
}

// 便捷的聊天函数
export function sendCozeMessage(
  botId: string,
  message: string,
  userId: string,
  onMessage: (message: any) => void
) {
  const chatParams: CozeChatParams = {
    bot_id: botId,
    additional_messages: [
      {
        content: message,
        content_type: 'text',
        role: 'user',
        type: 'question'
      }
    ],
    parameters: {},
    user_id: userId
  }
  
  const requestTask = ApiChat(chatParams)
  const listener = decodeStream(onMessage)

  requestTask.onChunkReceived((res) => {
    listener(res.data)
  })
  
  return requestTask
}