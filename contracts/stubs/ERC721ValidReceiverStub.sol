// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract ERC721ValidReceiverStub is IERC721Receiver {
    event Received(address operator, address from, uint256 tokenId, bytes data);

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        emit Received(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }
}
