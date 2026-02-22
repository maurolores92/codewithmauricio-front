import { Typography } from "@mui/material"


const errorMessage = (message: any) => {
  return { helperText: <Typography component='span' sx={{color: 'red'}}>{message}</Typography>  }
}

export default errorMessage;
