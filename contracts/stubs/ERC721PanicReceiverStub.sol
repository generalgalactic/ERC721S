// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract ERC721PanicReceiverStub is IERC721Receiver {
    string private revertMessage;
    bytes4[] private panicArray;


    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public view override returns (bytes4) {
        bytes4 outOfBounds = panicArray[1];
        return outOfBounds;
    }
}
