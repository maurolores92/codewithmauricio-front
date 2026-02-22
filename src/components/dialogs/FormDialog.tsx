import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

import { Icon } from '@iconify/react'

const FormDialog = ({open, onClose, title, children, onSubmit, titleAction='Agregar', loading=false, size='sm', isValid=true }: any) => {

  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth={size}>
      <DialogTitle id='form-dialog-title'>
        <Typography fontWeight={600} fontSize={22}>{title}</Typography>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {children}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={onClose} color="error">Cancelar</Button>
          <Button variant="contained" color="primary" type="submit" startIcon={loading ? <Icon icon='eos-icons:loading' /> : <></>} disabled={!isValid || loading}>
            {titleAction}
          </Button>
        </DialogActions>
      </form>
  </Dialog>
  );
}

export default FormDialog;
