import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import apiConnector from 'src/services/api.service'

type NotificationItem = {
  id: number
  type: string
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: string
  createdAt?: string
}

type NotificationStatus = 'all' | 'read' | 'unread'

const getTypeColor = (type?: string): 'success' | 'info' | 'warning' | 'error' => {
  if (type === 'task_assigned') return 'success'
  if (type === 'task_unassigned') return 'warning'
  if (type === 'mention') return 'info'

  return 'error'
}

const getTypeLabel = (type?: string): string => {
  if (type === 'task_assigned') return 'Asignada'
  if (type === 'task_unassigned') return 'Desasignada'
  if (type === 'mention') return 'Mencion'

  return type || 'General'
}

const getNotificationMessage = (item: NotificationItem): string => {
  if (item.type === 'mention') {
    const mentionContent = typeof item.data?.commentContent === 'string' ? item.data.commentContent : ''

    return mentionContent || item.message || 'Sin contenido'
  }

  return item.message || 'Sin contenido'
}

const canOpenTaskFromNotification = (item: NotificationItem): boolean => {
  return typeof item.data?.boardId === 'number' && typeof item.data?.taskId === 'number'
}

const formatDate = (date?: string): string => {
  if (!date) return ''

  return new Date(date).toLocaleString()
}

const NotificationsView = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [status, setStatus] = useState<NotificationStatus>('unread')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const unreadCount = useMemo(() => notifications.filter(item => !item.isRead).length, [notifications])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiConnector.get<NotificationItem[]>('/notifications/me', { status })
      setNotifications(data || [])
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [status])

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiConnector.put(`/notifications/${notificationId}/read`, {})
      setNotifications(prev => prev.map(item => (item.id === notificationId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)))
    } catch (error) {
      console.error('Error marcando notificacion como leida:', error)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await apiConnector.put('/notifications/me/read-all', {})
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })))
    } catch (error) {
      console.error('Error marcando todas como leidas:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const openNotificationTask = async (item: NotificationItem) => {
    if (!canOpenTaskFromNotification(item)) {
      return
    }

    if (!item.isRead) {
      await markNotificationAsRead(item.id)
    }

    router.push(`/kanban/boards/${item.data?.boardId}?taskId=${item.data?.taskId}`)
  }

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    const refresh = () => {
      loadNotifications()
    }

    window.addEventListener('mentions-refresh-requested', refresh)

    return () => window.removeEventListener('mentions-refresh-requested', refresh)
  }, [loadNotifications])

  return (
    <Card>
      <CardContent>
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2} mb={3}>
          <Box>
            <Typography variant='h5'>Notificaciones</Typography>
            <Typography variant='body2' color='text.secondary'>
              {unreadCount} sin leer
            </Typography>
          </Box>

          <Stack direction='row' spacing={1}>
            <Button size='small' variant='outlined' onClick={loadNotifications} disabled={loading}>
              Actualizar
            </Button>
            <Button size='small' variant='contained' onClick={markAllAsRead} disabled={markingAll || unreadCount === 0}>
              {markingAll ? 'Marcando...' : 'Marcar todas leidas'}
            </Button>
          </Stack>
        </Stack>

        <Stack direction='row' spacing={1} mb={2}>
          <Chip label='No leidas' color={status === 'unread' ? 'primary' : 'default'} onClick={() => setStatus('unread')} />
          <Chip label='Leidas' color={status === 'read' ? 'primary' : 'default'} onClick={() => setStatus('read')} />
          <Chip label='Todas' color={status === 'all' ? 'primary' : 'default'} onClick={() => setStatus('all')} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>
            No hay notificaciones para este filtro.
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Notificacion</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 600 }}>Accion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map(item => (
                  <TableRow key={item.id} sx={{ bgcolor: item.isRead ? 'transparent' : 'action.hover' }}>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {item.title || 'Notificacion'}
                      </Typography>
                      {item.type === 'mention' && (
                        <Typography variant='caption' display='block' sx={{ mt: 0.25 }}>
                          Tarea: {typeof item.data?.taskName === 'string' ? item.data.taskName : 'Sin tarea'}
                        </Typography>
                      )}
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.25 }}>
                        {getNotificationMessage(item)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={getTypeLabel(item.type)}
                        color={getTypeColor(item.type)}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={item.isRead ? 'Leida' : 'No leida'}
                        color={item.isRead ? 'default' : 'primary'}
                        variant={item.isRead ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(item.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Stack direction='row' spacing={1} justifyContent='flex-end'>
                        {canOpenTaskFromNotification(item) && (
                          <Button size='small' variant='text' onClick={() => openNotificationTask(item)}>
                            Abrir tarea
                          </Button>
                        )}
                        {!item.isRead && (
                          <Button size='small' onClick={() => markNotificationAsRead(item.id)}>
                            Marcar leida
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Stack direction='row' justifyContent='flex-end' mt={2}>
          <Button variant='text' onClick={() => router.push('/kanban')}>
            Ir a Kanban
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default NotificationsView
