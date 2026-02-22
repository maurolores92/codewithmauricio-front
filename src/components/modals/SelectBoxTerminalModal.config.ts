import * as yup from 'yup';

export const schema = yup.object().shape({
  initialAmount: yup
    .number()
    .optional()
    .typeError('El monto debe ser un número')
    .min(0, 'El monto debe ser mayor o igual a 0')
    .required('El monto inicial es requerido'),
});

export const defaultValues = {
  initialAmount: 0,
};
