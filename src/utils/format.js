export function shortenAddress (address) {
  if (!address) return ''
  return address.slice(0, 8)
}
