export type NotificationSeverity = 'warning' | 'error' | 'info'

export type NotificationCategory = 'LICENSES' | 'EMPLOYEES'

export type NotificationItem = {
  id: string
  category: NotificationCategory
  title: string
  description: string
  source: string
  timestamp: string
  read: boolean
  severity: NotificationSeverity
}
