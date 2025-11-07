"use client";
import { useState } from "react";
import { IPFS_GATEWAYS } from "../../utils/ipfs";

export default function IPFSImage({ cid, alt = "", className = "" }) {
  const [gatewayIndex, setGatewayIndex] = useState(0);

  if (!cid) return null;

  const src = `${IPFS_GATEWAYS[gatewayIndex]}${cid}`;

  const handleError = () => {
    if (gatewayIndex < IPFS_GATEWAYS.length - 1) {
      setGatewayIndex(gatewayIndex + 1);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
