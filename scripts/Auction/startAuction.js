const {ethers} = require("hardhat");
const Auctionjson= require("../artifacts/contracts/Auction.sol/Auction.json");
const contractadr= process.env.CONTRACT_ADDRESS_AUCTION;
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const Contract= new ethers.Contract(contractadr,Auctionjson.abi,userwallet);

    //Transactions
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
    const defaultStartingBid = ethers.utils.parseUnits("0.001", "ether");
    const nftid = 3;
    const estimate= await Contract.estimateGas.start(process.env.CONTRACT_ADDRESS_TOKEN, nftid, defaultStartingBid);
    console.log("estimate=", estimate);
    const tx = await Contract.start(process.env.CONTRACT_ADDRESS_TOKEN, nftid, defaultStartingBid, {gasPrice: gasPrice,
        gasLimit: estimate.mul(6),});
    const rc = await tx.wait();
    console.log("result=", rc);
    console.log(`Starting Auction for the NFT with ID =  ${nftid} successfully!!!! hamdoullah.`);

    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  