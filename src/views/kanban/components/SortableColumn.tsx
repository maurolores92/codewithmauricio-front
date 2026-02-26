import { Box, Button, Card, CardContent, Stack, Typography, IconButton, Tooltip } from '@mui/material'
import ConditionalRender from 'src/components/ConditionalRender'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import SortableTask from './SortableTask'
import { BoardColumn, Task } from '../types'
import { Icon } from '@iconify/react'

type SortableColumnProps = {
  column: BoardColumn
  tasks: Task[]
  onCreateTask: (columnId: number) => void
  onGenerateTasks: (columnId: number) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  isOverTarget?: boolean
  numberOfColumns: number
}

const SortableColumn = ({
  column,
  tasks,
  onCreateTask,
  onGenerateTasks,
  onEditTask,
  onDeleteTask,
  isOverTarget,
  numberOfColumns
}: SortableColumnProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column
    }
  })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column.id}-droppable`
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position)
  const taskIds = sortedTasks.map(t => `task-${t.id}`)

  return (
    <Card
      ref={setNodeRef}
      sx={{
        flex: { xs: '0 0 100%', sm: numberOfColumns <= 4 ? 1 : '0 0 25%' },
        display: 'flex',
        flexDirection: 'column',
        minWidth: { xs: 0, sm: numberOfColumns <= 4 ? 0 : '320px' },
        ...style
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', wordBreak: 'break-word' }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
          sx={{
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            userSelect: 'none'
          }}
          {...attributes}
          {...listeners}
        >
          <Typography variant='subtitle1'>{column.name}</Typography>
          <ConditionalRender permission='create-tasks'>
            <Stack direction='row' spacing={1} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
              <Tooltip title='Generar con IA'>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation()
                    onGenerateTasks(column.id)
                  }}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    padding: '4px',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <Icon icon='mdi:robot-excited' width={16} height={16} />
                </IconButton>
              </Tooltip>
              <Button
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  onCreateTask(column.id)
                }}
              >
                Nueva
              </Button>
            </Stack>
          </ConditionalRender>
        </Box>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <Stack
            ref={setDroppableRef}
            spacing={2}
            flex={1}
            minHeight={100}
            sx={{
              transition: 'all 0.2s ease',
              borderRadius: '4px',
              padding: '8px',
              ...(isOverTarget && {
                border: '2px dashed',
                borderColor: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              })
            }}
          >
            {sortedTasks.map(task => (
              <SortableTask key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
            ))}
          </Stack>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

export default SortableColumn
