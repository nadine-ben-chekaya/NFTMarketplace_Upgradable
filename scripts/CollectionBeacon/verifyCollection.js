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
    address: "0x6113a6Fd9b91E26C7a793C57fA34913fa19F426a",
    constructorArguments: ["nadine","N"],
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
