const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721S Minting", function () {
    let contract;
    let deployer;
    let minter1;

    beforeEach(async () => {
        const ERC721SImpl = await ethers.getContractFactory("ERC721SImpl");
        contract = await ERC721SImpl.deploy("ERC721Impl", "IMPL");
        [deployer, minter1, minter2] = await ethers.getSigners();
    });

    describe("Minting", function () {
        it("associates minted token with minter and increases the minter's balance", async () => {
            await contract.connect(minter1).mint(1);

            expect(await contract.ownerOf(1))
                .to.be.equal(minter1.address);
            expect(await contract.balanceOf(minter1.address))
                .to.be.equal(1);
        });

        it("emits a transfer event on mint", async () => {
            await expect(contract.connect(minter1).mint(1))
                .to.emit(contract, "Transfer")
                .withArgs(ethers.constants.AddressZero, minter1.address, 1);
        });

        it("cannot mint to address 0", async () => {
            await expect(contract.mintToAddress(ethers.constants.AddressZero))
                .to.be.revertedWith("ERC721: mint to the zero address");
        });
    });

    describe("Minting to a contract address", function () {
        it("sucesfully mints to a contract address if receiving contract handles onERC721Received correctly", async () => {
            const ERC721ValidReceiverStub = await ethers.getContractFactory("ERC721ValidReceiverStub");
            receiverStub = await ERC721ValidReceiverStub.deploy();

            await expect(contract.connect(minter1).mintToAddress(receiverStub.address))
                .to.emit(receiverStub, "Received")
                .withArgs(minter1.address, ethers.constants.AddressZero, 1, ethers.utils.toUtf8Bytes(""));

            expect(await contract.ownerOf(1))
                .to.be.equal(receiverStub.address);
            expect(await contract.balanceOf(receiverStub.address))
                .to.be.equal(1);
        });

        it("reverts if receiving contract does not have a valid onERC721Received function", async () => {
            const ERC721EmptyReceiverStub = await ethers.getContractFactory("ERC721EmptyReceiverStub");
            receiverStub = await ERC721EmptyReceiverStub.deploy();

            await expect(contract.mintToAddress(receiverStub.address))
                .to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });

        it("reverts if receiving contract reverts", async () => {
            const ERC721RevertReceiverStub = await ethers.getContractFactory("ERC721RevertReceiverStub");
            receiverStub = await ERC721RevertReceiverStub.deploy("");

            await expect(contract.mintToAddress(receiverStub.address))
                .to.be.reverted;
        });

        it("reverts with message if receiving contract reverts with a messasge", async () => {
            const ERC721RevertReceiverStub = await ethers.getContractFactory("ERC721RevertReceiverStub");
            receiverStub = await ERC721RevertReceiverStub.deploy("revert message");

            await expect(contract.mintToAddress(receiverStub.address))
                .to.be.revertedWith("revert message");
        });
    });
});
