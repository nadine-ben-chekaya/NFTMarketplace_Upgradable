const {ethers} = require("hardhat");
const Factoryjson= require("../../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const contractadr= process.env.CONTRACT_ADDRESS_FACTORY;
// Collection Names
collectioNames = ["FootBall Players", "Sneakers", "Galaxies", "Anime", "Cars"];
// Collection Symbols
collectioSymbols = ["FootP", "Sk", "Gax", "Ani", "Car"];
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const factoryContract= new ethers.Contract(contractadr,Factoryjson.abi,userwallet);

    //Transactions Create Collection
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);

    const version = await factoryContract.getBeacon();
    console.log("Get Beacon version=", version);
    
    for(i=0; i < collectioNames.length; i++){
        const estimate= await factoryContract.estimateGas.create(collectioNames[i], collectioSymbols[i], i);
        console.log("estimate=", estimate);
        const tx = await factoryContract.create(collectioNames[i], collectioSymbols[i], i, {gasPrice: gasPrice,
            gasLimit: estimate.mul(6),});
        const rc = await tx.wait();
        //console.log("result=", rc);
        console.log(`Creating Collection number= ${i} successfully, with name= ${collectioNames[i]}, and symbol=${collectioSymbols[i]}`);
    }



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  