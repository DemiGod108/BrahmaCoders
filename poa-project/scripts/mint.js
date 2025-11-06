const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tokenURI = process.env.METADATA_URI;

  if (!contractAddress || !tokenURI) {
    throw new Error("❌ CONTRACT_ADDRESS or METADATA_URI missing in .env");
  }

  const POA = await hre.ethers.getContractFactory("ProofOfArt");
  const poa = POA.attach(contractAddress);

  const tx = await poa.mint(tokenURI);
  await tx.wait();
  console.log("✅ NFT Minted:", tx.hash);
}

main().catch(console.error);
