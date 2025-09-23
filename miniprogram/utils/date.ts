/**
 * 获取当前日期字符串
 * @returns 格式化的日期字符串，如 "06月15日"
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${month}月${day}日`
}

/**
 * 格式化ISO时间字符串为友好显示格式
 * @param isoString ISO格式的时间字符串
 * @returns 格式化后的时间字符串，如 "2025-07-11"
 */
export function formatISODate(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化ISO时间字符串为友好显示格式
 * @param isoString ISO格式的时间字符串
 * @returns 格式化后的时间字符串，如 "07月11日 13:24"
 */
export function formatISOTime(isoString: string): string {
  const date = new Date(isoString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${month}月${day}日 ${hours}:${minutes}`
}

/**
 * 格式化ISO时间字符串为详细格式
 * @param isoString ISO格式的时间字符串
 * @returns 格式化后的时间字符串，如 "2025.07.11 13:24:21"
 */
export function formatISOTimeDetailed(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
}