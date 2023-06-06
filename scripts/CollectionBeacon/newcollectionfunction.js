const {ethers} = require("hardhat");
const Factoryjson= require("../../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const Tokenjson= require("../../artifacts/contracts/CollectionBeacon/Collection.sol/Collection.json");
const Factoryadr= process.env.CONTRACT_ADDRESS_FACTORY;
const Marketadr= process.env.CONTRACT_ADDRESS_MARKET;
// Collection Names
collectionNames = ["FootBall Players", "Sneakers", "Galaxies", "Anime", "Cars"];
async function main(){
    const owner = await ethers.getSigner();
    console.log("owner=",owner.address);
    //Configuration
    const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
    const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
    const factoryContract= new ethers.Contract(Factoryadr,Factoryjson.abi,userwallet);

    //Transactions Mint nfts for each collection
    const gasPriceOracle = "https://gasstation-mainnet.matic.network";
    const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
    
    for(i=0; i < collectionNames.length; i++){
        const collectionaddress = await factoryContract.getCollectionAdr(i);
        console.log(`Collection number ${i}'s address= ${collectionaddress}`);

        //Configuration collection
        const tokenContract= new ethers.Contract(collectionaddress,Tokenjson.abi,userwallet);

        // Get version
        const version = await tokenContract.getVersion();
        console.log(`Version= ${version}, from collection number ${i} with address= ${collectionaddress}`);

        //Get message
        const message = await tokenContract.getMessage();
        console.log(`Message= ${message}, from collection number ${i} with address= ${collectionaddress}`);
    }
    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  