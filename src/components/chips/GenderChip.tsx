import CustomChip from 'src/@core/components/mui/chip';

const GenderChip = (gender: string) => <CustomChip 
  skin='light'
  label={gender === 'male'? 'Masculino': 'Femenino'}
  color={gender === 'male'? 'info': 'warning'}
  />

export default GenderChip;
