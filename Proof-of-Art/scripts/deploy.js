import hre from "hardhat";

async function main() {
  console.log("Deploying contract:");

  const ProofOfArt = await hre.ethers.getContractFactory("ProofOfArt");
  const proofOfArt = await ProofOfArt.deploy();

  await proofOfArt.waitForDeployment();

  console.log("Contract deployed at:", await proofOfArt.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
