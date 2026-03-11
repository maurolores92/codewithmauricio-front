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
import Icon from 'src/@core/components/icon'
import apiConnector from 'src/services/api.service'

type MentionAuthor = {
  id: number
  name: string
  lastName?: string
  email?: string
}

type MentionComment = {
  id: number
  taskId: number
  content: string
  author?: MentionAuthor
  task?: {
    id: number
    name: string
  }
}

type MentionItem = {
  id: number
  commentId: number
  isRead: boolean
  readAt?: string
  createdAt?: string
  comment?: MentionComment
}

type MentionStatus = 'all' | 'read' | 'unread'

const drawerWidth = 420

const formatAuthor = (author?: MentionAuthor): string => {
  if (!author) return 'Alguien'

  return `${author.name}${author.lastName ? ` ${author.lastName}` : ''}`
}

const MentionsBell = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [status, setStatus] = useState<MentionStatus>('unread')
  const [mentions, setMentions] = useState<MentionItem[]>([])

  const unreadCount = useMemo(() => mentions.filter(item => !item.isRead).length, [mentions])

  const loadMentions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiConnector.get<MentionItem[]>('/comments/mentions/me', { status })
      setMentions(data || [])
    } catch (error) {
      console.error('Error cargando menciones:', error)
    } finally {
      setLoading(false)
    }
  }, [status])

  const markMentionAsRead = async (mentionId: number) => {
    try {
      await apiConnector.put(`/comments/mentions/${mentionId}/read`, {})
      setMentions(prev =>
        prev.map(item => (item.id === mentionId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)),
      )
    } catch (error) {
      console.error('Error marcando mencion como leida:', error)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await apiConnector.put('/comments/mentions/me/read-all', {})
      setMentions(prev => prev.map(item => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })))
    } catch (error) {
      console.error('Error marcando todas como leidas:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  useEffect(() => {
    if (open) loadMentions()
  }, [open, loadMentions])

  useEffect(() => {
    const refresh = () => {
      if (open) {
        loadMentions()
      } else {
        apiConnector
          .get<MentionItem[]>('/comments/mentions/me', { status: 'unread' })
          .then(data => setMentions(data || []))
          .catch(() => null)
      }
    }

    window.addEventListener('mentions-refresh-requested', refresh)

    return () => window.removeEventListener('mentions-refresh-requested', refresh)
  }, [open, loadMentions])

  useEffect(() => {
    apiConnector
      .get<MentionItem[]>('/comments/mentions/me', { status: 'unread' })
      .then(data => setMentions(data || []))
      .catch(() => null)
  }, [])

  return (
    <>
      <IconButton color='inherit' aria-label='menciones' onClick={() => setOpen(true)}>
        <Badge
          badgeContent={unreadCount}
          color='error'
          invisible={unreadCount === 0}
          sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, fontSize: '0.65rem' } }}
        >
          <Icon icon='tabler:at' fontSize='1.5rem' />
        </Badge>
      </IconButton>

      <Drawer anchor='right' open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: drawerWidth }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 4, pb: 2 }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography variant='h6'>Menciones</Typography>
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
              <Button size='small' variant='outlined' onClick={loadMentions} disabled={loading}>
                Actualizar
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={26} />
              </Box>
            ) : mentions.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  No tienes menciones para este filtro.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {mentions.map(item => (
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
                            {formatAuthor(item.comment?.author)} te menciono
                          </Typography>
                          {!item.isRead && (
                            <Button size='small' onClick={() => markMentionAsRead(item.id)}>
                              Marcar leida
                            </Button>
                          )}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant='caption' display='block' sx={{ mt: 0.5, mb: 1 }}>
                            Tarea: {item.comment?.task?.name || `#${item.comment?.taskId || 'N/A'}`}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {item.comment?.content || 'Sin contenido'}
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
