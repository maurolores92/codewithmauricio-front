import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

type ColumnDialogProps = {
  open: boolean
  name: string
  onChangeName: (value: string) => void
  onCancel: () => void
  onCreate: () => void
}

const ColumnDialog = ({ open, name, onChangeName, onCancel, onCreate }: ColumnDialogProps) => (
  <Dialog open={open} onClose={onCancel} fullWidth maxWidth='xs'>
    <DialogTitle>Nueva columna</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        label='Nombre'
        value={name}
        onChange={e => onChangeName(e.target.value)}
        sx={{ mt: 2 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button variant='contained' onClick={onCreate}>
        Crear
      </Button>
    </DialogActions>
  </Dialog>
)

export default ColumnDialog
