// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';


// TO DO: Explain the reason/advantadge to use ERC721URIStorage instead of ERC721 itself
contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  // Counters allow us to keep track of tokenIds

  // Address of Marketplace for NFTs to interact
  address contractAddress;

  constructor(address marketplaceAddress) ERC721('MarkKop', 'MARK') {
    contractAddress = marketplaceAddress;

  }

  function mintToken(string memory tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);

    // Give the marketplace approval to transact NFTs between users
    setApprovalForAll(contractAddress, true);
    return newItemId;
  }
}