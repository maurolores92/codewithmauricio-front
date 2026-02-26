import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import apiConnector from 'src/services/api.service'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Board, BoardColumn, Task, User } from '../types'

type UseKanbanBoardResult = {
  board: Board | null
  sortedColumns: BoardColumn[]
  tasksByColumn: Record<number, Task[]>
  users: User[]
  loading: boolean
  columnDialogOpen: boolean
  taskDialogOpen: boolean
  editTaskDialogOpen: boolean
  deleteTaskDialogOpen: boolean
  newColumnName: string
  newTaskName: string
  newTaskDescription: string
  editTaskName: string
  editTaskDescription: string
  newTaskAssignedUserId?: number
  taskToDelete: Task | null
  activeId: string | null
  overColumnId: number | null
  setColumnDialogOpen: (open: boolean) => void
  setTaskDialogOpen: (open: boolean) => void
  setEditTaskDialogOpen: (open: boolean) => void
  setNewColumnName: (value: string) => void
  setNewTaskName: (value: string) => void
  setNewTaskDescription: (value: string) => void
  setEditTaskName: (value: string) => void
  setEditTaskDescription: (value: string) => void
  setNewTaskAssignedUserId: (value?: number) => void
  handleCreateColumn: () => Promise<void>
  handleOpenTaskDialog: (columnId: number) => void
  handleCreateTask: () => Promise<void>
  handleAssignTask: (task: Task, assignedUserId?: number) => Promise<void>
  handleEditTask: (task: Task) => void
  handleSaveEditTask: () => Promise<void>
  handleDeleteTask: (task: Task) => void
  handleConfirmDeleteTask: () => Promise<void>
  closeDeleteDialog: () => void
  closeTaskDialog: () => void
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => Promise<void>
}

const useKanbanBoard = (boardId: number, isReady: boolean): UseKanbanBoardResult => {
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({})
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [editTaskName, setEditTaskName] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null)
  const [newTaskAssignedUserId, setNewTaskAssignedUserId] = useState<number | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<number | null>(null)

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  )

  const loadBoardData = async () => {
    if (!boardId) return

    try {
      setLoading(true)
      const boardData = await apiConnector.get<Board>(`/boards/${boardId}`)
      setBoard(boardData)

      const columnsData = await apiConnector.get<BoardColumn[]>(`/boards/${boardId}/columns`)
      setColumns(columnsData || [])

      const tasksEntries = await Promise.all(
        (columnsData || []).map(async column => {
          const tasks = await apiConnector.get<Task[]>(`/columns/${column.id}/tasks`)
          
          return [column.id, tasks || []] as const
        })
      )

      const tasksMap: Record<number, Task[]> = {}
      tasksEntries.forEach(([columnId, tasks]) => {
        tasksMap[columnId] = tasks.sort((a, b) => a.position - b.position)
      })
      setTasksByColumn(tasksMap)

      try {
        const usersData = await apiConnector.get<User[]>('/users/all')
        setUsers(usersData || [])
      } catch (error) {
        console.warn('No se pudo cargar usuarios:', error)
      }
    } catch (error) {
      console.error('Error cargando tablero:', error)
      toast.error('No se pudo cargar el tablero')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isReady) {
      loadBoardData()
    }
  }, [isReady, boardId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId.startsWith('task-')) {
      let columnId: number | null = null

      if (overId.startsWith('task-')) {
        const overTaskId = Number(overId.replace('task-', ''))
        for (const [colId, tasks] of Object.entries(tasksByColumn)) {
          if (tasks.some(t => t.id === overTaskId)) {
            columnId = Number(colId)
            break
          }
        }
      } else if (overId.includes('-droppable')) {
        const columnIdMatch = overId.match(/column-(\d+)-droppable/)
        if (columnIdMatch) {
          columnId = Number(columnIdMatch[1])
        }
      }

      setOverColumnId(columnId)

      if (!activeId.startsWith('task-') || !overId.startsWith('task-')) return

      const activeTaskId = Number(activeId.replace('task-', ''))
      const overTaskId = Number(overId.replace('task-', ''))

      let activeColumnId: number | null = null
      let overColumnId: number | null = null

      for (const [colId, tasks] of Object.entries(tasksByColumn)) {
        if (tasks.some(t => t.id === activeTaskId)) activeColumnId = Number(colId)
        if (tasks.some(t => t.id === overTaskId)) overColumnId = Number(colId)
      }

      if (!activeColumnId || !overColumnId) return
      if (activeColumnId === overColumnId) return

      setTasksByColumn(prev => {
        const sourceTasks = [...(prev[activeColumnId!] || [])]
        const targetTasks = [...(prev[overColumnId!] || [])]

        const activeTask = sourceTasks.find(t => t.id === activeTaskId)
        if (!activeTask) return prev

        const updatedSourceTasks = sourceTasks.filter(t => t.id !== activeTaskId)
        const overIndex = targetTasks.findIndex(t => t.id === overTaskId)

        targetTasks.splice(overIndex, 0, { ...activeTask, boardColumnId: overColumnId! })

        return {
          ...prev,
          [activeColumnId!]: updatedSourceTasks,
          [overColumnId!]: targetTasks
        }
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)

    if (!over) return
    if (active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    const isActiveColumn = activeId.startsWith('column-')
    const isOverColumn = overId.startsWith('column-')
    const isActiveTask = activeId.startsWith('task-')
    const isOverTask = overId.startsWith('task-')
    const isOverColumnDroppable = overId.includes('-droppable')

    if (isActiveColumn && isOverColumn) {
      const oldIndex = sortedColumns.findIndex(c => `column-${c.id}` === activeId)
      const newIndex = sortedColumns.findIndex(c => `column-${c.id}` === overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reorderedColumns = arrayMove(sortedColumns, oldIndex, newIndex)
      const updatedColumns = reorderedColumns.map((col, idx) => ({ ...col, position: idx }))

      setColumns(updatedColumns)

      try {
        const items = updatedColumns.map((col, idx) => ({ id: col.id, position: idx }))
        await apiConnector.put(`/columns/reorder`, { items })
        toast.success('Columnas reordenadas')
      } catch (error) {
        console.error('Error reordenando columnas:', error)
        toast.error('Error al reordenar columnas')
        loadBoardData()
      }

      return
    }

    if (isActiveTask) {
      const activeTaskId = Number(activeId.replace('task-', ''))

      let sourceColumnId: number | null = null
      let targetColumnId: number | null = null

      for (const [colId, tasks] of Object.entries(tasksByColumn)) {
        if (tasks.some(t => t.id === activeTaskId)) {
          sourceColumnId = Number(colId)
          break
        }
      }

      if (!sourceColumnId) return

      if (isOverTask) {
        const overTaskId = Number(overId.replace('task-', ''))

        for (const [colId, tasks] of Object.entries(tasksByColumn)) {
          if (tasks.some(t => t.id === overTaskId)) {
            targetColumnId = Number(colId)
            break
          }
        }

        if (!targetColumnId) return

        if (sourceColumnId === targetColumnId) {
          const tasks = [...tasksByColumn[sourceColumnId]]
          const oldIndex = tasks.findIndex(t => t.id === activeTaskId)
          const newIndex = tasks.findIndex(t => t.id === overTaskId)

          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

          const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
          const updatedTasks = reorderedTasks.map((task, idx) => ({ ...task, position: idx }))

          setTasksByColumn(prev => ({
            ...prev,
            [sourceColumnId!]: updatedTasks
          }))

          try {
            await apiConnector.put(`/tasks/${activeTaskId}/move`, {
              boardColumnId: sourceColumnId,
              position: newIndex
            })
          } catch (error) {
            console.error('Error actualizando posicion:', error)
            toast.error('Error al reordenar tarea')
            loadBoardData()
          }
        } else {
          const sourceTask = tasksByColumn[sourceColumnId].find(t => t.id === activeTaskId)
          if (!sourceTask) return

          const targetTasks = [...tasksByColumn[targetColumnId]]
          const overIndex = targetTasks.findIndex(t => t.id === overTaskId)

          const updatedSourceTasks = tasksByColumn[sourceColumnId].filter(t => t.id !== activeTaskId)
          const updatedTargetTasks = [...targetTasks]
          updatedTargetTasks.splice(overIndex, 0, { ...sourceTask, boardColumnId: targetColumnId })

          const reindexedTargetTasks = updatedTargetTasks.map((task, idx) => ({
            ...task,
            position: idx
          }))

          setTasksByColumn(prev => ({
            ...prev,
            [sourceColumnId!]: updatedSourceTasks,
            [targetColumnId!]: reindexedTargetTasks
          }))

          try {
            await apiConnector.put(`/tasks/${activeTaskId}/move`, {
              boardColumnId: targetColumnId,
              position: overIndex
            })
            toast.success('Tarea movida')
          } catch (error) {
            console.error('Error moviendo tarea:', error)
            toast.error('Error al mover tarea')
            loadBoardData()
          }
        }
      } else if (isOverColumnDroppable) {
        const columnIdMatch = overId.match(/column-(\d+)-droppable/)
        if (!columnIdMatch) return

        targetColumnId = Number(columnIdMatch[1])

        if (sourceColumnId === targetColumnId) return

        const sourceTask = tasksByColumn[sourceColumnId].find(t => t.id === activeTaskId)
        if (!sourceTask) return

        const updatedSourceTasks = tasksByColumn[sourceColumnId].filter(t => t.id !== activeTaskId)
        const newPosition = tasksByColumn[targetColumnId]?.length || 0
        const updatedTargetTasks = [
          ...(tasksByColumn[targetColumnId] || []),
          { ...sourceTask, boardColumnId: targetColumnId, position: newPosition }
        ]

        setTasksByColumn(prev => ({
          ...prev,
          [sourceColumnId!]: updatedSourceTasks,
          [targetColumnId!]: updatedTargetTasks
        }))

        try {
          await apiConnector.put(`/tasks/${activeTaskId}/move`, {
            boardColumnId: targetColumnId,
            position: newPosition
          })
          toast.success('Tarea movida')
        } catch (error) {
          console.error('Error moviendo tarea:', error)
          toast.error('Error al mover tarea')
          loadBoardData()
        }
      }
    }
  }

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error('El nombre de la columna es obligatorio')

      return
    }

    try {
      const position = columns.length
      const column = (await apiConnector.post(`/boards/${boardId}/columns`, {
        name: newColumnName,
        position
      })) as BoardColumn
      setColumns(prev => [...prev, column])
      setColumnDialogOpen(false)
      setNewColumnName('')
      toast.success('Columna creada')
    } catch (error) {
      console.error('Error creando columna:', error)
      toast.error('No se pudo crear la columna')
    }
  }

  const handleOpenTaskDialog = (columnId: number) => {
    setActiveColumnId(columnId)
    setTaskDialogOpen(true)
  }

  const handleCreateTask = async () => {
    if (!activeColumnId) return
    if (!newTaskName.trim()) {
      toast.error('El nombre de la tarea es obligatorio')

      return
    }

    try {
      const position = tasksByColumn[activeColumnId]?.length || 0
      const task = (await apiConnector.post(`/columns/${activeColumnId}/tasks`, {
        name: newTaskName,
        description: newTaskDescription,
        position,
        assignedUserId: newTaskAssignedUserId
      })) as Task

      setTasksByColumn(prev => ({
        ...prev,
        [activeColumnId]: [...(prev[activeColumnId] || []), task]
      }))

      setTaskDialogOpen(false)
      setNewTaskName('')
      setNewTaskDescription('')
      setNewTaskAssignedUserId(undefined)
      toast.success('Tarea creada')
    } catch (error) {
      console.error('Error creando tarea:', error)
      toast.error('No se pudo crear la tarea')
    }
  }

  const handleAssignTask = async (task: Task, assignedUserId?: number) => {
    try {
      const updatedTask = (await apiConnector.put(`/tasks/${task.id}/assign`, {
        assignedUserId
      })) as Task

      setTasksByColumn(prev => {
        const updated = (prev[task.boardColumnId] || []).map(t =>
          t.id === task.id ? updatedTask : t
        )

        return {
          ...prev,
          [task.boardColumnId]: updated
        }
      })

      toast.success('Asignacion actualizada')
    } catch (error) {
      console.error('Error asignando tarea:', error)
      toast.error('No se pudo asignar la tarea')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTaskName(task.name)
    setEditTaskDescription(task.description || '')
    setEditTaskDialogOpen(true)
  }

  const handleSaveEditTask = async () => {
    if (!editingTask) return
    if (!editTaskName.trim()) {
      toast.error('El nombre de la tarea es obligatorio')

      return
    }

    try {
      const updatedTask = (await apiConnector.put(`/tasks/${editingTask.id}`, {
        name: editTaskName,
        description: editTaskDescription
      })) as Task

      setTasksByColumn(prev => {
        const updated = (prev[editingTask.boardColumnId] || []).map(t =>
          t.id === editingTask.id ? updatedTask : t
        )

        return {
          ...prev,
          [editingTask.boardColumnId]: updated
        }
      })

      setEditTaskDialogOpen(false)
      setEditingTask(null)
      setEditTaskName('')
      setEditTaskDescription('')
      toast.success('Tarea actualizada')
    } catch (error) {
      console.error('Error actualizando tarea:', error)
      toast.error('No se pudo actualizar la tarea')
    }
  }

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setDeleteTaskDialogOpen(true)
  }

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      await apiConnector.remove(`/tasks/${taskToDelete.id}`)

      setTasksByColumn(prev => {
        const updated = { ...prev }
        for (const columnId in updated) {
          updated[Number(columnId)] = updated[Number(columnId)].filter(t => t.id !== taskToDelete.id)
        }

        return updated
      })

      setDeleteTaskDialogOpen(false)
      setTaskToDelete(null)
      toast.success('Tarea eliminada')
    } catch (error) {
      console.error('Error eliminando tarea:', error)
      toast.error('No se pudo eliminar la tarea')
    }
  }

  const closeDeleteDialog = () => {
    setDeleteTaskDialogOpen(false)
    setTaskToDelete(null)
  }

  const closeTaskDialog = () => {
    setTaskDialogOpen(false)
    setNewTaskAssignedUserId(undefined)
  }

  return {
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
    setTaskDialogOpen,
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
    handleAssignTask,
    handleEditTask,
    handleSaveEditTask,
    handleDeleteTask,
    handleConfirmDeleteTask,
    closeDeleteDialog,
    closeTaskDialog,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  }
}

export default useKanbanBoard
