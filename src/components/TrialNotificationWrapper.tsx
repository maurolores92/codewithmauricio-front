// TODO: Implement useTrialNotification hook before enabling this component
// This component is currently disabled because the required hook doesn't exist yet

/*
import React from 'react';
import { useTrialNotification } from 'src/hooks/useTrialNotification';
import TrialNotificationDialog from 'src/components/dialogs/TrialNotificationDialog';

interface Props {
  onClose?: () => void;
}

const TrialNotificationWrapper: React.FC<Props> = ({ onClose }) => {
  const {
    isTrialUser,
    daysRemaining,
    trialEndsAt,
    showDialog,
    closeDialog
  } = useTrialNotification();

  if (!isTrialUser || !trialEndsAt) {
    return null;
  }

  const handleClose = () => {
    closeDialog();
    if (onClose) onClose();
  };

  return (
    <TrialNotificationDialog
      open={showDialog}
      onClose={handleClose}
      daysRemaining={daysRemaining}
      trialEndsAt={trialEndsAt}
    />
  );
};

export default TrialNotificationWrapper;
*/

// Temporary placeholder to avoid build errors
const TrialNotificationWrapper = () => null;
export default TrialNotificationWrapper;
