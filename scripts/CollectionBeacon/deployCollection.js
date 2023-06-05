const hre = require("hardhat");

async function main() {
  const owner = await hre.ethers.getSigner();
  const Collection = await hre.ethers.getContractFactory("Collection");
  const collection = await Collection.deploy();

  await collection.deployed();

  console.log(
    `Collection deployed to ${collection.address}, with owner =  ${owner.address}`
  );

  //wait for 5 block transactions to ensure deployment before verifying
  console.log(`Waiting for > 5 confirmation before Contract verification`);
  await collection.deployTransaction.wait(7);
  await hre.run("verify:verify", {
    address: collection.address,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
