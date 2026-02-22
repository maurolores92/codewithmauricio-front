import { Box, useMediaQuery } from '@mui/material';
import DatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import es from 'date-fns/locale/es';
import format from 'date-fns/format';
import { forwardRef } from 'react';
import CustomTextField from 'src/@core/components/mui/text-field';

registerLocale('es', es);

interface PickerProps {
  label?: string;
  end: Date | number;
  start: Date | number;
}

const DateRange = ({ 
  label, 
  startDate,
  endDate, 
  formatDate = 'dd-MM-yyyy', 
  onChange, sx = {}, 
  fullWidth = false,
  onCalendarOpen,
  onCalendarClose,
  withPortal=false
}: any) => {
  const popperPlacement: ReactDatePickerProps['popperPlacement'] = 'bottom-start';

  // Detectar si es móvil
  const isMobile = useMediaQuery('(max-width:600px)');

  const CustomInput = forwardRef((props: PickerProps, ref) => {
    
    const startDate = props.end !== null ? format(props.start, formatDate) : 'Seleccione una fecha';
    const endDate = props.end !== null ? ` / ${format(props.end, formatDate)}` : null;
    const value = `${startDate}${endDate !== null ? endDate : ''}`;

    return (
      <CustomTextField
        size='small'
        inputRef={ref}
        label={props.label || ''}
        {...props}
        value={value}
        sx={{ ...sx, fontSize: isMobile ? '0.875rem' : '1rem' }} // Ajuste de tamaño de fuente en móvil
        fullWidth={fullWidth}
      />
    );
  });

  return (
    <DatePickerWrapper>
      <Box>
        <DatePicker
          withPortal={withPortal}
          selectsRange
          monthsShown={isMobile ? 1 : 2} // Mostrar solo 1 mes en móviles
          locale={'es'}
          endDate={endDate}
          selected={startDate}
          startDate={startDate}
          shouldCloseOnSelect={true}
          onChange={onChange}
          popperPlacement={popperPlacement}
          onCalendarOpen={() => onCalendarOpen && onCalendarOpen()}
          onCalendarClose={() => onCalendarClose && onCalendarClose()}
          customInput={
            <CustomInput
              label={label}
              end={endDate as Date | number}
              start={startDate as Date | number}
            />
          }
          showMonthDropdown
          showYearDropdown
          dropdownMode={isMobile ? 'scroll' : 'select'} // Ajustar comportamiento en móvil
        />
      </Box>
    </DatePickerWrapper>
  );
};

export default DateRange;
