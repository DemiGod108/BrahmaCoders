const { ethers } = require("ethers");
require("dotenv").config();

const ABI = require("../poa-project/artifacts/contracts/ProofOfArt.sol/ProofOfArt.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC);
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

async function mintNFT(ipfsMetadataURI) {
  const tx = await contract.mint(ipfsMetadataURI);
  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args[2].toString(); // ERC721 Transfer event
  return { txHash: tx.hash, tokenId };
}

module.exports = { mintNFT };
