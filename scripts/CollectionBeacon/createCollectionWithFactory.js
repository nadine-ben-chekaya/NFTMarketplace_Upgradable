const {ethers} = require("hardhat");
const Factoryjson= require("../../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const contractadr= process.env.CONTRACT_ADDRESS_FACTORY;
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const factoryContract= new ethers.Contract(contractadr,Factoryjson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);

    const version = await factoryContract.getBeacon();
    console.log("Get Beacon version=", version);
    
    const estimate= await factoryContract.estimateGas.create("nadine", "N", 1);
    console.log("estimate=", estimate);
    const tx = await factoryContract.create("nadine", "N", 1, {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log("Creating new Collection successfully");



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  