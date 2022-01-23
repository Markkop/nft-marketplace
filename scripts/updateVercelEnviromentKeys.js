const axios = require('axios')
const hre = require('hardhat')

const vercelUrl = 'https://api.vercel.com'

async function getProjectEnvironmentVariablesIds (...envNames) {
  try {
    const { data: { envs } } = await axios.get(`${vercelUrl}/v8/projects/${process.env.VERCEL_PROJECT_ID}/env`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    })

    return envs.reduce((envIds, env) => {
      if (!envNames.includes(env.key)) return envIds
      envIds[env.key] = env.id
      return envIds
    }, {})
  } catch (error) {
    console.log(error)
  }
}

async function updateVercelEnviromentVariableByNames (...envNames) {
  try {
    const envIds = await getProjectEnvironmentVariablesIds(...envNames)
    for (const envName in envIds) {
      await updateVercelEnviromentVariableById(envIds[envName], process.env[envName])
      console.log(`Vercel env ${process.env[envName]} updated`)
    }
  } catch (error) {
    console.log(error)
  }
}
async function updateVercelEnviromentVariableById (id, newValue) {
  try {
    await axios.patch(`${vercelUrl}/v8/projects/${process.env.VERCEL_PROJECT_ID}/env/${id}`, {
      value: newValue
    }, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    })
  } catch (error) {
    console.log(error)
  }
}

async function main () {
  const networkName = hre.network.name.toUpperCase()
  await updateVercelEnviromentVariableByNames(`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`, `NFT_CONTRACT_ADDRESS_${networkName}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
