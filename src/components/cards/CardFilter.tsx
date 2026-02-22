import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  Tooltip,
  TextField,
  MenuItem,
} from '@mui/material'

import { useState, useMemo } from 'react'

import BoxBordered from 'src/components/boxes/BoxBordered'
import { Icon } from '@iconify/react'

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select';
  placeholder?: string;
  icon?: string;
  show?: boolean;
  options?: Array<{ value: string | number; label: string }>;
}


interface CardFilterProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onFiltersChange?: (filters: Record<string, string>) => void;
  onClear?: () => void;
  filterFields?: FilterField[];
  currentFilters?: Record<string, string>;
  filters?: React.ReactNode; // Nuevo prop para componente de filtros
  showFilterButton?: boolean;
  sx?: any;
}


const CardFilter = ({
  title,
  actions,
  children,
  onFiltersChange,
  onClear,
  filterFields = [],
  currentFilters = {},
  filters: filtersComponent,
  showFilterButton = true,
  sx = {}
}: CardFilterProps) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Si se pasa filtersComponent, se usa ese componente, si no, se usa el sistema de filterFields
  const initialFilters = useMemo(() => {
    const initial: Record<string, string> = {};
    filterFields.forEach(field => {
      initial[field.key] = currentFilters[field.key] || '';
    });

    return initial;
  }, [filterFields, currentFilters]);

  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters: Record<string, string> = {};
    filterFields.forEach(field => {
      clearedFilters[field.key] = '';
    });
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
    if (onClear) {
      onClear();
    }
  };

  const renderFilterFields = () => {
    return filterFields
      .filter(field => field.show !== false)
      .map(field => (
        <Grid item xs={12} sm={6} md={3} key={field.key}>
          {field.type === 'select' ? (
            <TextField
              select
              fullWidth
              label={field.label}
              value={filters[field.key] || ''}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={field.icon ? {
                startAdornment: <Icon icon={field.icon} style={{ marginRight: 8, opacity: 0.6 }} />
              } : undefined}
            >
              {field.options?.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              label={field.label}
              type={field.type}
              value={filters[field.key] || ''}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              size="small"
              InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
              InputProps={field.icon ? {
                startAdornment: <Icon icon={field.icon} style={{ marginRight: 8, opacity: 0.6 }} />
              } : undefined}
            />
          )}
        </Grid>
      ));
  };

  return (
    <Card sx={{ mb: 3, ...sx }}>
      <CardHeader
        title={title}
        sx={{ p: 4 }}
        action={
          <>
            {actions}
            {showFilterButton && (
              <Tooltip title='Filtros' placement='top' arrow>
                <Button variant='outlined' sx={{ ml: 2 }} onClick={() => setShowFilters(!showFilters)}>
                  <Icon icon='line-md:filter-filled' />
                </Button>
              </Tooltip>
            )}
          </>
        }
      />

      <Collapse in={showFilters}>
        <CardContent>
          {filtersComponent ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                {filtersComponent}
              </Grid>
            </Grid>
          ) : (
            <BoxBordered
              sx={{ display: { lg: 'flex', xs: 'block' }, justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                  <Grid container spacing={3} alignItems="center">
                    {renderFilterFields()}
                  </Grid>
                </Grid>
                <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'end' }}>
                  <Button size='small' sx={{ mt: 1 }} color='error' onClick={clearFilters}>
                    <Box component={Icon} icon='carbon:clean' color='error' sx={{mr: 1}}/>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </BoxBordered>
          )}
        </CardContent>
      </Collapse>

      {children}
    </Card>
  );
};

export default CardFilter
