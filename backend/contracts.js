const { ethers } = require("ethers");
require("dotenv").config();

const ABI = require("../poa-project/artifacts/contracts/ProofOfArt.sol/ProofOfArt.json").abi;

// Local Hardhat RPC
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Wallet (must match first Hardhat account or your imported MetaMask key)
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

async function mintNFT(metadataURI) {
  console.log("🔗 Minting NFT with metadata:", metadataURI);

  const tx = await contract.mint(metadataURI);
  await tx.wait();

  console.log("✅ Minted. Tx Hash:", tx.hash);
  return tx.hash;
}

module.exports = { mintNFT };
