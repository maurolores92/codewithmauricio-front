import { Box, Button, CircularProgress, Typography, Stack, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { useRouter } from 'next/router'
import ConditionalRender from 'src/components/ConditionalRender'
import ColumnDialog from 'src/views/kanban/components/ColumnDialog'
import TaskDialog from 'src/views/kanban/components/TaskDialog'
import EditTaskDialog from 'src/views/kanban/components/EditTaskDialog'
import ConfirmDeleteDialog from 'src/components/dialogs/ConfirmDeleteDialog'
import KanbanBoardDnd from 'src/views/kanban/components/KanbanBoardDnd'
import useKanbanBoard from 'src/views/kanban/hooks/useKanbanBoard'
import { Icon } from '@iconify/react'

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
    aiColumnDialogOpen,
    aiColumnLoading,
    aiTaskDialogOpen,
    aiTaskLoading,
    newColumnName,
    newTaskName,
    newTaskDescription,
    editTaskName,
    editTaskDescription,
    editTaskAssignedUserId,
    newTaskAssignedUserId,
    taskToDelete,
    activeId,
    overColumnId,
    aiColumnPrompt,
    aiTaskPrompt,
    setColumnDialogOpen,
    setEditTaskDialogOpen,
    setAiColumnDialogOpen,
    setAiTaskDialogOpen,
    setNewColumnName,
    setNewTaskName,
    setNewTaskDescription,
    setEditTaskName,
    setEditTaskDescription,
    setEditTaskAssignedUserId,
    setNewTaskAssignedUserId,
    setAiColumnPrompt,
    setAiTaskPrompt,
    handleCreateColumn,
    handleGenerateColumnsWithAI,
    handleOpenTaskDialog,
    handleOpenAiTaskDialog,
    handleCreateTask,
    handleGenerateTasksWithAI,
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
        <Stack direction='row' spacing={2}>
          <ConditionalRender permission='create-columns'>
            <Tooltip title='Generar con IA'>
              <IconButton 
                color='primary' 
                onClick={() => setAiColumnDialogOpen(true)}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <Icon icon='mdi:robot-excited' />
              </IconButton>
            </Tooltip>
            <Button variant='contained' onClick={() => setColumnDialogOpen(true)}>
              Nueva columna
            </Button>
          </ConditionalRender>
        </Stack>
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
        onGenerateTasks={handleOpenAiTaskDialog}
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
        assignedUserId={editTaskAssignedUserId}
        users={users}
        onChangeName={setEditTaskName}
        onChangeDescription={setEditTaskDescription}
        onChangeAssignedUserId={setEditTaskAssignedUserId}
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

      {/* Diálogo de IA para columnas */}
      <Dialog open={aiColumnDialogOpen} onClose={() => !aiColumnLoading && setAiColumnDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Icon icon='mdi:robot-excited' />
            <Typography>Generar columnas con IA</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Describe las columnas que necesitas'
            placeholder='Ej: Necesito columnas para un flujo de desarrollo: Por hacer, En progreso, En revisión, Completado'
            value={aiColumnPrompt}
            onChange={e => setAiColumnPrompt(e.target.value)}
            sx={{ mt: 2 }}
            disabled={aiColumnLoading}
            autoFocus
          />
          {aiColumnLoading && (
            <Box display='flex' justifyContent='center' mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiColumnDialogOpen(false)} disabled={aiColumnLoading}>
            Cancelar
          </Button>
          <Button 
            variant='contained' 
            onClick={handleGenerateColumnsWithAI}
            disabled={aiColumnLoading || !aiColumnPrompt.trim()}
            startIcon={aiColumnLoading ? <CircularProgress size={20} /> : <Icon icon='mdi:sparkles' />}
          >
            {aiColumnLoading ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de IA para tareas */}
      <Dialog open={aiTaskDialogOpen} onClose={() => !aiTaskLoading && setAiTaskDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Icon icon='mdi:robot-excited' />
            <Typography>Generar tareas con IA</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Describe las tareas que necesitas'
            placeholder='Ej: Necesito tareas para configurar un proyecto: setup inicial, instalar dependencias, configurar BD, crear rutas, escribir tests'
            value={aiTaskPrompt}
            onChange={e => setAiTaskPrompt(e.target.value)}
            sx={{ mt: 2 }}
            disabled={aiTaskLoading}
            autoFocus
          />
          {aiTaskLoading && (
            <Box display='flex' justifyContent='center' mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiTaskDialogOpen(false)} disabled={aiTaskLoading}>
            Cancelar
          </Button>
          <Button 
            variant='contained' 
            onClick={handleGenerateTasksWithAI}
            disabled={aiTaskLoading || !aiTaskPrompt.trim()}
            startIcon={aiTaskLoading ? <CircularProgress size={20} /> : <Icon icon='mdi:sparkles' />}
          >
            {aiTaskLoading ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KanbanBoardView
