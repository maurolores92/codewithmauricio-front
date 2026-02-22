import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const ConfirmDeleteDialog = ({open, onClose, title, children, action, titleAction='Eliminar'}: any) => {
  
  return (<>
  <Dialog open={open} onClose={onClose} fullWidth maxWidth={'sm'}>
      <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
          <Button onClick={onClose} color="error">Cancelar</Button>
          <Button variant="contained" color="error" onClick={action}>{titleAction}</Button>
      </DialogActions>
  </Dialog>
  </>);
}

export default ConfirmDeleteDialog;
