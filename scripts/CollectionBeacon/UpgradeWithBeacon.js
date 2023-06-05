const {ethers} = require("hardhat");
const Beaconjson= require("../../artifacts/contracts/CollectionBeacon/CollectionBeacon.sol/CollectionBeacon.json");
const contractadr= process.env.CONTRACT_ADDRESS_COLLECTIONBEACON;
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const beaconContract= new ethers.Contract(contractadr,Beaconjson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);

   // const version = await beaconContract.getBeacon();
   // console.log("Get Beacon version=", version);
    
    const estimate= await beaconContract.estimateGas.update(process.env.CONTRACT_ADDRESS_COLLECTION);
    console.log("estimate=", estimate);
    const tx = await beaconContract.update(process.env.CONTRACT_ADDRESS_COLLECTION, {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log("Updating Collection contract successfully");



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  