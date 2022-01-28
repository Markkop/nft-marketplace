import CardAddress from '../atoms/CardAddress'

export default function CardAddresses ({ nft }) {
  const isAvailable = !nft.sold && !nft.canceled
  return (
    <>
      <CardAddress title="Creator" address={nft.creator} />
      <CardAddress title="Owner" address={nft.owner} />
      {isAvailable && <CardAddress title="Seller" address={nft.seller} />}
    </>
  )
}
