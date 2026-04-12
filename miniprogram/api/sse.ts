const BASE_URL = 'https://scenic.moenya.net'

/** ArrayBuffer 转 UTF-8 字符串（兼容不支持 TextDecoder 的运行时） */
function ab2str(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i])
  }
  try {
    return decodeURIComponent(escape(str))
  } catch {
    return str
  }
}

export type StreamAction =
  | { type: 'content'; text: string }
  | { type: 'reasoning'; text: string }
  | { type: 'finish'; reason: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

function parseChunk(data: string): StreamAction[] {
  const actions: StreamAction[] = []

  if (data === '[DONE]') {
    actions.push({ type: 'done' })
    return actions
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(data)
  } catch {
    if (data.trim()) {
      actions.push({ type: 'content', text: data })
    }
    return actions
  }

  if (!parsed || typeof parsed !== 'object') return actions
  const obj = parsed as Record<string, unknown>

  if (obj.error && typeof obj.error === 'object') {
    const err = obj.error as Record<string, unknown>
    const msg = typeof err.message === 'string' ? err.message : '请求出错'
    actions.push({ type: 'error', message: msg })
    return actions
  }

  const choices = obj.choices
  if (!Array.isArray(choices) || !choices[0]) return actions

  const choice = choices[0] as Record<string, unknown>
  const delta = choice.delta as Record<string, unknown> | undefined
  const finishReason = choice.finish_reason

  if (delta) {
    if (typeof delta.content === 'string' && delta.content) {
      actions.push({ type: 'content', text: delta.content })
    }
    if (typeof delta.reasoning_content === 'string' && delta.reasoning_content) {
      actions.push({ type: 'reasoning', text: delta.reasoning_content })
    }
  }

  if (finishReason && typeof finishReason === 'string') {
    actions.push({ type: 'finish', reason: finishReason })
  }

  return actions
}

function parseSseBlock(raw: string): string[] {
  const dataLines: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }
  return dataLines
}

export type StreamChatCallbacks = {
  onContent: (text: string) => void
  onSessionId: (sessionId: string) => void
  onDone: () => void
  onError: (message: string) => void
}

/**
 * 微信小程序 SSE 流式请求
 * 使用 wx.request enableChunked 解析流式返回的 AI 对话
 */
export function streamAiChatMp(
  body: { message: string; sessionId?: string },
  callbacks: StreamChatCallbacks
): WechatMiniprogram.RequestTask {
  const token = wx.getStorageSync('token') as string | undefined
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let buffer = ''
  let hasStreamContent = false // 是否收到过 SSE data 行
  let errorHandled = false // 是否已处理过错误，避免重复回调

  // enableChunked 和 onChunkReceived 是微信小程序扩展 API，类型定义暂未覆盖
  const requestTask = (wx.request as any)({
    url: `${BASE_URL}/api/ai/chat`,
    method: 'POST',
    header: headers,
    data: JSON.stringify(body),
    enableChunked: true,
    responseType: 'text',
    success(res: any) {
      if (errorHandled) return

      const statusCode = res.statusCode as number
      if (statusCode !== 200) {
        // 非 SSE 流响应，解析错误信息
        let msg = `请求失败 (${statusCode})`
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (body?.message) msg = body.message
        } catch {}
        if (statusCode === 401) {
          wx.removeStorageSync('token')
          wx.navigateTo({ url: '/pages/auth/login/index' })
        }
        callbacks.onError(msg)
        return
      }

      // flush 剩余 buffer（SSE 流可能还有未处理的内容）
      const remaining = buffer.trim()
      buffer = ''

      if (!hasStreamContent && remaining) {
        // 没有收到任何 SSE data 行，尝试把整个响应解析为 JSON 错误
        try {
          const json = JSON.parse(remaining)
          const msg = json?.message || json?.msg || `服务端错误`
          const code = json?.code as number | undefined
          if (code === 401) {
            wx.removeStorageSync('token')
            wx.navigateTo({ url: '/pages/auth/login/index' })
          }
          callbacks.onError(msg)
          return
        } catch {
          callbacks.onError(remaining)
          return
        }
      }

      if (remaining) {
        for (const data of parseSseBlock(remaining)) {
          for (const action of parseChunk(data)) {
            if (action.type === 'content') callbacks.onContent(action.text)
            else if (action.type === 'error') callbacks.onError(action.message)
          }
        }
      }

      // 从响应头获取 session id
      const respHeaders = res.header as Record<string, string>
      const sid = respHeaders['x-ai-session-id'] || respHeaders['X-Ai-Session-Id']
      if (sid) {
        callbacks.onSessionId(sid)
      }

      callbacks.onDone()
    },
    fail(err: any) {
      callbacks.onError(err.errMsg || '请求失败')
    },
  })

  ;(requestTask as any).onChunkReceived((chunk: { data: ArrayBuffer }) => {
    if (errorHandled) return

    const text = ab2str(chunk.data)
    buffer += text

    // SSE 以双换行分隔 event block
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      if (!block.trim()) continue

      // 先尝试整块解析为业务 JSON 错误（HTTP 200 但 code 非正常，如 code: 401）
      try {
        const json = JSON.parse(block.trim())
        if (json?.code && json.code !== 200) {
          const msg = json?.message || json?.msg || '服务端错误'
          if (json.code === 401) {
            wx.removeStorageSync('token')
            wx.navigateTo({ url: '/pages/auth/login/index' })
          }
          errorHandled = true
          callbacks.onError(msg)
          return
        }
      } catch {
        // 不是纯 JSON block，按正常 SSE 解析
      }

      // 确认是 SSE 内容才标记
      hasStreamContent = true
      for (const data of parseSseBlock(block)) {
        for (const action of parseChunk(data)) {
          if (action.type === 'content') callbacks.onContent(action.text)
          else if (action.type === 'error') callbacks.onError(action.message)
        }
      }
    }
  })

  return requestTask
}