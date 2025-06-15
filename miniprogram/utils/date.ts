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