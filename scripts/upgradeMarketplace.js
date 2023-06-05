const {ethers} = require("hardhat");

async function main(){
    //Upgrade Token Contract
    const owner = await ethers.getSigner();
    const marketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplacev2 = await upgrades.upgradeProxy(process.env.CONTRACT_ADDRESS_MARKET,marketplace);
    console.log(`Annnnnnnnnnnnd, upgrade contract is done!! = ${ marketplacev2.address} hamdoullah,with onwer address = ${owner.address}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });