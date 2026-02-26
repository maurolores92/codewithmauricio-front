import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import ConditionalRender from 'src/components/ConditionalRender'
import ColumnDialog from 'src/views/kanban/components/ColumnDialog'
import TaskDialog from 'src/views/kanban/components/TaskDialog'
import EditTaskDialog from 'src/views/kanban/components/EditTaskDialog'
import ConfirmDeleteDialog from 'src/components/dialogs/ConfirmDeleteDialog'
import KanbanBoardDnd from 'src/views/kanban/components/KanbanBoardDnd'
import useKanbanBoard from 'src/views/kanban/hooks/useKanbanBoard'

const KanbanBoardView = () => {
  const router = useRouter()
  const boardId = Number(router.query.id)
  const {
    board,
    sortedColumns,
    tasksByColumn,
    users,
    loading,
    columnDialogOpen,
    taskDialogOpen,
    editTaskDialogOpen,
    deleteTaskDialogOpen,
    newColumnName,
    newTaskName,
    newTaskDescription,
    editTaskName,
    editTaskDescription,
    newTaskAssignedUserId,
    taskToDelete,
    activeId,
    overColumnId,
    setColumnDialogOpen,
    setEditTaskDialogOpen,
    setNewColumnName,
    setNewTaskName,
    setNewTaskDescription,
    setEditTaskName,
    setEditTaskDescription,
    setNewTaskAssignedUserId,
    handleCreateColumn,
    handleOpenTaskDialog,
    handleCreateTask,
    handleEditTask,
    handleSaveEditTask,
    handleDeleteTask,
    handleConfirmDeleteTask,
    closeDeleteDialog,
    closeTaskDialog,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useKanbanBoard(boardId, router.isReady)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h5'>{board?.name || 'Tablero'}</Typography>
        <ConditionalRender permission='create-columns'>
          <Button variant='contained' onClick={() => setColumnDialogOpen(true)}>
            Nueva columna
          </Button>
        </ConditionalRender>
      </Box>

      <KanbanBoardDnd
        columns={sortedColumns}
        tasksByColumn={tasksByColumn}
        activeId={activeId}
        overColumnId={overColumnId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onCreateTask={handleOpenTaskDialog}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <ColumnDialog
        open={columnDialogOpen}
        name={newColumnName}
        onChangeName={setNewColumnName}
        onCancel={() => setColumnDialogOpen(false)}
        onCreate={handleCreateColumn}
      />

      <TaskDialog
        open={taskDialogOpen}
        name={newTaskName}
        description={newTaskDescription}
        assignedUserId={newTaskAssignedUserId}
        users={users}
        onChangeName={setNewTaskName}
        onChangeDescription={setNewTaskDescription}
        onChangeAssignedUserId={setNewTaskAssignedUserId}
        onCancel={closeTaskDialog}
        onCreate={handleCreateTask}
      />

      <EditTaskDialog
        open={editTaskDialogOpen}
        name={editTaskName}
        description={editTaskDescription}
        onChangeName={setEditTaskName}
        onChangeDescription={setEditTaskDescription}
        onCancel={() => setEditTaskDialogOpen(false)}
        onSave={handleSaveEditTask}
      />

      <ConfirmDeleteDialog
        open={deleteTaskDialogOpen}
        onClose={closeDeleteDialog}
        title='Confirmar eliminacion'
        action={handleConfirmDeleteTask}
        titleAction='Eliminar'
      >
        <Typography>
          ¿Estas seguro que deseas eliminar la tarea{' '}
          <strong>{taskToDelete?.name}</strong>?
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          Esta accion no se puede deshacer.
        </Typography>
      </ConfirmDeleteDialog>
    </Box>
  )
}

export default KanbanBoardView
