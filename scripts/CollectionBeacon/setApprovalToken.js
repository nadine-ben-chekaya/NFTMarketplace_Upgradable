const {ethers} = require("hardhat");
const Factoryjson= require("../../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const Factoryadr= process.env.CONTRACT_ADDRESS_FACTORY;
const Tokenjson= require("../../artifacts/contracts/CollectionBeacon/Collection.sol/Collection.json");
const Marketadr= process.env.CONTRACT_ADDRESS_MARKET;
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet1= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    //Get Collection Address
    const factoryContract= new ethers.Contract(Factoryadr,Factoryjson.abi,userwallet1);
    const collectionaddress = await factoryContract.getCollectionAdr(1);

    //Set Approval for marketplace
    const userwallet3= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT3, alchemy);
    const tokenContract= new ethers.Contract(collectionaddress,Tokenjson.abi,userwallet3);
    
    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
    
    const estimate= await tokenContract.estimateGas.MySetApproval(Marketadr);
    console.log("estimate=", estimate);
    const tx = await tokenContract.MySetApproval(Marketadr, {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log("Approving marketplace to use Collection's nfts successfully");

    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  