import { Icon } from "@iconify/react";
import { Card, CardHeader, Collapse, Divider, IconButton } from "@mui/material"
import { useState } from "react";

const CardCollapse = ({children, title, actions, headerProps, sx={}}: any) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  return (
    <Card sx={sx}>
      <CardHeader action={<>
          {actions}
          <IconButton
            size='small'
            aria-label='collapse'
            sx={{ color: 'text.secondary', ml: 5 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon fontSize={20} icon={!collapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'} />
          </IconButton>
        </>
        } title={title} {...headerProps}
      />
      <Divider orientation="horizontal" />
      <Collapse in={collapsed}>
        {children}
      </Collapse>
    </Card>
  )
};

export default CardCollapse;
