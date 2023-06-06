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
    address: "0x90c5ac5ba737eb2683530580c17884dee7eb2f1d",
    constructorArguments: [process.env.CONTRACT_ADDRESS_COLLECTION],
    contract: "contracts/CollectionBeacon/CollectionBeacon.sol:CollectionBeacon"
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
