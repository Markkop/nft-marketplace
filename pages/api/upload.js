import axios from 'axios'
import fs from 'fs'
import middleware from './middleware/middleware'
import nextConnect from 'next-connect'
import FormData from 'form-data'

const ipfsLocalBaseUrl = 'http://127.0.0.1:5001'
const ipfsInfuraBaseUrl = 'https://ipfs.infura.io'

const handler = nextConnect()
handler.use(middleware)

export const config = {
  api: {
    bodyParser: false
  }
}

handler.post(async function handlePost (request, response) {
  try {
    const ipfsBaseUrl = await getIpfsBaseUrl()
    const fileUrl = await uploadDataToIPFS(ipfsBaseUrl, request.files.file[0])
    return response.status(200).json({
      fileUrl
    })
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
})

async function getIpfsBaseUrl () {
  try {
    await axios.post(`${ipfsLocalBaseUrl}/api/v0/version`)
    return ipfsLocalBaseUrl
  } catch (error) {
    return ipfsInfuraBaseUrl
  }
}

async function uploadDataToIPFS (ipfsBaseUrl, data) {
  try {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(data.path), data.originalFileName)

    const { data: responseData } = await axios.post(`${ipfsBaseUrl}/api/v0/add`, formData, {
      headers: { 'Content-Type': `multipart/form-data; boundary=${formData._boundary}` }
    })

    const url = `https://ipfs.io/ipfs/${responseData.Hash}?filename=${responseData.Name}`

    return url
  } catch (error) {
    console.log(error)
  }
}

export default handler
