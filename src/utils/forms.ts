import dayjs from 'dayjs'

export function toDateInputValue(value: string | null | undefined): string {
  return value ? dayjs(value).format('YYYY-MM-DD') : ''
}

export function toDateTimeInputValue(value: string | null | undefined): string {
  return value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : ''
}

export function localDateStart(value: string): string {
  return new Date(`${value}T00:00`).toISOString()
}

export function localDateEnd(value: string): string {
  return new Date(`${value}T23:59:59.999`).toISOString()
}

export function localDateTime(value: string): string {
  return value ? new Date(value).toISOString() : ''
}

export function validateOptionalUrl(value: string, label: string): string | null {
  if (!value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error()
    return null
  } catch {
    return `${label} must be a valid http:// or https:// URL.`
  }
}
