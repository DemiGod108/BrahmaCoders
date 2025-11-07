import pinataSDK from "@pinata/sdk";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Pinata
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

async function main() {
  //Read your image file
  const imagePath = "./sample_art.png"; // Place your image here
  const imageData = fs.readFileSync(imagePath);

  //Upload the image to IPFS (with metadata options)
  const options = {
    pinataMetadata: {
      name: "sample_art.png" // You can also use path.basename(imagePath)
    },
    pinataOptions: {
      cidVersion: 0
    }
  };

  const imageResult = await pinata.pinFileToIPFS(fs.createReadStream(imagePath), options);
  const imageCID = imageResult.IpfsHash;

  console.log("Image uploaded to IPFS!");
  console.log(`CID: ${imageCID}`);
  console.log(`URL: https://gateway.pinata.cloud/ipfs/${imageCID}`);

  //Compute SHA-256 hash for the image
  const imageHash = "0x" + crypto.createHash("sha256").update(imageData).digest("hex");

  //Define extra metadata fields
  const walletAddress = "0x3255527f24dae9b7443719e86cceedd919e99924"; // Replace later with real wallet
  const faceHash = "hash_91312hd91h3d1"; // Replace later with real biometric hash

  //Create metadata JSON (NFT-standard format)
  const metadata = {
    name: "Proof of Art NFT",
    description: "AI-generated artwork with verifiable human authorship.",
    image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
    attributes: [
      {
        trait_type: "Prompt",
        value: "cat and dog eating grass" // change dynamically later
      },
      {
        trait_type: "AI Model",
        value: "huggingface"
      },
      {
        trait_type: "Face Hash",
        value: faceHash
      },
      {
        trait_type: "Creator Wallet",
        value: walletAddress
      },
      {
        trait_type: "Timestamp",
        value: Date.now().toString()
      },
      {
        trait_type: "Ownership Type",
        value: "original"
      }
    ]
  };

  //Save metadata locally
  fs.writeFileSync("metadata.json", JSON.stringify(metadata, null, 2));
  console.log("\nMetadata file created locally as metadata.json");

  //Upload metadata JSON to IPFS
  const result = await pinata.pinJSONToIPFS(metadata);
  console.log("\nMetadata uploaded to IPFS!");
  console.log(`CID: ${result.IpfsHash}`);
  console.log(`View it at: https://ipfs.io/ipfs/${result.IpfsHash}`);
}

main().catch((err) => console.error("Error:", err));
