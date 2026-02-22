import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, Box, Alert } from '@mui/material';
import apiConnector from 'src/services/api.service';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/useAuth';
import CustomTextField from 'src/@core/components/mui/text-field';
import FormDialog from 'src/components/dialogs/FormDialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { defaultValues, schema } from './SelectBoxTerminalModal.config';
import * as yup from 'yup';

interface Props {
  open: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
  unclosedAlert?: string | null;
  occupiedTerminals?: any[];
  openedToday?: any | null;
  openedBoxesToday?: any[];
}

const SelectBoxTerminalModal = ({ open, onClose, onRegisterSuccess, unclosedAlert, occupiedTerminals = [], openedToday = null, openedBoxesToday = [] }: Props) => {
  const [boxId, setBoxId] = useState<number | null>(null);
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [boxList, setBoxList] = useState<Array<{ id: number; name: string }>>([]);
  const [terminalList, setTerminalList] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [terminalAlert, setTerminalAlert] = useState<string | null>(null);
  const [boxSuccessAlert, setBoxSuccessAlert] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const [requireInitialAmount, setRequireInitialAmount] = useState(false);

  // Schema dinámico según requireInitialAmount
  const dynamicSchema = requireInitialAmount
    ? schema
    : yup.object().shape({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(dynamicSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const boxResRaw = await apiConnector.get('/box');
      const boxRes = Array.isArray(boxResRaw) ? boxResRaw as { id: number; name: string }[] : [];
      setBoxList(boxRes);
      if (boxRes.length > 0) {
        const firstBoxId = boxRes[0].id;
        setBoxId(firstBoxId);
        const terminals = await apiConnector.get(`/terminal/by-box/${firstBoxId}`);
        setTerminalList(Array.isArray(terminals) ? terminals : []);
        if (Array.isArray(terminals) && terminals.length > 0) {
          let selectedTerminalId: number | null = null;
          for (const t of terminals) {
            const occupied = occupiedTerminals.find(o => o.terminalId === t.id);
            if (!occupied) {
              selectedTerminalId = t.id;
              break;
            }
          }
          setTerminalId(selectedTerminalId);
        } else {
          setTerminalId(null);
        }
      } else {
        setBoxId(null);
        setTerminalList([]);
        setTerminalId(null);
      }
    } catch (err) {
      toast.error('Error al cargar cajas');
      setBoxList([]);
      setBoxId(null);
      setTerminalList([]);
      setTerminalId(null);
    } finally {
      setLoading(false);
    }
  }, [occupiedTerminals]);

  useEffect(() => {
    if (!open) return;
    fetchLists();
    reset(defaultValues);
    setTerminalAlert(null);
    setBoxSuccessAlert(null);
  }, [open, fetchLists, reset]);

  const openedBoxInfo = boxId ? openedBoxesToday.find(b => b.boxId === boxId) : undefined;
  const boxAlreadyOpened = !!openedBoxInfo;
  useEffect(() => {
    setRequireInitialAmount(!!boxId && !openedToday && !boxAlreadyOpened);
  }, [boxId, openedToday, boxAlreadyOpened]);

  useEffect(() => {
    if (boxId && boxAlreadyOpened && openedBoxInfo) {
      let userText = '';
      if ((openedBoxInfo as any).user && (openedBoxInfo as any).user.name) {
        userText = ` por ${openedBoxInfo.user?.name} ${openedBoxInfo.user?.lastName ?? ''}`;
      }
      setBoxSuccessAlert(`Esta caja ya ha sido inicializada${userText}. Monto inicial registrado: $${openedBoxInfo.initialAmount}. Si requiere asistencia, por favor contacte a su administrador.`);
    } else {
      setBoxSuccessAlert(null);
    }
  }, [boxId, boxAlreadyOpened, openedBoxInfo]);

  const handleSelectBox = async (id: number) => {
    setBoxId(id);
    setTerminalId(null);
    setLoading(true);
    try {
      const terminals = await apiConnector.get(`/terminal/by-box/${id}`);
      setTerminalList(Array.isArray(terminals) ? terminals : []);
      if (Array.isArray(terminals) && terminals.length > 0) {
        let selectedTerminalId: number | null = null;
        for (const t of terminals) {
          const occupied = occupiedTerminals.find(o => o.terminalId === t.id);
          if (!occupied) {
            selectedTerminalId = t.id;
            break;
          }
        }
        setTerminalId(selectedTerminalId);
      } else {
        setTerminalId(null);
      }
    } catch (err) {
      setTerminalList([]);
      toast.error('Error al cargar terminales de la caja seleccionada');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTerminal = (id: number) => {
    setTerminalId(id);
  };

  const handleSubmitForm = async (data: any) => {
    if (!boxId || !terminalId) return;
    const occupied = occupiedTerminals.find(t => t.terminalId === terminalId);
    if (occupied) return;
    setLoading(true);
    try {
      let initialAmountToSend: number | null = null;
      if (requireInitialAmount) {
        initialAmountToSend = Number(data.initialAmount);
      } else if (boxAlreadyOpened) {
        initialAmountToSend = null;
      }
      await apiConnector.post('/cash-register/open', {
        boxId,
        terminalId,
        userId,
        initialAmount: initialAmountToSend,
      });
      toast.success('Caja y terminal abiertas correctamente. ¡Listo para operar!');
      setLoading(false);
      if (onRegisterSuccess) onRegisterSuccess();
      onClose();
    } catch (err) {
      toast.error('Error al abrir la caja');
      setLoading(false);
    }
  };

  const showSelection = !(boxList.length === 1 && terminalList.length === 1);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Selecciona Caja y Terminal"
      onSubmit={handleSubmit(handleSubmitForm)}
      titleAction="Confirmar"
      loading={loading}
      size="md"
      isValid={requireInitialAmount ? isValid : !!boxId && !!terminalId}
    >
      {unclosedAlert && (
        <Box sx={{ mb: 2 }}> <Alert severity="error" variant="filled"> {unclosedAlert} </Alert></Box>
      )}
      {terminalAlert && (
        <Box sx={{ mb: 2 }}> <Alert severity="warning" variant="filled"> {terminalAlert} </Alert> </Box>
      )}
      {boxSuccessAlert && (
        <Box sx={{ mb: 2 }}> <Alert severity="success" variant="filled"> {boxSuccessAlert} </Alert></Box>
      )}
      {!unclosedAlert && showSelection && (
        <>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>Caja</Typography>
          {boxList.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" variant="filled">
                No existen cajas asociadas a esta sucursal, por favor comunicarse con el administrador.
              </Alert>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {boxList.map((box, idx) => (
              <Button
                key={box.id}
                variant={boxId === box.id || (boxId === null && idx === 0) ? 'contained' : 'outlined'}
                onClick={() => handleSelectBox(box.id)}
                sx={{ minWidth: 150 }}
              >
                {box.name}
              </Button>
            ))}
          </Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Terminal</Typography>
          {terminalList.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" variant="filled">
                No existen terminales asociadas a esta sucursal, por favor comunicarse con el administrador.
              </Alert>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {terminalList.map((terminal) => {
              const occupied = occupiedTerminals.find(t => t.terminalId === terminal.id);

              return (
                <Button
                  key={terminal.id}
                  variant={terminalId === terminal.id ? 'contained' : 'outlined'}
                  onClick={() => handleSelectTerminal(terminal.id)}
                  sx={{ minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  disabled={!!occupied}
                >
                  {terminal.name}
                  {occupied && (
                    <Typography sx={{ mt: 1 }}>
                      (En uso por {occupied.user.name} {occupied.user.lastName})
                    </Typography>
                  )}
                </Button>
              );
            })}
          </Box>
          {boxId && requireInitialAmount && (
            <CustomTextField
              margin="normal"
              label="Monto inicial"
              type="number"
              autoFocus
              error={Boolean(errors.initialAmount)}
              helperText={errors.initialAmount?.message}
              {...register('initialAmount', { required: true })}
            />
          )}

        </>
      )}
      {!unclosedAlert && !showSelection && (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Caja seleccionada: <b>{boxList[0]?.name}</b><br />
            Terminal seleccionada: <b>{terminalList[0]?.name}</b>
          </Typography>
          {boxId && requireInitialAmount && (
            <CustomTextField
              margin="normal"
              label="Monto inicial"
              type="number"
              autoFocus
              error={Boolean(errors.initialAmount)}
              helperText={errors.initialAmount?.message}
              {...register('initialAmount', { required: true })}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default SelectBoxTerminalModal;
