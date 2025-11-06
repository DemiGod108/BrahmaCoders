// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ProofOfArt is ERC721URIStorage {
    uint256 private tokenIdCounter;

    constructor() ERC721("ProofOfArt", "POA") {}

    function mint(string memory tokenURI) public returns (uint256) {
        tokenIdCounter += 1;
        uint256 newId = tokenIdCounter;
        _mint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);
        return newId;
    }
}
