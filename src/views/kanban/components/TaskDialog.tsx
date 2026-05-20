import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import ConditionalRender from 'src/components/ConditionalRender'
import { User } from '../types'

type TaskDialogProps = {
  open: boolean
  name: string
  description: string
  assignedUserId?: number
  users: User[]
  onChangeName: (value: string) => void
  onChangeDescription: (value: string) => void
  onChangeAssignedUserId: (value?: number) => void
  onCancel: () => void
  onCreate: () => void
}

const TaskDialog = ({
  open,
  name,
  description,
  assignedUserId,
  users,
  onChangeName,
  onChangeDescription,
  onChangeAssignedUserId,
  onCancel,
  onCreate
}: TaskDialogProps) => (
  <Dialog open={open} onClose={onCancel} fullWidth maxWidth='sm'>
    <DialogTitle>Nueva tarea</DialogTitle>
    <DialogContent>
      <Stack spacing={3} mt={2}>
        <TextField label='Titulo' value={name} onChange={e => onChangeName(e.target.value)} fullWidth />
        <TextField
          label='Descripcion'
          value={description}
          onChange={e => onChangeDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
        <ConditionalRender permission='assign-tasks'>
          <FormControl fullWidth>
            <InputLabel>Asignar (Opcional)</InputLabel>
            <Select
              label='Asignar (Opcional)'
              value={assignedUserId || ''}
              onChange={e => onChangeAssignedUserId(e.target.value ? Number(e.target.value) : undefined)}
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
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button variant='contained' onClick={onCreate}>
        Crear
      </Button>
    </DialogActions>
  </Dialog>
)

export default TaskDialog
