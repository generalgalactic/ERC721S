const { expect } = require("chai");
const { ethers } = require("hardhat");


// transferFrom
// safeTransferFrom
describe("ERC721S Approvals and Transfers", function () {
    let contract;
    let deployer;
    let minter;
    let approved;
    let operator;

    beforeEach(async () => {
        const ERC721SImpl = await ethers.getContractFactory("ERC721SImpl");
        contract = await ERC721SImpl.deploy("ERC721Impl", "IMPL");
        [deployer, minter, approved, operator, EOAReceiver] = await ethers.getSigners();
    });

    describe("Approvals", function () {
        describe("getApproved", function () {
            it("returns address that has been approved", async () => {
                await contract.connect(minter).mint(1);
                await contract.connect(minter).approve(approved.address, 1);

                expect(await contract.getApproved(1))
                    .to.be.equal(approved.address);
            });

            it("returns address(0) after minting", async () => {
                await contract.connect(minter).mint(1);

                expect(await contract.getApproved(1))
                    .to.be.equal(ethers.constants.AddressZero);
            });

            it("reverts if token does not exist", async () => {
                await expect(contract.getApproved(0))
                    .to.be.reverted;

                await expect(contract.getApproved(1))
                    .to.be.reverted;
            });
        });

        describe("isApprovedForAll", function () {
            it("returns true if operator is in msg.sender's approvals list and marked as approved", async () => {
                contract.connect(minter).setApprovalForAll(operator.address, true);

                expect(await contract.isApprovedForAll(minter.address, operator.address))
                    .to.be.equal(true);
            });

            it("returns false if operator is in msg.sender's approvals list and marked as not approved", async () => {
                contract.connect(minter).setApprovalForAll(operator.address, false);

                expect(await contract.isApprovedForAll(minter.address, operator.address))
                    .to.be.equal(false);
            });

            it("returns false if operator is in not msg.sender's approvals list", async () => {
                expect(await contract.isApprovedForAll(minter.address, operator.address))
                    .to.be.equal(false);
            });
        });

        describe("setApprovalForAll", function () {
            it("emits an ApprovalForAll event when set", async () => {
                await expect(contract.connect(minter).setApprovalForAll(operator.address, true))
                    .to.emit(contract, "ApprovalForAll")
                    .withArgs(minter.address, operator.address, true);
            });

            it("can have multiple operators in approval for all list", async () => {
                await contract.connect(minter).setApprovalForAll(approved.address, true);
                await contract.connect(minter).setApprovalForAll(operator.address, true);

                expect(await contract.isApprovedForAll(minter.address, approved.address))
                    .to.be.equal(true);
                expect(await contract.isApprovedForAll(minter.address, operator.address))
                    .to.be.equal(true);
            });
        });

        describe("approve", function () {
            it("sets approved address if caller is owner or is in owner's approved list", async () => {
                await contract.connect(minter).mint(1);

                await contract.connect(minter).approve(approved.address, 1);

                expect(await contract.getApproved(1))
                    .to.be.equal(approved.address);

                await contract.connect(minter).setApprovalForAll(operator.address, true);

                expect(await contract.getApproved(1))
                    .to.be.equal(approved.address);

                await contract.connect(operator).approve(operator.address, 1);

                expect(await contract.getApproved(1))
                    .to.be.equal(operator.address);
            });

            it("emits an approval event when set", async () => {
                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter).approve(operator.address, 1))
                    .to.emit(contract, "Approval")
                    .withArgs(minter.address, operator.address, 1);
            });

            it("reverts if owner tries to set approved to themselves", async () => {
                await contract.connect(minter).mint(1);
                await expect(contract.connect(minter).approve(minter.address, 1))
                    .to.be.revertedWith("ERC721: approval to current owner");
            });

            it("reverts if approve caller is not owner of token or in owner's approved list", async () => {
                await contract.connect(minter).mint(1);
                await expect(contract.connect(approved).approve(approved.address, 1))
                    .to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
            });
        });
    });

    describe("Transfers", function () {
        describe("transferFrom", function () {
            it("reverts if sender is not approved, in approval for all list, or owner of token", async () => {
                await contract.connect(minter).mint(1);
                await expect(contract.connect(operator).transferFrom(minter.address, operator.address, 1))
                    .to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
            });

            it("transfers to 'to' address if sender is owner, approved, or in approval for all list", async () => {
                await contract.connect(minter).mint(3);

                await contract.connect(minter).setApprovalForAll(operator.address, true);
                await contract.connect(minter).approve(approved.address, 3);

                await contract.connect(minter).transferFrom(minter.address, EOAReceiver.address, 1);
                await contract.connect(operator).transferFrom(minter.address, EOAReceiver.address, 2);
                await contract.connect(approved).transferFrom(minter.address, EOAReceiver.address, 3);

                expect(await contract.balanceOf(EOAReceiver.address)).to.be.equal(3);
                expect(await contract.ownerOf(1)).to.be.equal(EOAReceiver.address);
                expect(await contract.ownerOf(2)).to.be.equal(EOAReceiver.address);
                expect(await contract.ownerOf(3)).to.be.equal(EOAReceiver.address);

            });

            it("clear approved and sets new owner for token id and updates balances", async () => {
                await contract.connect(minter).mint(3);

                await contract.connect(minter).approve(approved.address, 3);

                expect(await contract.balanceOf(minter.address))
                    .to.be.equal(3);
                expect(await contract.getApproved(3))
                    .to.be.equal(approved.address);

                await contract.connect(minter).transferFrom(minter.address, EOAReceiver.address, 3);

                expect(await contract.balanceOf(minter.address))
                    .to.be.equal(2);
                expect(await contract.balanceOf(EOAReceiver.address))
                    .to.be.equal(1);
                expect(await contract.getApproved(3))
                    .to.be.equal(ethers.constants.AddressZero);

            });

            it("emits Transfer event", async () => {
                await contract.connect(minter).mint(3);
                await expect(contract.connect(minter).transferFrom(minter.address, EOAReceiver.address, 3))
                    .to.emit(contract, "Transfer")
                    .withArgs(minter.address, EOAReceiver.address, 3);
            });
        });
        describe("safeTransferFrom", function () {
            it("reverts if sender is not approved, in approval for all list, or owner of token", async () => {
                await contract.connect(minter).mint(1);
                await expect(contract.connect(operator)["safeTransferFrom(address,address,uint256)"](minter.address, operator.address, 1))
                    .to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
            });

            it("transfers to 'to' address if sender is owner, approved, or in approval for all list", async () => {
                await contract.connect(minter).mint(3);

                await contract.connect(minter).setApprovalForAll(operator.address, true);
                await contract.connect(minter).approve(approved.address, 3);

                await contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, EOAReceiver.address, 1);
                await contract.connect(operator)["safeTransferFrom(address,address,uint256)"](minter.address, EOAReceiver.address, 2);
                await contract.connect(approved)["safeTransferFrom(address,address,uint256)"](minter.address, EOAReceiver.address, 3);

                expect(await contract.balanceOf(EOAReceiver.address)).to.be.equal(3);
                expect(await contract.ownerOf(1)).to.be.equal(EOAReceiver.address);
                expect(await contract.ownerOf(2)).to.be.equal(EOAReceiver.address);
                expect(await contract.ownerOf(3)).to.be.equal(EOAReceiver.address);

            });
            it('successfully transfers to a contract address if receiving contract handles onERC721Received correctly', async () => {
                const ERC721ValidReceiverStub = await ethers.getContractFactory("ERC721ValidReceiverStub");
                receiverStub = await ERC721ValidReceiverStub.deploy();

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.emit(receiverStub, "Received")
                    .withArgs(minter.address, minter.address, 1, ethers.utils.toUtf8Bytes(""));
            });

            it("reverts if receiving contract does not have a valid onERC721Received function", async () => {
                const ERC721EmptyReceiverStub = await ethers.getContractFactory("ERC721EmptyReceiverStub");
                receiverStub = await ERC721EmptyReceiverStub.deploy();

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
            });

            it("reverts if receiving contract reverts", async () => {
                const ERC721RevertReceiverStub = await ethers.getContractFactory("ERC721RevertReceiverStub");
                receiverStub = await ERC721RevertReceiverStub.deploy("");

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.be.reverted;
            });

            it("reverts with message if receiving contract reverts with message", async () => {
                const ERC721RevertReceiverStub = await ethers.getContractFactory("ERC721RevertReceiverStub");
                receiverStub = await ERC721RevertReceiverStub.deploy("revert message");

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.be.revertedWith("revert message");
            });

            it("reverts if receiving contract returns an invalid response", async () => {
                const ERC721InvalidReceiverStub = await ethers.getContractFactory("ERC721InvalidReceiverStub");
                receiverStub = await ERC721InvalidReceiverStub.deploy();

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.be.reverted;
            });

            it("reverts if receiving contract panics", async () => {
                const ERC721PanicReceiverStub = await ethers.getContractFactory("ERC721PanicReceiverStub");
                receiverStub = await ERC721PanicReceiverStub.deploy();

                await contract.connect(minter).mint(1);

                await expect(contract.connect(minter)["safeTransferFrom(address,address,uint256)"](minter.address, receiverStub.address, 1))
                    .to.be.reverted;
            });
        });
    });
});
