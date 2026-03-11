import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import Icon from 'src/@core/components/icon'
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

type MentionStatus = 'all' | 'read' | 'unread'

const drawerWidth = 420

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

const MentionsBell = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [status, setStatus] = useState<MentionStatus>('unread')
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
      setNotifications(prev =>
        prev.map(item => (item.id === notificationId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)),
      )
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
      console.error('Error marcando todas las notificaciones como leidas:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const goToNotificationsPage = () => {
    setOpen(false)
    router.push('/notifications')
  }

  useEffect(() => {
    if (open) loadNotifications()
  }, [open, loadNotifications])

  useEffect(() => {
    const refresh = () => {
      if (open) {
        loadNotifications()
      } else {
        apiConnector
          .get<NotificationItem[]>('/notifications/me', { status: 'unread' })
          .then(data => setNotifications(data || []))
          .catch(() => null)
      }
    }

    window.addEventListener('mentions-refresh-requested', refresh)

    return () => window.removeEventListener('mentions-refresh-requested', refresh)
  }, [open, loadNotifications])

  useEffect(() => {
    apiConnector
      .get<NotificationItem[]>('/notifications/me', { status: 'unread' })
      .then(data => setNotifications(data || []))
      .catch(() => null)
  }, [])

  return (
    <>
      <IconButton color='inherit' aria-label='notificaciones' onClick={() => setOpen(true)}>
        <Badge
          badgeContent={unreadCount}
          color='error'
          invisible={unreadCount === 0}
          sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, fontSize: '0.65rem' } }}
        >
          <Icon icon='tabler:bell' fontSize='1.5rem' />
        </Badge>
      </IconButton>

      <Drawer anchor='right' open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: drawerWidth }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 4, pb: 2 }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography variant='h6'>Notificaciones</Typography>
              <IconButton size='small' onClick={() => setOpen(false)}>
                <Icon icon='tabler:x' />
              </IconButton>
            </Stack>

            <Stack direction='row' spacing={1} mt={2}>
              <Chip label='No leidas' color={status === 'unread' ? 'primary' : 'default'} onClick={() => setStatus('unread')} />
              <Chip label='Leidas' color={status === 'read' ? 'primary' : 'default'} onClick={() => setStatus('read')} />
              <Chip label='Todas' color={status === 'all' ? 'primary' : 'default'} onClick={() => setStatus('all')} />
            </Stack>

            <Stack direction='row' spacing={2} mt={2}>
              <Button size='small' variant='contained' onClick={markAllAsRead} disabled={markingAll || unreadCount === 0}>
                {markingAll ? 'Marcando...' : 'Marcar todas'}
              </Button>
              <Button size='small' variant='outlined' onClick={loadNotifications} disabled={loading}>
                Actualizar
              </Button>
              <Button size='small' variant='text' onClick={goToNotificationsPage}>
                Ver todas
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={26} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  No tienes notificaciones para este filtro.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.map(item => (
                  <ListItem
                    key={item.id}
                    alignItems='flex-start'
                    sx={{
                      px: 4,
                      py: 2.5,
                      borderBottom: theme => `1px solid ${theme.palette.divider}`,
                      bgcolor: item.isRead ? 'transparent' : 'action.hover',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1}>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {item.title || 'Notificacion'}
                          </Typography>
                          {!item.isRead && (
                            <Button size='small' onClick={() => markNotificationAsRead(item.id)}>
                              Marcar leida
                            </Button>
                          )}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Box sx={{ mt: 0.75, mb: 1 }}>
                            <Chip
                              size='small'
                              label={getTypeLabel(item.type)}
                              color={getTypeColor(item.type)}
                              variant='outlined'
                            />
                          </Box>
                          {item.type === 'mention' && (
                            <Typography variant='caption' display='block' sx={{ mb: 0.75 }}>
                              Tarea: {typeof item.data?.taskName === 'string' ? item.data.taskName : 'Sin tarea'}
                            </Typography>
                          )}
                          <Typography variant='body2' color='text.secondary'>
                            {getNotificationMessage(item)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default MentionsBell
