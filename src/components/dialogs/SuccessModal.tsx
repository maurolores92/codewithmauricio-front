import { Icon } from "@iconify/react"
import { Box, Dialog, DialogActions, DialogContent, Typography } from "@mui/material"

const SuccessModal = ({open, onClose, title, message, actions}: any) => {
  return (<>
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}
    >
      <DialogContent>
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            '& svg': {
              mb: 14,
              color: 'success.main'
            }
          }}
        >
          <Icon fontSize='5.5rem' icon={'tabler:circle-check'} />
          <Typography variant='h4' sx={{ mb: 8 }}>
            {title}
          </Typography>
          <Typography>{message}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        {actions}
      </DialogActions>
    </Dialog>
  </>
  )
}

export default SuccessModal;

