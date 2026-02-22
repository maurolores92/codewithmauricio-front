import { Icon } from "@iconify/react";
import { Avatar, Box, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { format } from 'date-fns';
import es from "date-fns/esm/locale/es/index.js";
import Link from "next/link";
import CustomChip from 'src/@core/components/mui/chip';
import { constants } from 'src/configs/constants';

  const formatDate = (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: es }).toUpperCase();


export const titleColumn = (field: any, color = 'primary.main') => (
  <Typography  sx={{ color, fontSize: '0.8rem' }}>
    {field}
  </Typography>
)

export const titleAndSubtitle = (title: string, subtitle: string) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: 'primary.main', fontSize: 14, fontWeight: 600}}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem'}}>{subtitle}</Typography>
    </Box>
  );
}

export const AvatarProduct = (image?: string) => {
  let imageUrl = image;
  if (image && !/^https?:\/\//.test(image)) {
    imageUrl = `${constants.api}/minio/${image}`;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
      {imageUrl ? (
        <Avatar sx={{ mr: 2, width: 35, height: 35 }} variant='rounded' src={imageUrl} alt='image' />
      ) : (
        <Avatar sx={{ mr: 2, width: 35, height: 35 }} variant='rounded'>?</Avatar>
      )}
    </Box>
  );
}

export const titleAndSubtitle2 = (title: string, subtitle: string, subtitle2: string) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: 'primary.main', fontSize: 14, fontWeight: 600}}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12}}>{subtitle}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12}}>{subtitle2}</Typography>
    </Box>
  );
}



export const dateTimeColumn = (params: GridRenderCellParams, field = 'createdAt') => {
  const date = formatDate(new Date(params.row[field]), 'MM-dd-yyyy');
  const time = formatDate(new Date(params.row[field]), 'hh:mm a');

return (
  <Box sx={{textAlign: 'right'}}>
    <Typography sx={{ color: 'text.primary', fontWeight: 600}}>{date} - {time}</Typography>
  </Box>
);
};

export const dateColumn = (params: GridRenderCellParams, field = 'createdAt') => {
  const date = formatDate(new Date(params.row[field]), 'MM-dd-yyyy');

return (
  <Box sx={{textAlign: 'right'}}>
    <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.8rem'}}>{date}</Typography>
  </Box>
);
};

export const labelColumn = (data: any, color: any ='primary') => (<CustomChip label={data} skin='light' color={color} />)

export const emailAndPhoneColumn = (params: GridRenderCellParams) => {

  return (
    <>
      <Box>
        <Link href={`mailto:${params.row.email}`} style={{ color: 'info.main', textDecoration: 'none'  }}>{params.row.email}</Link>
        <Typography variant='body2' sx={{ color: 'text.primary'}}>{params.row.phone}</Typography>
      </Box>
    </>
  )
};

export const actionsColumn = (actions: any): any => ({
  flex: 0.10,
  minWidth: 100,
  headerName: 'Actions',
  field: 'action',
  align: 'right',
  headerAlign: 'right',
  renderCell: (params: GridRenderCellParams) => {
    const render = actions(params.row)

    return <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>{render}</Box>
  }
})

export const labelColumnStatus = (data: boolean) => {
  const color = data ? 'success' : 'error';

  return <CustomChip label={data ? 'Activo' : 'Inactivo'} skin="light" color={color} />;
};

export const labelColumnVerified = (data: boolean) => {
  const color = data ? 'success' : 'error';

  return <CustomChip label={data ? 'Verificado' : 'Sin verificar'} skin="light" color={color} />;
};

export const labelUser = (user: { name: string; lastName: string }) => {

  return (
    <CustomChip
      label={`${user.name} ${user.lastName}`}
      skin="light"
      color="info"
    />
  );
};

export const labelRole = (user: any) => {
  const role = user.userRoles?.[0]?.role;
  if (!role) return null;

  return (
    <CustomChip
      label={role.name}
      skin="light"
      color={role.color || 'primary'}
    />
  );
};

export const labelOrderStatus = (status: { name: string; description?: string; color?: any }) => {
  if (!status) return null;

  return (
    <CustomChip
      label={status.description || ''}
      skin="light"
      color={status.color || 'primary'}
    />
  );
};

export const labelUserStatus = (status: 'active' | 'inactive' | 'trial' | 'suspended') => {
  const statusConfig = {
    active: { label: 'Activo', color: 'success' as const, icon: 'tabler:check' },
    inactive: { label: 'Inactivo', color: 'error' as const, icon: 'clarity:remove-solid' },
    trial: { label: 'Prueba', color: 'warning' as const, icon: 'tabler:clock' },
    suspended: { label: 'Suspendido', color: 'error' as const, icon: 'clarity:remove-solid' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <CustomChip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon={config.icon} />
          {config.label}
        </Box>
      }
      skin="light"
      color={config.color}
    />
  );
};


const muiColors = [
  'primary', 'success', 'info', 'warning', 'error', 'secondary'
] as const;
type MuiColor = typeof muiColors[number];

function getRoleColor(slug: string): MuiColor {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % muiColors.length;

  return muiColors[idx];
}

export const labelUserRoles = (roles: Array<{ name: string; slug: string }>) => {
  if (!Array.isArray(roles) || roles.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {roles.map((role, idx) => {
        let color = getRoleColor(role.slug);
        if (!muiColors.includes(color)) color = 'info';

        return (
          <CustomChip
            key={role.slug + idx}
            label={role.name}
            skin="light"
            color={color}
          />
        );
      })}
    </Box>
  );
};

export const chipBoolean = (
  value: number | boolean,
  labelTrue = 'Sí',
  labelFalse = 'No',
  colorTrue: 'success' | 'primary' | 'info' | 'warning' | 'error' = 'success',
  colorFalse: 'success' | 'primary' | 'info' | 'warning' | 'error' = 'warning'
) => {
  const isOk = value === 1 || value === true

  return (
    <CustomChip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon={isOk ? 'tabler:check' : 'tabler:x'} />
          {isOk ? labelTrue : labelFalse}
        </Box>
      }
      skin="light"
      color={isOk ? colorTrue : colorFalse}
    />
  )
}

export const labelStoreApps = (apps: Array<{ name: string; color: any }>) => {
  if (!Array.isArray(apps) || apps.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {apps.map((app, idx) => (
        <CustomChip
          key={app.name + idx}
          label={app.name}
          skin="light"
          color={app.color || 'info'}
        />
      ))}
    </Box>
  );
};

export const labelStatusChip = (status: { name: string; color?: any }) => {
  if (!status) return null;

  return (
    <CustomChip
      label={status.name || ''}
      skin="light"
      color={status.color || 'primary'}
    />
  );
};

export const labelType = (status: 'venta' | 'ingreso' | 'gasto' | 'retiro') => {
  const statusConfig = {
    venta: { label: 'Venta', color: 'success' as const, icon: 'tabler:check' },
    ingreso: { label: 'Ingreso', color: 'info' as const, icon: 'tabler:plus' },
    gasto: { label: 'Gasto', color: 'error' as const, icon: 'tabler:receipt' },
    retiro: { label: 'Retiro', color: 'warning' as const, icon: 'tabler:minus' }
  };

  const config = statusConfig[status] || statusConfig.venta;

  return (
    <CustomChip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon={config.icon} />
          {config.label}
        </Box>
      }
      skin="light"
      color={config.color}
    />
  );

};

export const labelExecutionType = (status: 'manual' | 'automatico') => {
  const statusConfig = {
    manual: { label: 'Manual', color: 'info' as const, icon: 'tabler:hand' },
    automatico: { label: 'Automático', color: 'success' as const, icon: 'tabler:robot' },
  };

  const config = statusConfig[status] || statusConfig.manual;

  return (
    <CustomChip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon={config.icon} />
          {config.label}
        </Box>
      }
      skin="light"
      color={config.color}
    />
  );

};


export const actionChip = (action: string) => {
  let color: 'success' | 'info' | 'error' = 'info';
  let label = action;
  let icon = 'tabler:circle';
  if (action === 'create') {
    color = 'success';
    label = 'Crear';
    icon = 'tabler:plus';
  } else if (action === 'edit') {
    color = 'info';
    label = 'Editar';
    icon = 'tabler:edit';
  } else if (action === 'remove') {
    color = 'error';
    label = 'Eliminar';
    icon = 'tabler:trash';
  }

  return (
    <CustomChip
      icon={<Icon icon={icon} width={16} height={16} />}
      label={label}
      skin="light"
      color={color}
      sx={{ fontWeight: 500 }}
    />
  );
};
