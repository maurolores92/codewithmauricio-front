import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'

type EditTaskDialogProps = {
  open: boolean
  name: string
  description: string
  onChangeName: (value: string) => void
  onChangeDescription: (value: string) => void
  onCancel: () => void
  onSave: () => void
}

const EditTaskDialog = ({
  open,
  name,
  description,
  onChangeName,
  onChangeDescription,
  onCancel,
  onSave
}: EditTaskDialogProps) => (
  <Dialog open={open} onClose={onCancel} fullWidth maxWidth='sm'>
    <DialogTitle>Editar tarea</DialogTitle>
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
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button variant='contained' onClick={onSave}>
        Guardar
      </Button>
    </DialogActions>
  </Dialog>
)

export default EditTaskDialog
