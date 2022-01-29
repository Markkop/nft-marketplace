import { Container, Typography, Box } from '@mui/material'

export default function PageMessageBox ({ text, children }) {
  return (
    <Container >
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        flexShrink: 1,
        p: 1,
        m: 1
      }} >
        <Typography variant="body3" color="text.secondary" >
          {text}
        </Typography>
        {children}
      </Box>
    </Container>
  )
}
