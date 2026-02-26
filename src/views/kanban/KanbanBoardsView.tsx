import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Paper, Stack, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, CircularProgress } from '@mui/material'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ConditionalRender from 'src/components/ConditionalRender'
import apiConnector from 'src/services/api.service'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,  } from '@dnd-kit/sortable' 
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'

type Board = {
  id: number
  name: string
  position?: number
  createdAt?: string
}

// Componente para board draggable
const SortableBoard = ({ board, onEdit, onDelete }: { board: Board; onEdit: (board: Board) => void; onDelete: (board: Board) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: board.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Paper
      ref={setNodeRef}
      sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab', '&:active': { cursor: 'grabbing' },       ...style     }}
      {...attributes}
      {...listeners}
    >
      <Box flex={1}>
        <Typography variant='subtitle1'>{board.name}</Typography>
        {board.createdAt && (
          <Typography variant='caption' color='text.secondary'>
            Creado: {new Date(board.createdAt).toLocaleDateString()}
          </Typography>
        )}
      </Box>
      <Box display='flex' gap={1} alignItems='center' onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
        <ConditionalRender permission='edit-boards'>
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              onEdit(board)
            }}
          >
            <Icon icon='mdi:pencil'/>
          </IconButton> 
        </ConditionalRender>
        <ConditionalRender permission='delete-boards'>
          <IconButton
            size='small'
            color='error'
            onClick={e => {
              e.stopPropagation()
              onDelete(board)
            }}
          >
            <Icon icon='mdi:delete'/>
          </IconButton>
        </ConditionalRender>
        <Button
          component={Link}
          href={`/kanban/boards/${board.id}`}
          variant='outlined'
          size='small'
          onClick={e => e.stopPropagation()}
        >
          Abrir
        </Button>
      </Box>
    </Paper>
  )
}

const KanbanBoardsView = () => {
  const [boards, setBoards] = useState<Board[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [editName, setEditName] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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

  const loadBoards = async () => {
    try {
      const data = await apiConnector.get<Board[]>('/boards')
      setBoards(data || [])
    } catch (error) {
      console.error('Error cargando tableros:', error)
      toast.error('Error al cargar tableros')
    }
  }

  useEffect(() => {
    loadBoards()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = boards.findIndex(b => b.id === active.id)
    const newIndex = boards.findIndex(b => b.id === over.id)

    if (oldIndex === newIndex) return

    const reorderedBoards = arrayMove(boards, oldIndex, newIndex)
    setBoards(reorderedBoards)

    // Actualizar en backend
    try {
      const boardIds = reorderedBoards.map(b => b.id)
      await apiConnector.put('/boards/reorder', { boardIds })
      toast.success('Tableros reordenados')
    } catch (error) {
      console.error('Error reordenando tableros:', error)
      toast.error('Error al reordenar tableros')
      loadBoards() // Recargar en caso de error
    }
  }

  const handleEditOpen = (board: Board) => {
    setSelectedBoard(board)
    setEditName(board.name)
    setEditDialogOpen(true)
  }

  const handleCreateOpen = () => {
    setNewBoardName('')
    setCreateDialogOpen(true)
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('El nombre del tablero es obligatorio')

      return
    }

    try {
      const position = boards.length
      const newBoard = (await apiConnector.post('/boards', {
        name: newBoardName,
        position
      })) as Board
      setBoards(prev => [...prev, newBoard])
      setCreateDialogOpen(false)
      setNewBoardName('')
      toast.success('Tablero creado')
    } catch (error) {
      console.error('Error creando tablero:', error)
      toast.error('No se pudo crear el tablero')
    }
  }

  const handleEditSave = async () => {
    if (!selectedBoard || !editName.trim()) {
      toast.error('El nombre es obligatorio')

      return
    }

    try {
      await apiConnector.put(`/boards/${selectedBoard.id}`, { name: editName })
      setBoards(prev =>
        prev.map(b => (b.id === selectedBoard.id ? { ...b, name: editName } : b))
      )
      setEditDialogOpen(false)
      toast.success('Tablero actualizado')
    } catch (error) {
      console.error('Error actualizando tablero:', error)
      toast.error('No se pudo actualizar el tablero')
    }
  }

  const handleDeleteOpen = (board: Board) => {
    setSelectedBoard(board)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBoard) return

    try {
      await apiConnector.remove(`/boards/${selectedBoard.id}`)
      setBoards(prev => prev.filter(b => b.id !== selectedBoard.id))
      setDeleteDialogOpen(false)
      toast.success('Tablero eliminado')
    } catch (error: any) {
      console.error('Error eliminando tablero:', error)
      
      // Mostrar mensaje más descriptivo según el tipo de error
      if (error?.code === '23503' || error?.constraint === 'board_columns_board_id_fkey') {
        toast.error('El tablero tiene columnas o tareas. Intenta nuevamente.')
      } else {
        toast.error('No se pudo eliminar el tablero')
      }
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Por favor describe los tableros que necesitas')
      
      return
    }

    setAiLoading(true)
    try {
      // Llamada al endpoint de IA
      const generatedBoards = await apiConnector.post('/boards/generate-with-ai', {
        prompt: aiPrompt
      }) as { boards: string[] }

      if (!generatedBoards?.boards || generatedBoards.boards.length === 0) {
        toast.error('La IA no pudo generar tableros. Intenta reformular tu solicitud.')

        return
      }

      // Crear los tableros en batch
      const startPosition = boards.length
      const newBoards: Board[] = []

      for (let i = 0; i < generatedBoards.boards.length; i++) {
        const board = await apiConnector.post('/boards', {
          name: generatedBoards.boards[i],
          position: startPosition + i
        }) as Board
        newBoards.push(board)
      }

      setBoards(prev => [...prev, ...newBoards])
      setAiDialogOpen(false)
      setAiPrompt('')
      toast.success(`${newBoards.length} tablero(s) creado(s) con IA`)
    } catch (error: any) {
      console.error('Error generando tableros con IA:', error)
      toast.error('Error al generar tableros con IA')
    } finally {
      setAiLoading(false)
    }
  }

  const boardIds = boards.map(b => b.id)

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Typography variant='h5'>Tableros</Typography>
          <Stack direction='row' spacing={2}>
            <ConditionalRender permission='create-boards'>
              <Tooltip title='Generar con IA'>
                <IconButton 
                  color='primary' 
                  onClick={() => setAiDialogOpen(true)}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <Icon icon='mdi:robot-excited' />
                </IconButton>
              </Tooltip>
              <Button variant='contained' onClick={handleCreateOpen}>
                Crear tablero
              </Button>
            </ConditionalRender>
          </Stack>
        </Box>

        {boards.length === 0 && (
          <Typography color='text.secondary'>Aun no hay tableros.</Typography>
        )}

        {boards.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={boardIds} strategy={verticalListSortingStrategy}>
              <Stack spacing={2}>
                {boards.map(board => (
                  <SortableBoard key={board.id} board={board} onEdit={handleEditOpen} onDelete={handleDeleteOpen} />
                ))}
              </Stack>
            </SortableContext>

            <DragOverlay>
              {activeId && (
                <Paper sx={{ p: 2, opacity: 0.9 }}>
                  <Typography variant='subtitle1'>
                    {boards.find(b => b.id === activeId)?.name}
                  </Typography>
                </Paper>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>

      {/* Diálogo de creación */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Crear tablero</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Nombre'
            value={newBoardName}
            onChange={e => setNewBoardName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleCreateBoard()
              }
            }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button variant='contained' onClick={handleCreateBoard}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Editar tablero</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Nombre'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant='contained' onClick={handleEditSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar tablero</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el tablero "{selectedBoard?.name}"? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color='error' variant='contained' onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de IA */}
      <Dialog open={aiDialogOpen} onClose={() => !aiLoading && setAiDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Icon icon='mdi:robot-excited' />
            <Typography>Generar tableros con IA</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Describe los tableros que necesitas'
            placeholder='Ej: Necesito 3 tableros para gestionar el desarrollo de una app: uno para frontend, otro para backend y otro para QA'
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            sx={{ mt: 2 }}
            disabled={aiLoading}
            autoFocus
          />
          {aiLoading && (
            <Box display='flex' justifyContent='center' mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)} disabled={aiLoading}>
            Cancelar
          </Button>
          <Button 
            variant='contained' 
            onClick={handleAiGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
            startIcon={aiLoading ? <CircularProgress size={20} /> : <Icon icon='mdi:sparkles' />}
          >
            {aiLoading ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default KanbanBoardsView
