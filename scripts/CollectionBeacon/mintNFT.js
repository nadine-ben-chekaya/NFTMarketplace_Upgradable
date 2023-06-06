const {ethers} = require("hardhat");
const Factoryjson= require("../../artifacts/contracts/CollectionBeacon/CollectionFactory.sol/CollectionFactory.json");
const Tokenjson= require("../../artifacts/contracts/CollectionBeacon/Collection.sol/Collection.json");
const Factoryadr= process.env.CONTRACT_ADDRESS_FACTORY;
const Marketadr= process.env.CONTRACT_ADDRESS_MARKET;
// Collection Names
collectionNames = ["FootBall Players", "Sneakers", "Galaxies", "Anime", "Cars"];
// 200 nft uris
nftUris = [
    [
      "https://api.npoint.io/3a76ba5be57918ab00c4",
      "https://api.npoint.io/b38a2e8b0342ff2b8947",
      "https://api.npoint.io/dfd3fee7548a166d2d1b",
      "https://api.npoint.io/3f610cad2b2b193c1b00",
      "https://api.npoint.io/0c74087c8569d2623443",
      "https://api.npoint.io/7b239cfcc6284c850161",
    ],
    [
      "https://api.npoint.io/5be1cb1a3ba417134ecf",
      "https://api.npoint.io/0d6e8d2deaf47867f9d7",
      "https://api.npoint.io/2f2a5c7c2623cf9c8974",
      "https://api.npoint.io/2d86e435b9f2d9ab2fa2",
      "https://api.npoint.io/87320db96d03c2e6f890",
      "https://api.npoint.io/0f1c94ead963d3be6319",
    ],
    [
      "https://api.npoint.io/c80992185dc031e1de32",
      "https://api.npoint.io/1fbcf54d4b8131799fc8",
      "https://api.npoint.io/dd660722fd40bab07df5",
      "https://api.npoint.io/632f275082703c136b2c",
      "https://api.npoint.io/1fefb7556a04a2f5711a",
      "https://api.npoint.io/9ac463775bcb7d648cf8",
    ],
    [
      "https://api.npoint.io/cad74a7f0f1a9d46e5d9",
      "https://api.npoint.io/f5c82d9e46307837000e",
      "https://api.npoint.io/d53aac0c2371ad120a37",
      "https://api.npoint.io/b6af1ae6e603b52209d8",
      "https://api.npoint.io/5fe8aacd828fb94d9654",
      "https://api.npoint.io/8456a564a0ef219c36a0",
    ],
    [
      "https://api.npoint.io/02581369d9aee1d986a2",
      "https://api.npoint.io/f63682342655b4f1a737",
      "https://api.npoint.io/0cc20591b3d38525345a",
      "https://api.npoint.io/8317f02b6534ba631d56",
      "https://api.npoint.io/bfc29fbe011d90f4ab9a",
      "https://api.npoint.io/89bb46bcadc50628582c",
    ],
  ];
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

        for(j=0; j<4; j++){

            //Configuration
            const alchemy= new ethers.providers.AlchemyProvider("maticmum",process.env.ALCHEMY_API_KEY);
            const userwallet= new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT1, alchemy);
            const tokenContract= new ethers.Contract(collectionaddress,Tokenjson.abi,userwallet);

            //Mint NFTS 
            const nfturi = nftUris[i][j];
            const estimate= await tokenContract.estimateGas.safeMint(nfturi, Marketadr);
            console.log("estimate=", estimate);
            const tx = await tokenContract.safeMint(nfturi, Marketadr, {gasPrice: gasPrice,
                gasLimit: estimate.mul(6),});
            const rc = await tx.wait();
            console.log(`Minting nft number ${j} to collection number= ${i} successfully, with name= ${collectionNames[i]}`);
        }
    }
    



}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  