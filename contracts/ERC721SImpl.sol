// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './ERC721S.sol';

contract ERC721SImpl is ERC721Sequential {
    string public baseURI;

    constructor(string memory _name, string memory _symbol) ERC721Sequential(_name, _symbol) {}

    function mint(uint256 _numTokens) public payable {
        for (uint256 i = 0; i < _numTokens; i++) {
            _safeMint(msg.sender);
        }
    }

    function mintToAddress(address _to) public payable {
        _safeMint(_to);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
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
