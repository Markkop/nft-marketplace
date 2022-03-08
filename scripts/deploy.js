const hre = require('hardhat')
const dotenv = require('dotenv')
const fs = require('fs')

function replaceEnvContractAddresses (marketplaceAddress, nftAddress, erc20Address, networkName) {
  const envFileName = '.env.local'
  const envFile = fs.readFileSync(envFileName, 'utf-8')
  const env = dotenv.parse(envFile)
  env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`] = marketplaceAddress
  env[`NFT_CONTRACT_ADDRESS_${networkName}`] = nftAddress
  env[`ERC20_CONTRACT_ADDRESS_${networkName}`] = erc20Address
  const newEnv = Object.entries(env).reduce((env, [key, value]) => {
    return `${env}${key}=${value}\n`
  }, '')

  fs.writeFileSync(envFileName, newEnv)
}

async function main () {
  process.env.IS_RUNNING = true
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed()
  console.log('Marketplace deployed to:', marketplace.address)

  const NFT = await hre.ethers.getContractFactory('NFT')
  const nft = await NFT.deploy(marketplace.address)
  await nft.deployed()
  console.log('Nft deployed to:', nft.address)

  const ERC20 = await hre.ethers.getContractFactory('MarkToken')
  const erc20 = await ERC20.deploy()
  await erc20.deployed()
  console.log('Erc20 deployed to:', erc20.address)

  replaceEnvContractAddresses(marketplace.address, nft.address, erc20.address, hre.network.name.toUpperCase())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
