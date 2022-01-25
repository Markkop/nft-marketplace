import { Box, Button, Container, Typography } from '@mui/material'

export default function InstallMetamask () {
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
        You need Metamask to interact with this Marketplace
        </Typography>
        <Button
          variant='outlined'
          color='primary'
          onClick={() => window.open('https://metamask.io/', '_blank')}
          sx={{
            maxWidth: 600,
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          { 'Download now' }
        </Button>
      </Box>
    </Container>
  )
}
