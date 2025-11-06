const hre = require("hardhat");

async function main() {
  const POA = await hre.ethers.getContractFactory("ProofOfArt");
  const poa = await POA.deploy();
  await poa.waitForDeployment();

  console.log("✅ ProofOfArt deployed at:", await poa.getAddress());
}

main().catch(console.error);
