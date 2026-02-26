import { Box, Card, CardContent, Typography } from '@mui/material'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableColumn from './SortableColumn'
import { BoardColumn, Task } from '../types'

type KanbanBoardDndProps = {
  columns: BoardColumn[]
  tasksByColumn: Record<number, Task[]>
  activeId: string | null
  overColumnId: number | null
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onCreateTask: (columnId: number) => void
  onGenerateTasks: (columnId: number) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

const KanbanBoardDnd = ({
  columns,
  tasksByColumn,
  activeId,
  overColumnId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onCreateTask,
  onGenerateTasks,
  onEditTask,
  onDeleteTask
}: KanbanBoardDndProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const columnIds = columns.map(c => `column-${c.id}`)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <Box sx={{ display: 'flex', gap: 3, overflowX: columns.length > 4 ? 'auto' : 'visible', pb: 2 }}>
          {columns.map(column => (
            <SortableColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onCreateTask={onCreateTask}
              onGenerateTasks={onGenerateTasks}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              isOverTarget={overColumnId === column.id}
              numberOfColumns={columns.length}
            />
          ))}
        </Box>
      </SortableContext>

      <DragOverlay>
        {activeId && activeId.startsWith('task-') && (
          <Card variant='outlined' sx={{ width: 300, opacity: 0.9 }}>
            <CardContent>
              <Typography variant='subtitle2'>Moviendo tarea...</Typography>
            </CardContent>
          </Card>
        )}
        {activeId && activeId.startsWith('column-') && (
          <Card sx={{ width: 320, opacity: 0.9 }}>
            <CardContent>
              <Typography variant='subtitle1'>Moviendo columna...</Typography>
            </CardContent>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoardDnd
