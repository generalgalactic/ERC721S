// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract ERC721InvalidReceiverStub is IERC721Receiver {
    event Received(address operator, address from, uint256 tokenId, bytes data);

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override returns (bytes4) {
        return 0x12345678;
    }
}
