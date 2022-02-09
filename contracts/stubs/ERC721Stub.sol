// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '../ERC721S.sol';

contract ERC721Stub is ERC721Sequential {
    string public baseURI;

    constructor(string memory name, string memory symbol) ERC721Sequential(name, symbol) {}

    function mint(uint256 numTokens) public payable {
        for (uint256 i = 0; i < numTokens; i++) {
            _safeMint(msg.sender);
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // This is missing an onlyOwner modifier since it's only used for TESTING.
    // DO NOT copy-pasta this into a production contract.
    function setBaseURI(string memory _baseTokenURI) external {
        baseURI = _baseTokenURI;
    }
}
