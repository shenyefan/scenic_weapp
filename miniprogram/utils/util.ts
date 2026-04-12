export function formatDate(t: string | Date) {
  try {
    const d = t instanceof Date ? t : new Date(t)
    if (isNaN(d.getTime())) return String(t)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return '刚刚'
    const days = Math.floor(diff / 86400000)
    if (days === 0) {
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    }
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return `${d.getMonth() + 1}月${d.getDate()}日`
  } catch {
    return String(t)
  }
}

export const formatDateTime = (t: string | Date) => {
  try {
    const d = t instanceof Date ? t : new Date(t)
    if (isNaN(d.getTime())) return String(t)

    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    const second = d.getSeconds()

    return (
      [year, month, day].map(formatNumber).join('/') +
      ' ' +
      [hour, minute, second].map(formatNumber).join(':')
    )
  } catch {
    return String(t)
  }
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}
