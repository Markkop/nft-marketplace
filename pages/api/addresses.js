const { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } = process.env

export default function handler (req, res) {
  res.status(200).json({
    marketplaceAddress: MARKETPLACE_CONTRACT_ADDRESS,
    nftAddress: NFT_CONTRACT_ADDRESS
  })
}
