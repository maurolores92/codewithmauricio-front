import { Icon } from "@iconify/react";
import { Box, IconButton, InputAdornment, MenuItem } from "@mui/material";
import CustomTextField from "src/@core/components/mui/text-field";
import CustomChip from 'src/@core/components/mui/chip';
import { useState } from "react";
import { useTheme } from "@mui/system";

const ChipWithChange = ({label, icon, value, onChange, onConfirm, options, inputType='text'}: any) => {
  const [inEdit, setInEdit] = useState<boolean>();
  const theme = useTheme();
  const confirm = async () => {
    await onConfirm();
    setInEdit(false);
  }

  return (<>
    <Box>
      {
        inEdit ? 
        <>
          <CustomTextField
            sx={{width: 150}}
            {...(options ? {select: true} : {type: inputType})} 
           
            value={value}
            onChange={onChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  {icon}
                </InputAdornment>
              )
            }}
          >
            {
              options ? options.map((option: any, index: number) => <MenuItem key={index} value={option.key}>{option.label}</MenuItem>): <></>
            }
          </CustomTextField>
          <IconButton onClick={confirm}>
            <Icon icon={'tabler:check'} color='info' style={{color: theme.palette.success.main}} />
          </IconButton>
          <IconButton onClick={() => setInEdit(false)}>
            <Icon icon={'tabler:x'} color='error' style={{color: theme.palette.error.main}} />
          </IconButton>
        </>
        :
        <>
          <CustomChip 
            label={label} 
            skin='light' color='info'  
            sx={{ml: 2}} icon={icon}
          />
          <IconButton onClick={() => setInEdit(true)}>
            <Icon icon={'tabler:pencil'} style={{color: theme.palette.info.main}} />
          </IconButton>
        </>
      } 
    </Box>
  </>);
}

export default ChipWithChange;