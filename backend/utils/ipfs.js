const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const PINATA_JWT = process.env.PINATA_JWT;

async function uploadFileToIPFS(filePath) {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    }
  );

  return `ipfs://${res.data.IpfsHash}`;
}

async function uploadJSONToIPFS(json) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    json,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    }
  );
  return `ipfs://${res.data.IpfsHash}`;
}

module.exports = { uploadFileToIPFS, uploadJSONToIPFS };
