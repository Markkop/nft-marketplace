import { Button } from '@mui/material'
import PageMessageBox from './PageMessageBox'

export default function InstallMetamask () {
  return (
    <PageMessageBox
      text="You need Metamask to interact with this Marketplace"
    >
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
    </PageMessageBox>
  )
}
