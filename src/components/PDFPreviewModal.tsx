import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

let host = 'http://lincoln.codeah.com.ar/api'; //prod
if(process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  host = 'http://localhost:5003/api'
}

const PDFPreviewModal = ({id, title, type, open, onClose}: any) => {
 
  return (<>
  <Dialog open={open} onClose={onClose} fullWidth maxWidth={'lg'}>
    <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <iframe src={`${host}/pdf/${type}/${id}/template`} style={{width: '100%', height: 800}} />
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={onClose} sx={{mr: 3}} color="error">Cancelar</Button>
        <Button variant="contained"  color="info" href={`${host}/pdf/${type}/${id}/download`}>Descargar</Button>
      </DialogActions>
  </Dialog>
  </>);
}

export default PDFPreviewModal;
