// utils/ipfs.js

export const IPFS_GATEWAYS = [
  "https://nftstorage.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/", // used last
];

export function resolveIPFS(urlOrCID) {
  if (!urlOrCID) return "";

  // If input is metadataURI: ipfs://Qm...
  let cid = urlOrCID.replace("ipfs://", "").replace(/^https?:\/\/.*\/ipfs\//, "");
  return `${IPFS_GATEWAYS[0]}${cid}`;
}

// React Image fallback helper
export function loadBalancedImage(cid) {
  return `${IPFS_GATEWAYS[0]}${cid}`;
}
