import CardAddress from '../atoms/CardAddress'

export default function CardAddresses ({ nft, isSold }) {
  const sellerAddressTitle = isSold ? 'Last sold by' : 'Seller'

  return (
    <>
      <CardAddress title="Creator" address={nft.creator} />
      <CardAddress title="Owner" address={nft.owner} />
      {nft.seller && <CardAddress title={sellerAddressTitle} address={nft.seller} />}
    </>
  )
}
