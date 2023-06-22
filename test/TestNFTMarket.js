const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
// use it when we do the transfer of the funds
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
//Allow us to do comparaison
const { expect } = require("chai");
const { ethers } = require("hardhat");
const defaultListingFees = ethers.utils.parseUnits("0.01", "ether");
const defaultListingFees2 = ethers.utils.parseUnits("0.02", "ether");
const defaultNFTPrice = ethers.utils.parseUnits("0.01", "ether");
const Bid1 = ethers.utils.parseUnits("0.02", "ether");
const Bid2 = ethers.utils.parseUnits("0.025", "ether");
describe("Marketplace", function () {
  async function MarketplaceDeploy(){
    //Get Accounts
    const[owner, act1, act2, act3] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await upgrades.deployProxy(NFTMarketplace, [defaultListingFees], { initializer: 'initialize'});
    //console.log(marketplace.address);
    return { marketplace, defaultListingFees, owner, act1, act2, act3};
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
    it("should check Listing fees", async function(){
      const {marketplace, defaultListingFees}= await loadFixture(MarketplaceDeploy);
      expect(await marketplace.getListingPrice()).to.equal(defaultListingFees);
    });

    it("should check Owner", async function(){
        const {marketplace, defaultListingFees, owner}= await loadFixture(MarketplaceDeploy);
        expect(await marketplace.getOwner()).to.equal(owner.address);
    });

    it("Only owner can update Listing fees", async function(){
        const {marketplace, defaultListingFees, owner, act1}= await loadFixture(MarketplaceDeploy);
        await expect(marketplace.connect(act1).updateListingPrice(defaultListingFees2)).to.be.revertedWith(
            "Only marketplace owner can update listing price."
        );
        const uLF= await marketplace.getListingPrice();
        console.log(" updated listing fees=", uLF);
    });

    it("Should update Listing fees successfully", async function(){
        const {marketplace, defaultListingFees, owner, act1}= await loadFixture(MarketplaceDeploy);
        await marketplace.updateListingPrice(defaultListingFees2)
        const uLF= await marketplace.getListingPrice();
        console.log(" updated listing fees=", uLF);

        expect(await marketplace.getListingPrice()).to.equal(defaultListingFees2);
    });
  });

  describe("createMarketItem", function(){
    it("Price must be at least 1 wei", async function(){
      const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI",marketplace.address);
      await expect(marketplace.createMarketItem(collection.address,1,0,{value: defaultListingFees})).to.be.revertedWith(
        "Price must be at least 1 wei"
      );

    });

    it("You should send the listing fees", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI",marketplace.address);
        await expect(marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: 0})).to.be.revertedWith(
          "Must send listing price"
        );

    });
  });

  describe("createMarketBuy", function(){
    it("Buyer must send the right price", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI",marketplace.address);

        await expect(marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees})).not.to.be.reverted;
        await expect(marketplace.createMarketBuy(collection.address,1)).to.be.revertedWith(
            "Please submit the asking price in order to complete the purchase"
        );
    });
  });

  describe("createMarketResell", function(){
    it("Seller should own the NFT", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice, {value: defaultListingFees});
        await marketplace.connect(act1).createMarketBuy(collection.address,1,{value: defaultNFTPrice});
        const ow = await collection.ownerOf(1);
        console.log("ownerof nft=", ow);
        console.log("Buyyer of nft=", act1.address);
        await collection.connect(act1).MySetApproval(marketplace.address);
        await expect(marketplace.connect(owner).createMarketResell(collection.address, 1, defaultNFTPrice, {value: defaultListingFees})).to.be.revertedWith(
            "NFT not yours"
        );
    });

    it("Seller should put NFT in sell with price >0", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        await marketplace.connect(act1).createMarketBuy(collection.address,1,{value: defaultNFTPrice});
        const ow = await collection.ownerOf(1);
        console.log("ownerof nft=", ow);
        console.log("Buyyer of nft=", act1.address);
        await collection.connect(act1).MySetApproval(marketplace.address);
        //await marketplace.connect(act1).createMarketResell(collection.address, 1, defaultNFTPrice, {value: defaultListingFees});
        await expect(marketplace.connect(act1).createMarketResell(collection.address, 1, 0, {value: defaultListingFees})).to.be.revertedWith(
            "Amount must be higher than 0"
        );
    });

    it("Seller should transfer the required fees", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        await marketplace.connect(act1).createMarketBuy(collection.address,1,{value: defaultNFTPrice});
        const ow = await collection.ownerOf(1);
        console.log("ownerof nft=", ow);
        console.log("Buyyer of nft=", act1.address);
        await collection.connect(act1).MySetApproval(marketplace.address);
        //await marketplace.connect(act1).createMarketResell(collection.address, 1, defaultNFTPrice, {value: defaultListingFees});
        await expect(marketplace.connect(act1).createMarketResell(collection.address, 1, defaultNFTPrice, {value: 0})).to.be.revertedWith(
            "Please transfer crypto to pay listing fee"
        );
    });
  });

  describe("cancelSale", function(){
    it("Seller should own the NFT to cancel it", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        
        await expect(marketplace.connect(act1).cancelSale(collection.address, 1)).to.be.revertedWith(
            "NFT not yours"
        );
    });

  });

  describe("EVENTS", function(){
    it("Should emit the event on MarketItemCreated", async function(){
      const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
      const {collection, ownernft}= await loadFixture(CollectionDeploy); 
      const nftID= await collection.safeMint("URI1",marketplace.address);

      await expect(marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees})).to.emit(marketplace, "MarketItemCreated").withArgs(
        1,
        collection.address,
        ownernft.address,
        marketplace.address,
        defaultNFTPrice,
        true
        );
      
    });

    it("Should emit the event on createMarketBuy", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        await expect(marketplace.connect(act1).createMarketBuy(collection.address, 1, {value: defaultNFTPrice})).to.emit(marketplace, "MarketItemBought").withArgs(
          1,
          collection.address
        );
        
    });

    it("Should emit the event on createMarketResell", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        await marketplace.connect(act1).createMarketBuy(collection.address,1,{value: defaultNFTPrice});
        const ow = await collection.ownerOf(1);
        console.log("ownerof nft=", ow);
        console.log("Buyyer of nft=", act1.address);
        await collection.connect(act1).MySetApproval(marketplace.address);
        await expect(marketplace.connect(act1).createMarketResell(collection.address, 1, defaultNFTPrice, {value: defaultListingFees})).to.emit(marketplace, "MarketItemInSale").withArgs(
          1,
          collection.address
        );
        
    });

    it("Should emit the event on cancelSale", async function(){
        const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);
        const {collection, ownernft}= await loadFixture(CollectionDeploy); 
        const nftID= await collection.safeMint("URI1",marketplace.address);
        
        await marketplace.createMarketItem(collection.address,1,defaultNFTPrice,{value: defaultListingFees});
        //await marketplace.connect(act1.address).createMarketBuy(collection.address,1,defaultNFTPrice);
        await expect(marketplace.cancelSale(collection.address, 1)).to.emit(marketplace, "MarketItemSellCancelled").withArgs(
          1,
          collection.address
        );
        
    });

  });

//   describe("Transfers", function(){
//     it("NFT owner should be SC when we start an marketplace", async function(){
//       const EndTime= (await time.latest()) + 120;
//       const {marketplace, owner, act1,act2}= await loadFixture(marketplaceDeploy);
//       const {collection, ownernft}= await loadFixture(CollectionDeploy); 
//       const nftID= await collection.safeMint("URI",marketplace.address);

//       await expect(marketplace.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
//       expect(await collection.ownerOf(1)).to.equal(marketplace.address);
      
//     });

//     it("Sc should receive funds from buyer after bidding", async function(){
//       const EndTime= (await time.latest()) + 120;
//       const {marketplace, owner, act1,act2}= await loadFixture(marketplaceDeploy);
//       const {collection, ownernft}= await loadFixture(CollectionDeploy); 
//       const nftID= await collection.safeMint("URI",marketplace.address);

//       await expect(marketplace.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
//       const SCBalanceBeforeBid= await ethers.provider.getBalance(marketplace.address);
//       const BuyerBalanceBeforeBid= await ethers.provider.getBalance(act1.address);
//       console.log("Balance of SC before Bid=", SCBalanceBeforeBid);
//       console.log("Balance of Buyer before Bid=", BuyerBalanceBeforeBid);
//       const bidtx= await marketplace.connect(act1).bid(1, {value: Bid1});
//       const SCBalanceAfterBid= await ethers.provider.getBalance(marketplace.address);
//       const BuyerBalanceAfterBid= await ethers.provider.getBalance(act1.address);
      
//       console.log("Balance of SC After Bid=", SCBalanceAfterBid);
//       console.log("Balance of Buyer before Bid=", BuyerBalanceAfterBid);
//       await expect(marketplace.connect(act2).bid(1, {value: Bid2})).not.to.be.reverted;
//       const SCBalanceAfterBid2= await ethers.provider.getBalance(marketplace.address);
//       const BuyerBalanceAfterBid2= await ethers.provider.getBalance(act1.address);
//       console.log("Balance of SC After Bid2=", SCBalanceAfterBid2);
//       console.log("Balance of Buyer before Bid2=", BuyerBalanceAfterBid2);
//     });

//     it("Seller should receive funds from buyer(Highest Bidder) after Ending the marketplace", async function(){
//       const EndTime= (await time.latest()) + 120;
//       const {marketplace, owner, act1,act2}= await loadFixture(marketplaceDeploy);
//       const {collection, ownernft}= await loadFixture(CollectionDeploy); 
//       const nftID= await collection.safeMint("URI",marketplace.address);

//       await expect(marketplace.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
//       // const SellerBalanceBeforeBid= await ethers.provider.getBalance(ownernft.address);
//       // const BuyerBalanceBeforeBid= await ethers.provider.getBalance(act1.address);
//       // console.log("Balance of Seller before Bid=", SellerBalanceBeforeBid);
//       // console.log("Balance of Buyer before Bid=", BuyerBalanceBeforeBid);
//       console.log("Bid=", Bid1);
//       await expect(marketplace.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
//       // Jump to end time
//       await time.increaseTo(EndTime);
//       await expect(marketplace.connect(ownernft).end(1)).not.to.be.reverted;
//       // const SellerBalanceAfterBid= await ethers.provider.getBalance(ownernft.address);
//       // const BuyerBalanceAfterBid= await ethers.provider.getBalance(act1.address);
//       // console.log("Balance of Seller After Bid=", SellerBalanceAfterBid);
//       // console.log("Balance of Buyer After Bid=", BuyerBalanceAfterBid);
//     });

//     it("Highest Bidder should become the nft owner after Ending the marketplace", async function(){
//       const EndTime= (await time.latest()) + 120;
//       const {marketplace, owner, act1,act2}= await loadFixture(marketplaceDeploy);
//       const {collection, ownernft}= await loadFixture(CollectionDeploy); 
//       const nftID= await collection.safeMint("URI",marketplace.address);

//       await expect(marketplace.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
      
//       await expect(marketplace.connect(act1).bid(1, {value: Bid1})).not.to.be.reverted;
//       // Jump to end time
//       await time.increaseTo(EndTime);
//       await expect(marketplace.connect(ownernft).end(1)).not.to.be.reverted;
//       expect(await collection.ownerOf(1)).to.equal(act1.address);
//     });

//     it("Seller receive NFT after Ending the marketplace, if no one make a bid", async function(){
//       const EndTime= (await time.latest()) + 120;
//       const {marketplace, owner, act1,act2}= await loadFixture(marketplaceDeploy);
//       const {collection, ownernft}= await loadFixture(CollectionDeploy); 
//       const nftID= await collection.safeMint("URI",marketplace.address);

//       await expect(marketplace.start(collection.address,1,StartingBid,EndTime)).not.to.be.reverted;
//       // Jump to end time
//       await time.increaseTo(EndTime);
//       await expect(marketplace.connect(ownernft).end(1)).not.to.be.reverted;
//       expect(await collection.ownerOf(1)).to.equal(ownernft.address);
//       const auc = await marketplace.getmarketplace(1);
//       console.log("auc=", auc.sellToken);
//       expect(auc.sellToken).to.equal("0x0000000000000000000000000000000000000000");

//     });

//   });
  
  describe("Upgrades", function(){
    it("Should be upgraded successfully, version 2.0.0", async function(){
      const {marketplace, owner, act1}= await loadFixture(MarketplaceDeploy);

      //expect(await marketplace.getVersion()).to.equal("1.0.0");

      const Marketplace = await ethers.getContractFactory("NFTMarketplace");
      const marketplacev2 = await upgrades.upgradeProxy(marketplace.address,Marketplace);
      expect(await marketplace.getVersion()).to.equal("2.0.0");
    });
  });

});