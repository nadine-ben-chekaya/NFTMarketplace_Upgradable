const {ethers} = require("hardhat");
const Tokenjson= require("../../artifacts/contracts/CollectionBeacon/Collection.sol/Collection.json");
//const contractadr= process.env.CONTRACT_ADDRESS_COLLECTION;
const contractadr= "0x6113a6Fd9b91E26C7a793C57fA34913fa19F426a";
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const tokenContract= new ethers.Contract(contractadr,Tokenjson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);

    const version = await tokenContract.getVersion();
    console.log("version=", version);
    
    const estimate= await tokenContract.estimateGas.safeMint("url4", "0xfA8Df01C35b6ce524190882008Bc39F356F96999");
    console.log("estimate=", estimate);
    const tx = await tokenContract.safeMint("url4", "0xfA8Df01C35b6ce524190882008Bc39F356F96999", {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log("Minting new nft successfully");



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  