
import { Box, Button } from '@mui/material';
import CustomChip from 'src/@core/components/mui/chip';
import { useState, useEffect } from 'react';
import SelectBoxTerminalModal from 'src/components/modals/SelectBoxTerminalModal';
import apiConnector from 'src/services/api.service';

interface Props {
  sx?: any;
  user?: any;
  onRegisterSuccess?: () => void;
}

const BoxTerminalStatus = ({ sx, user }: Props) => {
  const [cashRegister, setCashRegister] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unclosedAlert, setUnclosedAlert] = useState<string | null>(null);
  const [occupiedTerminals, setOccupiedTerminals] = useState<any[]>([]);
  const [openedBoxesToday, setOpenedBoxesToday] = useState<any[]>([]);
  const [refreshCashRegister, setRefreshCashRegister] = useState(0);

  useEffect(() => {
    apiConnector.get('/cash-register/open')
      .then((res: any) => setCashRegister(res ?? null))
      .catch(() => setCashRegister(null));
  }, [user, refreshCashRegister]);

  const handleOpenModal = async () => {
    try {
      const res: any = await apiConnector.get('/cash-register/status');
      setOccupiedTerminals(res.occupiedTerminals || []);
      setOpenedBoxesToday(res.openedBoxesToday || []);
      if (res?.unclosedPrevious) {
        setUnclosedAlert(`Ya existe un registro de caja abierta del día ${res.unclosedPrevious.date}, comunicate con tu administrador para el cierre de caja.`);
      } else {
        setUnclosedAlert(null);
      }
    } catch (err) {
      setUnclosedAlert(null);
      setOccupiedTerminals([]);
      setOpenedBoxesToday([]);
    } finally {
      setModalOpen(true);
    }
  };

  const isSuperadmin = user?.roles?.includes('superadmin');
  if (!cashRegister || !cashRegister.box?.name || !cashRegister.terminal?.name) {
    if (isSuperadmin) return null;

    return (
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'transparent', ...sx }}>
        <Button variant="contained" color="warning" onClick={handleOpenModal}>
          Inicia tu caja
        </Button>
        <SelectBoxTerminalModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onRegisterSuccess={() => setRefreshCashRegister(r => r + 1)}
          unclosedAlert={unclosedAlert}
          occupiedTerminals={occupiedTerminals}
          openedBoxesToday={openedBoxesToday}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'transparent', display: 'flex', gap: 1, ...sx }}>
      <CustomChip label={`Caja: ${cashRegister.box?.name}`} skin="light" color="success" />
      <CustomChip label={`Terminal: ${cashRegister.terminal?.name}`} skin="light" color="info" />
    </Box>
  );
};

export default BoxTerminalStatus;
