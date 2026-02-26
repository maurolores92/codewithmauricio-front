import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import ConditionalRender from 'src/components/ConditionalRender'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { Task } from '../types'

type SortableTaskProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const SortableTask = ({ task, onEdit, onDelete }: SortableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Card
      ref={setNodeRef}
      sx={{
        ...style,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        backgroundColor: '#f5f7fa',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
          backgroundColor: '#ffffff'
        }
      }}
      {...attributes}
      {...listeners}
    >
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='start' mb={1}>
          <Typography variant='subtitle2' flex={1} sx={{ color: '#1a3a52', fontWeight: 600 }}>
            {task.name}
          </Typography>
          <Box display='flex' gap={0.5} ml={1} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <ConditionalRender permission='edit-tasks'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  onEdit(task)
                }}
              >
                <Icon icon='material-symbols:edit-outline' />
              </IconButton>
            </ConditionalRender>
            <ConditionalRender permission='delete-tasks'>
              <IconButton
                size='small'
                color='error'
                onClick={e => {
                  e.stopPropagation()
                  onDelete(task)
                }}
              >
                <Icon icon='mdi:delete' />
              </IconButton>
            </ConditionalRender>
          </Box>
        </Box>

        {task.description && (
          <Typography variant='body2' sx={{ color: '#5a6c7d', lineHeight: 1.5 }} mt={1}>
            {task.description}
          </Typography>
        )}

        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant='caption' sx={{ color: '#7a8a9a', fontSize: '0.75rem' }}>
            Asignado a:
          </Typography>
          <Typography variant='body2' sx={{ color: '#1a3a52', fontWeight: 500, mt: 0.5 }}>
            {task.assignedUser
              ? `${task.assignedUser.name} ${task.assignedUser.lastName || ''}`.trim()
              : 'Sin asignar'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SortableTask
