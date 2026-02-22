import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ClockDateDisplay = ({ sx = {} }: any) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: es }).toUpperCase();

  return (
    <Box display="flex" alignItems="center" p={2} sx={sx}>
      <Typography variant="h4">{formatDate(currentTime, 'dd-MMM')}</Typography>
      <Typography variant="h4" sx={{ ml: 2 }} fontWeight="bold">
        {formatDate(currentTime, 'HH:mm:ss')}
      </Typography>
    </Box>
  );
};

export default ClockDateDisplay;
