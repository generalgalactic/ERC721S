// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "./ERC721S.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ExampleNFT is
    ERC721Sequential,
    ReentrancyGuard,
    Ownable
{
    constructor() ERC721Sequential("ExampleNFT", "ENFT"){}

    /* Minting */

    function mint(uint256 numTokens)
        public
        payable
        nonReentrant
    {
        
        for (uint256 i = 0; i < numTokens; i++) {
            _safeMint(msg.sender);
        }
    }


}
