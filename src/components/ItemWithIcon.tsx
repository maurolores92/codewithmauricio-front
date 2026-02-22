import { Typography, Box } from "@mui/material";
import { Icon } from '@iconify/react';

const ItemWithIcon = ({icon, label, property}: any) => {

  return <Box
      sx={{
        display: 'flex',
        '&:not(:last-of-type)': { mb: 2 },
        '& svg': { color: 'text.secondary' }
      }}
    >
      <Box sx={{ display: 'flex', mr: 2 }}>
        <Icon fontSize='1.25rem' icon={icon} />
      </Box>
      <Box sx={{ columnGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 500, color: 'grey.500', textTransform: 'capitalize' }}>
          {`${property}:`}
        </Typography>
        <Typography >
          {label}
        </Typography>
      </Box>
    </Box>
}

export default ItemWithIcon;
