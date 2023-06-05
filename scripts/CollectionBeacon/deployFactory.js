const hre = require("hardhat");

async function main() {
  const owner = await hre.ethers.getSigner();
  const Factory = await hre.ethers.getContractFactory("CollectionFactory");
  const factory = await Factory.deploy(process.env.CONTRACT_ADDRESS_COLLECTION);

  await factory.deployed();

  console.log(
    `Factory deployed to ${factory.address}, with owner =  ${owner.address}`
  );

  //wait for 5 block transactions to ensure deployment before verifying
  console.log(`Waiting for > 5 confirmation before Contract verification`);
  await factory.deployTransaction.wait(7);
  await hre.run("verify:verify", {
    address: factory.address,
    constructorArguments: [process.env.CONTRACT_ADDRESS_COLLECTION]
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
