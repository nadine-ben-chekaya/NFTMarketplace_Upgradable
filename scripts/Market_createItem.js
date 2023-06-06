const {ethers} = require("hardhat");
const Marketplacejson= require("../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");
const Marketadr= process.env.CONTRACT_ADDRESS_MARKET;
const Factoryjson= require("../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const Factoryadr= process.env.CONTRACT_ADDRESS_FACTORY;
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const Contract= new ethers.Contract(Marketadr,Marketplacejson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
    const defaultNftPrice = ethers.utils.parseUnits("0.001", "ether");

    const version = await Contract.getVersion();
    console.log("version=", version);

    const listingfees = await Contract.getListingPrice();
    console.log("listing fees=", listingfees);

    //Get Collection Address 
    //Configuration
    const factoryContract= new ethers.Contract(Factoryadr,Factoryjson.abi,userwallet);
    const collectionaddress = await factoryContract.getCollectionAdr(1);

    const estimate= await Contract.estimateGas.createMarketItem(collectionaddress, 3, defaultNftPrice);
    console.log("estimate=", estimate);
    const tx = await Contract.createMarketItem(collectionaddress, 3, defaultNftPrice, {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log("Creating new item in marketplace successfully");

    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  