import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import { TaskMentionCreatedPayload, WS_EVENTS } from 'src/websocket/events'

const SOCKET_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5002'
    : 'https://api.codewithmauricio.tech'

type UseMentionsRealtimeOptions = {
  onMentionCreated?: (payload: TaskMentionCreatedPayload) => void
  showToast?: boolean
}

export const useMentionsRealtime = (options?: UseMentionsRealtimeOptions) => {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const socket = io(`${SOCKET_BASE_URL}/realtime`, {
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(WS_EVENTS.REGISTER_USER, { userId: user.id })
    })

    socket.on(WS_EVENTS.TASK_MENTION_CREATED, (payload: TaskMentionCreatedPayload) => {
      if (options?.showToast !== false) {
        toast('Te mencionaron en un comentario')
      }

      options?.onMentionCreated?.(payload)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('task-mention-created', { detail: payload }))
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?.id, options])

  return {
    socket: socketRef.current,
  }
}

export default useMentionsRealtime
