
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@mui/styles'
import { TextField, Card, CardActions, CardContent, CardMedia, Button } from '@mui/material'
import axios from 'axios'
import { Web3Context } from '../providers/Web3Provider'
import PriceTextField from '../atoms/PriceTextField'

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

export default function CreateNFTCard ({ addNFTToList }) {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg')
  const classes = useStyles()
  const { register, handleSubmit } = useForm()
  const { nftContract } = useContext(Web3Context)

  async function createNft (metadataUrl) {
    const transaction = await nftContract.mintToken(metadataUrl)
    const tx = await transaction.wait()
    const event = tx.events[0]
    const tokenId = event.args[2]
    return tokenId
  }

  function createNFTFormDataFile (name, description, file) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
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

  async function onSubmit ({ name, description }) {
    const formData = createNFTFormDataFile(name, description, file)
    const metadataUrl = await uploadFileToIPFS(formData)
    const tokenId = await createNft(metadataUrl)
    addNFTToList(tokenId)
  }

  return (
    <Card className={classes.root} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
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
        <PriceTextField label={'Price (create first)'} disabled={true}/>
         <TextField
          id="description-input"
          label="Description"
          name="description"
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
