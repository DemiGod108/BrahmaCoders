// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProofOfArt {
    struct ArtRecord {
        string ipfsCid;     
        string imageHash;   
        string prompt;      
        address creator;    
        uint256 timestamp;  
    }

    mapping(bytes32 => ArtRecord) public records;

    event ArtStored(bytes32 indexed recordId, address indexed creator, string ipfsCid);

    function storeArt(
        string memory ipfsCid,
        string memory imageHash,
        string memory prompt
    ) public returns (bytes32) {
        bytes32 recordId = keccak256(
            abi.encodePacked(msg.sender, ipfsCid, block.timestamp)
        );

        records[recordId] = ArtRecord(
            ipfsCid,
            imageHash,
            prompt,
            msg.sender,
            block.timestamp
        );

        emit ArtStored(recordId, msg.sender, ipfsCid);
        return recordId;
    }

    function getArt(bytes32 recordId) public view returns (ArtRecord memory) {
        return records[recordId];
    }
}
