// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @dev The current version of the contract.
string constant CONTRACT_VERSION = "1.0.0";

/// @title NFTMarketplace - Marketplace Contract for NFTs
/// @dev This contract allows users to create, buy, sell, and cancel listings for NFTs.
contract NFTMarketplace is  Initializable, UUPSUpgradeable, ReentrancyGuardUpgradeable{
    using Counters for Counters.Counter;
    Counters.Counter private _itemsinSale;

    uint256 listingPrice;
    address payable owner;


    struct MarketItem {
      uint256 tokenId;
      address nftContract;
      address payable seller;
      address payable owner;
      uint256 price;
      bool inSale;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
      uint256 indexed tokenId,
      address indexed nftContract,
      address seller,
      address owner,
      uint256 price,
      bool inSale
    );

    event MarketItemInSale (
      uint256 indexed tokenId,
      address indexed nftContract
    );

    event MarketItemSellCancelled (
      uint256 indexed tokenId,
      address indexed nftContract
    );

    event MarketItemBought (
      uint256 indexed tokenId,
      address indexed nftContract
    );
     
    /// @dev Initializes the marketplace contract.
    /// @param _listingfees The listing fee for creating a marketplace item.
    function initialize(uint256 _listingfees) public initializer {
        // Set the contract owner to the address that deployed the contract.
        owner = payable(msg.sender);
        listingPrice = _listingfees;

    }

    /* Updates the listing price of the contract */
    /// @dev Updates the listing price of the marketplace contract.
    /// @param _listingPrice The new listing price.
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    /// @dev Returns the listing price of the marketplace contract.
    /// @return The listing price.
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    /// @dev Creates a new marketplace item.
    /// @param nftContract The address of the NFT contract.
    /// @param tokenId The ID of the NFT.
    /// @param price The price of the NFT.
    function createMarketItem(
      address nftContract,
      uint256 tokenId,
      uint256 price
    ) public payable nonReentrant {
      require(price > 0, "Price must be at least 1 wei");
      //require(msg.value == listingPrice, "Price must be equal to listing price");
    

      idToMarketItem[tokenId] =  MarketItem(
        tokenId,
        nftContract,
        payable(msg.sender),
        payable(address(this)),
        price,
        true
      );

      IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
      emit MarketItemCreated(
        tokenId,
        nftContract,
        msg.sender,
        address(this),
        price,
        true
      );
    }

    /* Buy of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    /// @dev Buys a marketplace item.
    /// @param nftContract The address of the NFT contract.
    /// @param tokenId The ID of the NFT.
    function createMarketBuy(
      address nftContract,
      uint256 tokenId
      ) public payable nonReentrant{
      uint price = idToMarketItem[tokenId].price;
      //require(msg.value == price, "Please submit the asking price in order to complete the purchase");
    
      address seller= idToMarketItem[tokenId].seller;
      payable(seller).transfer(msg.value);
      IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
      idToMarketItem[tokenId].owner = payable(msg.sender);
      idToMarketItem[tokenId].inSale = false;
      
      _itemsinSale.increment();
      // payable(owner).transfer(listingPrice);
      delete idToMarketItem[tokenId];

      emit MarketItemBought(
        tokenId,
        nftContract
      );
    }

    /* Sell of a marketplace item */
    /// @dev Lists an NFT for sale in the marketplace.
    /// @param nftContract The address of the NFT contract.
    /// @param tokenId The ID of the NFT.
    /// @param price The price of the NFT.
    function createMarketResell(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
      require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "NFT not yours");
      require(idToMarketItem[tokenId].inSale == false, "NFT already listed");
      require(price > 0, "Amount must be higher than 0");
      require(msg.value == listingPrice, "Please transfer 0.0025 crypto to pay listing fee");
      
      idToMarketItem[tokenId] =  MarketItem(tokenId,nftContract, payable(msg.sender), payable(address(this)), price, false);
      IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
      // change owner, seller, inSale
      emit MarketItemInSale(
        tokenId,
        nftContract
      );
      
  }
    /* cancelSale of a marketplace item */
    /// @dev Cancels the sale of a marketplace item.
    /// @param nftContract The address of the NFT contract.
    /// @param tokenId The ID of the NFT.
    function cancelSale(address nftContract, uint256 tokenId) public nonReentrant {
      require(idToMarketItem[tokenId].seller == msg.sender, "NFT not yours");
      IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
      delete idToMarketItem[tokenId];
      emit MarketItemSellCancelled(
        tokenId,
        nftContract
      );
    
    }

    // /* Get All items of a marketplace item */
    // function fetchMarketItems() public view returns (MarketItem[] memory) {
    //   uint itemCount = _itemIds.current();
    //   uint uninSaleItemCount = _itemIds.current() - _itemsinSale.current();
    //   uint currentIndex = 0;

    //   MarketItem[] memory items = new MarketItem[](uninSaleItemCount);
    //   for (uint i = 0; i < itemCount; i++) {
    //     if (idToMarketItem[i + 1].owner == address(this)) {
    //       uint currentId = i + 1;
    //       MarketItem storage currentItem = idToMarketItem[currentId];
    //       items[currentIndex] = currentItem;
    //       currentIndex += 1;
    //     }
    //   }
    //   return items;
    // }
    
    /// @dev Authorizes the contract upgrade.
    /// @param newImplementation The address of the new implementation contract.
    function _authorizeUpgrade(address newImplementation) internal override {}

     
    /// @dev Returns the version of the contract.
    /// @return The version string.
    function getVersion() external pure returns(string memory){
        return CONTRACT_VERSION;
    }

    function getMessage() external pure returns(string memory){
        return "ugrade new imp";
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;

    
}