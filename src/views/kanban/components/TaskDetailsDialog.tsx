import { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ConditionalRender from 'src/components/ConditionalRender'
import { useAuth } from 'src/hooks/useAuth'
import { Task, TaskComment, User } from '../types'

type TaskDetailsDialogProps = {
  open: boolean
  task: Task | null
  users: User[]
  editName: string
  editDescription: string
  editAssignedUserId?: number | null
  onChangeEditName: (value: string) => void
  onChangeEditDescription: (value: string) => void
  onChangeEditAssignedUserId: (value?: number | null) => void
  onSave: () => Promise<void>
  comments: TaskComment[]
  loadingComments: boolean
  newComment: string
  mentionedUserIds: number[]
  onSelectMentionedUser: (userId: number) => void
  onChangeNewComment: (value: string) => void
  onDeleteComment: (commentId: number) => Promise<void>
  onClose: () => void
  onSubmitComment: () => Promise<void>
}

const getAuthorName = (comment: TaskComment): string => {
  if (!comment.author) return 'Usuario'

  return `${comment.author.name} ${comment.author.lastName || ''}`.trim()
}

const CommentItem = ({
  comment,
  level = 0,
  currentUserId,
  onDeleteComment,
}: {
  comment: TaskComment
  level?: number
  currentUserId?: number
  onDeleteComment: (commentId: number) => Promise<void>
}) => {
  const createdAt = useMemo(() => {
    if (!comment.createdAt) return ''

    return new Date(comment.createdAt).toLocaleString()
  }, [comment.createdAt])

  const canDelete = currentUserId && comment.createdBy === currentUserId && !comment.isDeleted

  return (
    <Box sx={{ pl: level > 0 ? 4 : 0, pt: 2 }}>
      <Stack direction='row' spacing={1.5} alignItems='flex-start'>
        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>{getAuthorName(comment).charAt(0)}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='subtitle2'>{getAuthorName(comment)}</Typography>
            {createdAt && (
              <Typography variant='caption' color='text.secondary'>
                {createdAt}
              </Typography>
            )}
            {canDelete && (
              <Button size='small' color='error' onClick={() => onDeleteComment(comment.id)}>
                Eliminar
              </Button>
            )}
          </Stack>
          <Typography variant='body2' sx={{ mt: 0.5, whiteSpace: 'pre-wrap', fontStyle: comment.isDeleted ? 'italic' : 'normal', color: comment.isDeleted ? 'text.disabled' : 'text.primary' }}>
            {comment.content}
          </Typography>
        </Box>
      </Stack>

      {comment.replies?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              currentUserId={currentUserId}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

const TaskDetailsDialog = ({
  open,
  task,
  users,
  editName,
  editDescription,
  editAssignedUserId,
  onChangeEditName,
  onChangeEditDescription,
  onChangeEditAssignedUserId,
  onSave,
  comments,
  loadingComments,
  newComment,
  mentionedUserIds,
  onSelectMentionedUser,
  onChangeNewComment,
  onDeleteComment,
  onClose,
  onSubmitComment,
}: TaskDetailsDialogProps) => {
  const { user } = useAuth()
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [mentionCursor, setMentionCursor] = useState<number | null>(null)
  const [mentionAnchorEl, setMentionAnchorEl] = useState<HTMLElement | null>(null)

  const mentionCandidates = useMemo(() => {
    const normalizedQuery = mentionQuery.trim().toLowerCase()

    return users.filter(user => {
      const fullName = `${user.name} ${user.lastName || ''}`.trim().toLowerCase()
      if (!normalizedQuery) {
        return true
      }

      return fullName.includes(normalizedQuery)
    })
  }, [mentionQuery, users])

  const selectedMentionUsers = useMemo(() => {
    return users.filter(user => mentionedUserIds.includes(user.id))
  }, [mentionedUserIds, users])

  const resetMentionSelector = () => {
    setMentionQuery('')
    setMentionStart(null)
    setMentionCursor(null)
    setMentionAnchorEl(null)
  }

  const handleCommentChange = (value: string, cursorPosition: number, target: HTMLElement | null) => {
    onChangeNewComment(value)

    const textBeforeCursor = value.slice(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9._-]*)$/)

    if (!mentionMatch) {
      resetMentionSelector()

      return
    }

    setMentionQuery(mentionMatch[1] || '')
    setMentionStart(cursorPosition - mentionMatch[1].length - 1)
    setMentionCursor(cursorPosition)
    setMentionAnchorEl(target)
  }

  const handleSelectMention = (user: User) => {
    if (mentionStart === null || mentionCursor === null) {
      return
    }

    const mentionText = `@${`${user.name} ${user.lastName || ''}`.trim()}`
    const nextComment = `${newComment.slice(0, mentionStart)}${mentionText} ${newComment.slice(mentionCursor)}`
    onChangeNewComment(nextComment)
    onSelectMentionedUser(user.id)
    resetMentionSelector()
  }

  if (!task) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Detalle de tarea</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <TextField label='Título' value={editName} onChange={e => onChangeEditName(e.target.value)} fullWidth />
            <TextField
              label='Descripción'
              value={editDescription}
              onChange={e => onChangeEditDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            <ConditionalRender permission='assign-tasks'>
              <FormControl fullWidth>
                <InputLabel>Asignar (Opcional)</InputLabel>
                <Select
                  label='Asignar (Opcional)'
                  value={editAssignedUserId ?? ''}
                  onChange={e => onChangeEditAssignedUserId(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value=''>Sin asignar</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} {user.lastName || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ConditionalRender>
            <ConditionalRender permission='edit-tasks'>
              <Box display='flex' justifyContent='flex-end'>
                <Button variant='contained' onClick={onSave} disabled={!editName.trim()}>
                  Guardar cambios
                </Button>
              </Box>
            </ConditionalRender>
          </Stack>

          <Divider />

          <Box>
            <Typography variant='h6' sx={{ mb: 1 }}>
              Comentarios
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder='Escribe un comentario...'
              value={newComment}
              onChange={e => {
                const cursorPosition = e.target.selectionStart ?? e.target.value.length
                handleCommentChange(e.target.value, cursorPosition, e.currentTarget)
              }}
            />

            {selectedMentionUsers.length > 0 && (
              <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mt: 1 }}>
                {selectedMentionUsers.map(user => (
                  <Chip
                    key={user.id}
                    size='small'
                    label={`@${`${user.name} ${user.lastName || ''}`.trim()}`}
                    color='primary'
                    variant='outlined'
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Menu
            anchorEl={mentionAnchorEl}
            open={Boolean(mentionAnchorEl) && mentionCandidates.length > 0}
            onClose={resetMentionSelector}
          >
            {mentionCandidates.slice(0, 8).map(user => (
              <MenuItem key={user.id} onClick={() => handleSelectMention(user)}>
                @{`${user.name} ${user.lastName || ''}`.trim()}
              </MenuItem>
            ))}
          </Menu>

          {loadingComments ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              Aun no hay comentarios para esta tarea.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDeleteComment={onDeleteComment}
                />
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant='contained' onClick={onSubmitComment} disabled={!newComment.trim()}>
          Comentar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TaskDetailsDialog
