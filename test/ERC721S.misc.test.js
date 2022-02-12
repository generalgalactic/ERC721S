const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721S Misc", function () {
    let contract;
    let deployer;
    let minter1;
    let minter2;

    beforeEach(async () => {
        const ERC721SImpl = await ethers.getContractFactory("ERC721SImpl");
        contract = await ERC721SImpl.deploy("ERC721Impl", "IMPL");
        [deployer, minter1, minter2] = await ethers.getSigners();
    });

    describe("balanceOf", function () {
        it("returns number of tokens associated with address", async () => {
            expect(await contract.balanceOf(minter1.address))
                .to.be.equal(0);

            await contract.connect(minter1).mint(2);

            expect(await contract.balanceOf(minter1.address))
                .to.be.equal(2);
        });

        it("reverts when attempting to get balance of address 0x0", async () => {
            await expect(contract.balanceOf(ethers.constants.AddressZero))
                .to.be.revertedWith("ERC721: balance query for the zero address");
        });
    });

    describe("ownerOf", function () {
        it("returns the owner's address when providing a token id", async () => {
            await contract.connect(minter1).mint(1);
            await contract.connect(minter2).mint(1);

            expect(await contract.ownerOf(1))
                .to.be.equal(minter1.address);

            expect(await contract.ownerOf(2))
                .to.be.equal(minter2.address);
        });

        it("reverts when attempting to get ownerOf a nonexistant token", async () => {
            await expect(contract.ownerOf(0))
                .to.be.reverted;
            await expect(contract.ownerOf(1))
                .to.be.reverted;
        });
    });
});
