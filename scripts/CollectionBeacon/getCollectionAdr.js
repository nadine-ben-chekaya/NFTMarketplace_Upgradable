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

    const version = await factoryContract.getCollectionAdr(1);
    console.log("Get collection adr=", version);
    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  