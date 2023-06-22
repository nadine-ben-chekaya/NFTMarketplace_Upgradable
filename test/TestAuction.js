const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
// use it when we do the transfer of the funds
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
//Allow us to do comparaison
const { expect } = require("chai");
const { ethers } = require("hardhat");
const defaultAuctionFees = ethers.utils.parseUnits("0.01", "ether");
const StartingBid = ethers.utils.parseUnits("0.01", "ether");
const Bid1 = ethers.utils.parseUnits("0.02", "ether");
const Bid2 = ethers.utils.parseUnits("0.025", "ether");
describe("Auction", function () {
  async function AuctionDeploy(){
    //Get Accounts
    const[owner, act1, act2, act3] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await upgrades.deployProxy(Auction, [defaultAuctionFees], { initializer: 'initialize'});
    //console.log(auction.address);
    return { auction, defaultAuctionFees, owner, act1, act2, act3};
  }

  async function CollectionDeploy(){
    //Get Accounts
    const[ownernft] = await ethers.getSigners();
    const name= "nadineMarket";
    const symb = "NM";
    const Collection = await ethers.getContractFactory("Collection");
    const collection = await upgrades.deployProxy(Collection, [name,symb], { initializer: 'initialize'});
    //console.log(collection.address);
    return { collection, ownernft, name, symb};
  }

  describe("Deployment", function(){
    //CHECK VARIABLES 
    it("should check auction fees", async function(){
      const {auction, defaultAuctionFees}= await loadFixture(AuctionDeploy);
      expect(await auction.getAuctionfees()).to.equal(defaultAuctionFees);
    });
  });

  describe("Start Auction", function(){
    it("NFT owner should Start the Auction", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);
      await expect(auction.connect(act1).start(collection.address,1,StartingBid,EndTime)).to.be.revertedWith(
        "NFT not yours"
      );

    });

    it("Auction end Time should be in future", async function(){
      const EndTime= (await time.latest());
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);
      await expect(auction.start(collection.address,1,StartingBid,EndTime)).to.be.revertedWith(
        "End Time should be in future"
      );

    });

    it("Start Auction not reverted when condition are respected", async function(){
      const EndTime= (await time.latest())+ 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);
      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;

    });


  });

  describe("Bid Auction", function(){
    it("The seller could not make a bid", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      await expect(auction.connect(ownernft).bid(1, {value: Bid1})).to.be.revertedWith(
        "You are the seller!!"
      );
    });

    it("Bidder Already win a previous bid", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1, act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
     
      await expect(auction.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
      await expect(auction.connect(act1).bid(1, {value: Bid2})).to.be.revertedWith(
        "You already win a bid!!"
      );
      const AucItem= await auction.getAuction(1);
      //console.log("Auction Item=", AucItem);
    });

    it("Should make a bid before end time", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1, act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      // Jump to end time
      await time.increaseTo(EndTime);
      await expect(auction.connect(ownernft).end(1)).not.to.be.reverted;
      
      await expect(auction.connect(act2).bid(1, {value: Bid1})).to.be.revertedWith(
        "Time's up!"
      );
      const AucItem= await auction.getAuction(1);
      //console.log("Auction Item=", AucItem);
    });

    it("Bid should be higher then the previous one", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1, act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      await expect(auction.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
      await expect(auction.connect(act2).bid(1, {value: StartingBid})).to.be.revertedWith(
        "low bid"
      );
      const AucItem= await auction.getAuction(1);
      //console.log("Auction Item=", AucItem);
    });

    it("Bidder should send bid", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1, act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
      await expect(auction.connect(act2).bid(1)).to.be.reverted;
      const AucItem= await auction.getAuction(1);
      //console.log("Auction Item=", AucItem);
    });
    
    it("Bid Auction not reverted when condition are respected", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1, act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      await expect(auction.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
      await expect(auction.connect(act2).bid(1, {value: Bid2})).not.to.be.reverted;
      const AucItem= await auction.getAuction(1);
      //console.log("Auction Item=", AucItem);
    });
    //Balance of provious buyer

  });

  describe("End Auction", function(){
    it("Only Seller should end his auction", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      await expect(auction.connect(act1).end(1)).to.be.revertedWith(
        "Your not the seller!"
      );
    });

    it("Cannot end the auction before time's up", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
    
      await expect(auction.connect(ownernft).end(1)).to.be.revertedWith(
        "Auction is still ongoing!"
      );
    });

  });

  describe("EVENTS", function(){
    it("Should emit the event on Start", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).to.emit(auction, "AuctionCreated").withArgs(1,ownernft.address);
      
    });

    it("Should emit the event on Bid", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);
      
      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      await expect(auction.connect(act1).bid(1, {value: Bid1})).to.emit(auction, "BidPlaced").withArgs(
        1,
        act1.address,
        Bid1);
      
    });

    it("Should emit the event on End", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
      // Jump to end time
      await time.increaseTo(EndTime);

      await expect(auction.connect(ownernft).end(1)).to.emit(auction, "AuctionFinished").withArgs(1);
      
    });

  });

  describe("Transfers", function(){
    it("NFT owner should be SC when we start an auction", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1,act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
      expect(await collection.ownerOf(1)).to.equal(auction.address);
      
    });

    it("Sc should receive funds from buyer after bidding", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1,act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      const SCBalanceBeforeBid= await ethers.provider.getBalance(auction.address);
      const BuyerBalanceBeforeBid= await ethers.provider.getBalance(act1.address);
      console.log("Balance of SC before Bid=", SCBalanceBeforeBid);
      console.log("Balance of Buyer before Bid=", BuyerBalanceBeforeBid);
      const bidtx= await auction.connect(act1).bid(1, {value: Bid1});
      const SCBalanceAfterBid= await ethers.provider.getBalance(auction.address);
      const BuyerBalanceAfterBid= await ethers.provider.getBalance(act1.address);
      
      console.log("Balance of SC After Bid=", SCBalanceAfterBid);
      console.log("Balance of Buyer before Bid=", BuyerBalanceAfterBid);
      await expect(auction.connect(act2).bid(1, {value: Bid2})).not.to.be.reverted;
      const SCBalanceAfterBid2= await ethers.provider.getBalance(auction.address);
      const BuyerBalanceAfterBid2= await ethers.provider.getBalance(act1.address);
      console.log("Balance of SC After Bid2=", SCBalanceAfterBid2);
      console.log("Balance of Buyer before Bid2=", BuyerBalanceAfterBid2);
    });

    it("Seller should receive funds from buyer(Highest Bidder) after Ending the auction", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1,act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      // const SellerBalanceBeforeBid= await ethers.provider.getBalance(ownernft.address);
      // const BuyerBalanceBeforeBid= await ethers.provider.getBalance(act1.address);
      // console.log("Balance of Seller before Bid=", SellerBalanceBeforeBid);
      // console.log("Balance of Buyer before Bid=", BuyerBalanceBeforeBid);
      console.log("Bid=", Bid1);
      await expect(auction.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
      // Jump to end time
      await time.increaseTo(EndTime);
      await expect(auction.connect(ownernft).end(1)).not.to.be.reverted;
      // const SellerBalanceAfterBid= await ethers.provider.getBalance(ownernft.address);
      // const BuyerBalanceAfterBid= await ethers.provider.getBalance(act1.address);
      // console.log("Balance of Seller After Bid=", SellerBalanceAfterBid);
      // console.log("Balance of Buyer After Bid=", BuyerBalanceAfterBid);
    });

    it("Highest Bidder should become the nft owner after Ending the auction", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1,act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
      await expect(auction.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
      // Jump to end time
      await time.increaseTo(EndTime);
      await expect(auction.connect(ownernft).end(1)).not.to.be.reverted;
      expect(await collection.ownerOf(1)).to.equal(act1.address);
    });

    it("Seller receive NFT after Ending the auction, if no one make a bid", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1,act2}= await loadFixture(AuctionDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",auction.address);

      await expect(auction.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      // Jump to end time
      await time.increaseTo(EndTime);
      await expect(auction.connect(ownernft).end(1)).not.to.be.reverted;
      expect(await collection.ownerOf(1)).to.equal(ownernft.address);
      const auc = await auction.getAuction(1);
      console.log("auc=", auc.sellToken);
      expect(auc.sellToken).to.equal("0x0000000000000000000000000000000000000000");

    });

  });
  
  describe("Upgrades", function(){
    it("Should be upgraded successfully, version 2.0.0", async function(){
      const EndTime= (await time.latest()) + 120;
      const {auction, owner, act1}= await loadFixture(AuctionDeploy);

      //expect(await auction.getVersion()).to.equal("1.0.0");

      const Auction = await ethers.getContractFactory("Auction");
      const Auctionv2 = await upgrades.upgradeProxy(auction.address,Auction);
      expect(await auction.getVersion()).to.equal("2.0.0");
    });
  });

});