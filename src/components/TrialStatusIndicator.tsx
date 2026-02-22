// TODO: Implement useTrialNotification hook before enabling this component
// This component is currently disabled because the required hook doesn't exist yet

/*
import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTrialNotification } from 'src/hooks/useTrialNotification';

const TrialStatusIndicator: React.FC = () => {
  const {
    isTrialUser,
    daysRemaining,
    isExpired
  } = useTrialNotification();

  if (!isTrialUser) {
    return null;
  }

  const getChipColor = () => {
    if (isExpired) return 'error';
    if (daysRemaining <= 5) return 'error';
    if (daysRemaining <= 10) return 'warning';

    return 'info';
  };

  const getLabel = () => {
    if (isExpired) return 'Trial Expirado';

    return `Trial: ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`;
  };

  const getTooltipText = () => {
    if (isExpired) {
      return 'Tu período de prueba ha expirado. Contacta con el administrador.';
    }

    return `Te quedan ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} de prueba.`;
  };

  return (
    <Tooltip title={getTooltipText()} arrow>
      <Box sx={{ mx: 1 }}>
        <Chip
          icon={<Icon icon="tabler:clock" width={16} height={16} />}
          label={getLabel()}
          color={getChipColor()}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 28,
            '& .MuiChip-icon': {
              marginLeft: 1
            }
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default TrialStatusIndicator;
*/

// Temporary placeholder to avoid build errors
const TrialStatusIndicator = () => null;
export default TrialStatusIndicator;
