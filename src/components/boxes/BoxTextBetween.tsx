import { Box, Typography } from "@mui/material"

const BoxTextBetween = ({title, value, textProps, sx={}}: any) => {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', ...sx}}>
      <Typography {...textProps}>{title}:</Typography>
      <Typography {...textProps}>{value}</Typography>
    </Box>
  )
}

export default BoxTextBetween;
