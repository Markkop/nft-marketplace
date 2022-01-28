import { TextField } from '@mui/material'

export default function PriceTextField ({ label, onChange, disabled, error }) {
  return (
    <TextField
      id="price-input"
      label={label}
      name="price"
      size="small"
      fullWidth
      required={!disabled}
      margin="dense"
      type="number"
      inputProps={{ step: 'any' }}
      disabled={disabled}
      onChange={onChange}
      error={error}
      sx={{ margin: '0' }}
    />
  )
}
