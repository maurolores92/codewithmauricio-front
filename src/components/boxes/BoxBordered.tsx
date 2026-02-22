import { Box } from "@mui/material"
import { useTheme } from "@mui/system";

const BoxBordered = ({children, sx = {}}: {children: any, sx?: any}) => {
  const theme = useTheme();

  return (<>
  <Box sx={{borderRadius: 1, p: theme.spacing(4, 5), border: `1px solid ${theme.palette.divider}`, ...sx}}>
    {children}
  </Box>
  </>)
}

export default BoxBordered;