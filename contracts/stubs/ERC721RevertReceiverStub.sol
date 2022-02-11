// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract ERC721RevertReceiverStub is IERC721Receiver {
    string private revertMessage;

    constructor(string memory _revertMesasge) {
        revertMessage = _revertMesasge;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public view override returns (bytes4) {
        if (bytes(revertMessage).length == 0) {
            revert();
        } else {
            revert(revertMessage);
        }
    }
}
