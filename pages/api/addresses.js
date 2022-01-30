export default function handler (req, res) {
  const network = req.query.network
  res.status(200).json({
    marketplaceAddress: process.env[`MARKETPLACE_CONTRACT_ADDRESS_${network}`],
    nftAddress: process.env[`NFT_CONTRACT_ADDRESS_${network}`],
    erc20Address: process.env[`ERC20_CONTRACT_ADDRESS_${network}`]
  })
}
