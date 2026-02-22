import { Button, IconButton } from "@mui/material";

const ButtonLoadFile = ({children, onChange, sx, buttonProps, isIcon = false, id = 'load-file', accept= 'image/*'}: any) => {
  const loadImage = (e: any) => {
    onChange(e.target.files[0]);
  }
  
  return (<>
    <input
      accept={accept}
      style={{ display: 'none' }}
      id={id}
      multiple
      type="file"
      onChange={loadImage}
    />
    <label htmlFor={id}>
      {
        isIcon ? 
        <IconButton sx={sx} {...buttonProps} component="span">
          {children}
        </IconButton>: 
        <Button {...buttonProps} component="span" sx={sx} >
        {children}
      </Button>
      }
     
    </label> 
  </>);
}

export default ButtonLoadFile;