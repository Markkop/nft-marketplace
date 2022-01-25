import { TextField } from '@mui/material'

export default function PriceTextField ({ label, onChange, disabled }) {
  return (
    <TextField
    id="price-input"
    label={label}
    name="price"
    size="small"
    fullWidth
    required
    margin="dense"
    type="number"
    inputProps={{ step: 'any' }}
    disabled={disabled}
    onChange={onChange}
  />
  )
}
