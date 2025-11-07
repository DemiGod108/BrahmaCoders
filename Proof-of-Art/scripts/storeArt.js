import hre from "hardhat";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  // Read metadata.json that was just created
  const metadata = JSON.parse(fs.readFileSync("metadata.json", "utf8"));

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  const ProofOfArt = await hre.ethers.getContractAt("ProofOfArt", CONTRACT_ADDRESS, signer);

  //Prepare arguments
  const ipfsCid = "QmSSWk5WDtQyBL3ED8TR8rCzCMD3MGGHkr6DQ4nowFguVA"; // paste your CID here
  const imageHash = metadata.image_hash;
  const prompt = metadata.prompt;

  console.log("Storing art on blockchain...");
  console.log("CID:", ipfsCid);
  console.log("Image Hash:", imageHash);
  console.log("Prompt:", prompt);

  // Call smart contract
  const tx = await ProofOfArt.storeArt(ipfsCid, imageHash, prompt);
  const receipt = await tx.wait();

  console.log("✅ Transaction successful!");
  console.log("Tx Hash:", receipt.hash);
  console.log("Block Number:", receipt.blockNumber);

  // Extract recordId from the event
  const event = receipt.events?.find(e => e.event === "ArtStored");
  if (event) {
    console.log("Record ID:", event.args.recordId);
  } else {
    console.log("No event found — check receipt.events for debugging.");
  }
}

main().catch((err) => {
  console.error("Error storing art:", err);
  process.exit(1);
});
