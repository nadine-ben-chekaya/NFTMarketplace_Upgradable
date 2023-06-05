const {ethers} = require("hardhat");
const Marketplacejson= require("../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");
const contractadr= process.env.CONTRACT_ADDRESS_MARKET;
const defaultNftPrice = ethers.utils.parseUnits("0.001", "ether");
const defaultListingFees = ethers.utils.parseUnits("0.0001", "ether");
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT3, alchemy);
    const Contract= new ethers.Contract(contractadr,Marketplacejson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
    

    const version = await Contract.getVersion();
    console.log("version=", version);

    const listingfees = await Contract.getListingPrice();
    console.log("listing fees=", listingfees);
   
    
    // Cansel sell
    const estimate3= await Contract.estimateGas.cancelSale(process.env.CONTRACT_ADDRESS_TOKEN, 3);
    console.log("estimate=", estimate3);
    const tx3 = await Contract.cancelSale(process.env.CONTRACT_ADDRESS_TOKEN, 3, {gasPrice: gasPrice,
        gasLimit: estimate3.mul(6),});
    const rc3 = await tx3.wait();
    console.log("result Selling=", rc3);
    console.log("Cancelling Sale item in marketplace successfully");




}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  