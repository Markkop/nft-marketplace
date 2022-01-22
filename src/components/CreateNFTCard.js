
import { useContext, useState } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Web3Context } from './providers/Web3Provider'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px 15px',
    flexGrow: 1
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  }
})

export default function CreateNFTCard () {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg')
  const classes = useStyles()
  const { register, handleSubmit } = useForm()
  const { nftContract } = useContext(Web3Context)

  async function createNft (metadataUrl) {
    const transaction = await nftContract.mintToken(metadataUrl)
    await transaction.wait()
  }

  function createNFTFormDataFile (name, description, price, file) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('file', file)
    return formData
  }

  async function uploadFileToIPFS (formData) {
    const { data } = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return data.url
  }

  async function onFileChange (event) {
    if (!event.target.files[0]) return
    setFile(event.target.files[0])
    setFileUrl(URL.createObjectURL(event.target.files[0]))
  }

  async function onSubmit ({ name, description, price }) {
    const formData = createNFTFormDataFile(name, description, price, file)
    const metadataUrl = await uploadFileToIPFS(formData)
    await createNft(metadataUrl)
    router.reload(window.location.pathname)
  }

  return (
    <Card className={classes.root} sx={{ maxWidth: 345 }} component="form" onSubmit={handleSubmit(onSubmit)}>
      <CardContent>
        <label htmlFor="file-input">
          <CardMedia
            className={classes.media}
            alt='Upload image'
            image={fileUrl}
          />
        </label>
        <input
            style={{ display: 'none' }}
            type="file"
            name="file"
            id="file-input"
            onChange={onFileChange}
          />
        <TextField
          id="name-input"
          label="Name"
          name="name"
          size="small"
          fullWidth
          required
          margin="dense"
          {...register('name')}
        />
        <TextField
          id="price-input"
          label="Price"
          name="price"
          size="small"
          fullWidth
          required
          margin="dense"
          type="number"
          inputProps={{ step: 'any' }}
          {...register('price')}
        />
         <TextField
          id="description-input"
          label="Description"
          description="description"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          {...register('description')}
        />
      </CardContent>
      <CardActions>
        <Button size="small" type="submit">Create</Button>
      </CardActions>
    </Card>
  )
}
