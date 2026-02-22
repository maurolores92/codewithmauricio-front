import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import { Icon } from '@iconify/react';

interface TrialNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  daysRemaining: number;
  trialEndsAt: string;
}

const TrialNotificationDialog: React.FC<TrialNotificationDialogProps> = ({
  open,
  onClose,
  daysRemaining,
  trialEndsAt
}) => {
  const getProgressValue = () => {
    const totalDays = 30;
    const progress = ((totalDays - daysRemaining) / totalDays) * 100;

    return Math.min(100, Math.max(0, progress));
  };

  const getProgressColor = () => {
    if (daysRemaining > 20) return 'success';
    if (daysRemaining > 10) return 'warning';

    return 'error';
  };

  const getIcon = () => {
    if (daysRemaining > 20) return 'tabler:calendar-check';
    if (daysRemaining > 10) return 'tabler:calendar-exclamation';
    if (daysRemaining > 0) return 'tabler:calendar-x';

    return 'tabler:calendar-off';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMessage = () => {
    if (daysRemaining > 20) {
      return `Tu período de prueba está activo. Tienes ${daysRemaining} días para explorar todas las funcionalidades.`;
    }
    if (daysRemaining > 10) {
      return `Tu período de prueba está llegando a su fin. Quedan ${daysRemaining} días.`;
    }
    if (daysRemaining > 0) {
      return `¡Atención! Tu período de prueba expira muy pronto. Solo quedan ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}.`;
    }

    return 'Tu período de prueba ha expirado. Contacta con el administrador para continuar.';
  };

  const getSeverity = () => {
    if (daysRemaining > 20) return 'info';
    if (daysRemaining > 10) return 'warning';


    return 'error';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon
            icon={getIcon()}
            width={32}
            height={32}
            color={daysRemaining > 0 ? '#ed6c02' : '#d32f2f'}
          />
          <Box>
            <Typography variant="h5" component="div">
              Período de Prueba
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado de tu cuenta trial
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Alert severity={getSeverity()} sx={{ mb: 3 }}>
          {getMessage()}
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progreso del período de prueba
            </Typography>
            <Chip
              label={`${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}`}
              color={getProgressColor()}
              size="small"
              variant="outlined"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{
          backgroundColor: 'grey.50',
          padding: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Icon icon="tabler:calendar" width={16} height={16} style={{ marginRight: 8 }} />
            Fecha de vencimiento del trial
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {formatDate(trialEndsAt)}
          </Typography>
        </Box>

        {daysRemaining <= 10 && daysRemaining > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'warning.50', borderRadius: 2 }}>
            <Typography variant="body2" color="warning.dark">
              <Icon icon="tabler:info-circle" width={16} height={16} style={{ marginRight: 8 }} />
              Para continuar usando el sistema después del vencimiento, contacta con el administrador
              para actualizar tu plan.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ minWidth: 100 }}
        >
          Entendido
        </Button>
        {daysRemaining <= 10 && daysRemaining > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Aquí podrías redirigir a una página de contacto o upgrade
              window.open('mailto:soporte@ventago.com?subject=Actualizar Plan - Trial por vencer', '_blank');
            }}
            sx={{ minWidth: 120 }}
          >
            Contactar Soporte
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TrialNotificationDialog;
