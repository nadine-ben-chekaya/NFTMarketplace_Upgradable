// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

string constant CONTRACT_VERSION = "2.0.0";
contract Auction is  Initializable, UUPSUpgradeable, ReentrancyGuardUpgradeable{ 
    using Counters for Counters.Counter;
    Counters.Counter private _auctionIds;

    /// @dev auction struct
    struct auction {
        // asset that is being sold at auction
        address sellToken;
        uint sellTokenId;
        // the time when auction ends
        uint256 endTime;
        // information about the current highest bid
        uint256 lastBid;
        // seller address
        address payable seller;
        // buyer address
        address payable buyer;
        // the minimal amount of the first bid
        uint256 startingPrice;
    }

    /// @dev mapping to store data of auctions for auctionId
    mapping(uint => auction) auctions;

    event AuctionCreated(uint indexed auctionId, address seller);
    event BidPlaced(uint indexed auctionId, address buyer, uint256 lastBid);
    event AuctionFinished(uint indexed auctionId);

    uint256 auctionfees;
    
    function initialize(uint256 _auctionfees) public initializer {
        auctionfees = _auctionfees;

    }

    function getAuctionfees() public view returns (uint256) {
      return auctionfees;
    }

    function start(address _nft, uint _nftId, uint256 startingBid, uint256 _endtime) external {
        
        require(IERC721Upgradeable(_nft).ownerOf(_nftId) == msg.sender, "NFT not yours");
        require(_endtime> block.timestamp, "End Time should be in future");
        _auctionIds.increment();
        uint256 currentAuctionId = _auctionIds.current();
        uint256 endAt= _endtime;
        auction memory auc = auction(
            _nft,
            _nftId,
            endAt,
            startingBid,
            payable(msg.sender),
            payable(address(0)),
            startingBid
        );
        auctions[currentAuctionId] = auc;
    
        IERC721Upgradeable(_nft).transferFrom(msg.sender, address(this), _nftId);
        
        emit AuctionCreated(currentAuctionId,msg.sender);
    }

    function bid(uint _auctionId) external payable {
        auction memory currentAuction = auctions[_auctionId];
        require(msg.sender!=currentAuction.seller,"You are the seller!!");
        require(msg.sender!=currentAuction.buyer,"You already win a bid!!");
        require(block.timestamp <= currentAuction.endTime, "Time's up!");
        require(msg.value > currentAuction.lastBid, "low bid");
        address payable newBuyer = payable(msg.sender);
        if (currentAuction.buyer != address(0)) {
            uint bal = currentAuction.lastBid;
            payable(currentAuction.buyer).transfer(bal);
        }

        auctions[_auctionId].lastBid = msg.value;
        auctions[_auctionId].buyer = payable(msg.sender);

        emit BidPlaced(_auctionId, auctions[_auctionId].buyer, auctions[_auctionId].lastBid);
    }

    function end(uint _auctionId) external {
        auction memory currentAuction = auctions[_auctionId];
        require(msg.sender == currentAuction.seller, "Your not the seller!");
        require(block.timestamp >= currentAuction.endTime, "Auction is still ongoing!");
        
        if (currentAuction.buyer != address(0)) {
            IERC721Upgradeable(currentAuction.sellToken).transferFrom(address(this),currentAuction.buyer, currentAuction.sellTokenId);
            payable(msg.sender).transfer(currentAuction.lastBid);
        } else {
            IERC721Upgradeable(currentAuction.sellToken).transferFrom(address(this),currentAuction.seller, currentAuction.sellTokenId);
        }
        delete auctions[_auctionId];
        emit AuctionFinished(_auctionId);
    }

    function getAuction(uint _auctionId) external view returns(auction memory){
        auction memory currentAuction = auctions[_auctionId];
        return currentAuction;
    }

    function getVersion() external pure returns (string memory) {
        return CONTRACT_VERSION;
    }

    function _authorizeUpgrade(address newImplementation) internal override {}

    uint256[50] private __gap;

    
}