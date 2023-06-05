const {ethers} = require("hardhat");
const Marketplacejson= require("../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");
const contractadr= process.env.CONTRACT_ADDRESS_MARKET;
const defaultNftPrice = ethers.utils.parseUnits("0.001", "ether");
//const defaultListingFees = ethers.utils.parseUnits("0.0001", "ether");
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
    const defaultListingFees = ethers.utils.parseUnits("0.0001", "ether");
    

    const version = await Contract.getVersion();
    console.log("version=", version);

    const listingfees = await Contract.getListingPrice();
    console.log("listing fees=", listingfees);
    
    //Resell
    const estimate2= await Contract.estimateGas.createMarketResell(process.env.CONTRACT_ADDRESS_TOKEN, 3, defaultNftPrice, {value: defaultListingFees});
    console.log("estimate=", estimate2);
    const tx2 = await Contract.createMarketResell(process.env.CONTRACT_ADDRESS_TOKEN, 3, defaultNftPrice, {value: defaultListingFees, gasPrice: gasPrice,
        gasLimit: estimate2.mul(6),});
    const rc2 = await tx2.wait();
    console.log("result Selling=", rc2);
    console.log("Selling new item in marketplace successfully");
    
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  