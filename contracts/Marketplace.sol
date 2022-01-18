// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Security agains transactions for multiple requests
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _marketItemIds;
    Counters.Counter private _tokensSold;

    address payable owner;

    // Challenge: make this price dynamic according to the current currency price
    uint256 listingFee = 0.045 ether;

    mapping(uint256 => MarketItem) private marketItemIdToMarketItem;

    struct MarketItem {
        uint256 marketItemId;
        address nftContractAddress;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemMinted(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function mintMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingFee,
            "Price must be equal to listing price"
        );
        _marketItemIds.increment();
        uint256 marketItemId = _marketItemIds.current();

        marketItemIdToMarketItem[marketItemId] = MarketItem(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContractAddress).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        emit MarketItemMinted(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );
    }

    function createMarketSale(address nftContractAddress, uint256 marketItemId)
        public
        payable
        nonReentrant
    {
        uint256 price = marketItemIdToMarketItem[marketItemId].price;
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to continue"
        );

        marketItemIdToMarketItem[marketItemId].seller.transfer(msg.value);
        IERC721(nftContractAddress).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );
        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].sold = true;
        _tokensSold.increment();

        payable(owner).transfer(listingFee);
    }

    function fetchUnsoldMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemsCount = _marketItemIds.current();
        uint256 unsoldItemsCount = _marketItemIds.current() -
            _tokensSold.current();
        MarketItem[] memory marketItems = new MarketItem[](unsoldItemsCount);

        uint256 currentIndex = 0;
        // Can't we refactor it with .push?
        for (uint256 i = 0; i < itemsCount; i++) {
            // Can't we use .sold?
            if (marketItemIdToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = marketItemIdToMarketItem[
                    currentId
                ];
                marketItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return marketItems;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemsCount = _marketItemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemsCount; i++) {
            if (marketItemIdToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // Is it that important to intialize an array with fixed length?
        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemsCount; i++) {
            if (marketItemIdToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = marketItemIdToMarketItem[i + 1]
                    .marketItemId;
                MarketItem storage currentItem = marketItemIdToMarketItem[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchCreatedItems() public view returns (MarketItem[] memory) {
        uint256 totalItemsCount = _marketItemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemsCount; i++) {
            if (marketItemIdToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        // Is it that important to intialize an array with fixed length?
        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemsCount; i++) {
            if (marketItemIdToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = marketItemIdToMarketItem[i + 1]
                    .marketItemId;
                MarketItem storage currentItem = marketItemIdToMarketItem[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}
