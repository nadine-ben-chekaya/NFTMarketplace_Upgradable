const hre = require("hardhat");
const { ethers } = require("hardhat");
async function main() {
  
  const owner = await ethers.getSigner();

//   //Verify
//   //Beacon
//   //wait for 5 block transactions to ensure deployment before verifying
//   console.log(`Waiting for > 5 confirmation before Contract verification`);
//   await beacon.deployTransaction.wait(7);
  await hre.run("verify:verify", {
    address: "0x8f24a41faEa5C82F424F4450B9f5ADF4007a07d8",
    constructorArguments: ["Cars","Car"],
    contract: "contracts/CollectionBeacon/Collection.sol:Collection"
  });

//contract: "contracts/TestBeacon/Vaultv1.sol:Vaultv1"


  console.log(
    `Hamdoulllah !!!!`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
