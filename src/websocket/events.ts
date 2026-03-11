export const WS_EVENTS = {
  WELCOME: 'welcome',
  REGISTER_USER: 'register_user',
  REGISTERED_USER: 'registered_user',
  TASK_MENTION_CREATED: 'task_mention_created',
} as const

export type TaskMentionCreatedPayload = {
  mentionId: number
  commentId: number
  mentionedByUserId: number
  createdAt?: string
}
