export const WS_EVENTS = {
  WELCOME: 'welcome',
  REGISTER_USER: 'register_user',
  REGISTERED_USER: 'registered_user',
  NEW_NOTIFICATION: 'new_notification',
  TASK_MENTION_CREATED: 'task_mention_created',
} as const

export type TaskMentionCreatedPayload = {
  mentionId: number
  commentId: number
  mentionedByUserId: number
  createdAt?: string
}

export type RealtimeNotificationPayload = {
  id: number
  type: string
  title: string
  message: string
  createdAt?: string
  data?: Record<string, any>
}
