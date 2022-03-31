const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721S Enumerable", function () {
    let contract;
    let deployer;
    let minter1;
    let minter2;

    beforeEach(async () => {
        const ERC721SImpl = await ethers.getContractFactory("ERC721SImpl");
        contract = await ERC721SImpl.deploy("ERC721Impl", "IMPL");
        [deployer, minter1, minter2] = await ethers.getSigners();
    });

    describe("tokenOwnerByIndex", function () {
        it("returns token id for owner in an owner-specific array by index", async () => {
            await contract.connect(minter1).mint(1);
            await contract.connect(minter2).mint(1);
            await contract.connect(minter1).mint(1);

            expect(await contract.tokenOfOwnerByIndex(minter1.address, 0))
                .to.be.equal(1);
            expect(await contract.tokenOfOwnerByIndex(minter2.address, 0))
                .to.be.equal(2);
            expect(await contract.tokenOfOwnerByIndex(minter1.address, 1))
                .to.be.equal(3);
        });

        it("reverts if index is greater then the number of tokens associated with a given owner", async () => {
            await contract.connect(minter1).mint(1);
            await expect(contract.tokenOfOwnerByIndex(minter1.address, 1))
                .to.be.revertedWith('OwnerIndexOutOfBounds');
        });
    });

    describe("totalSupply", function () {
        it("returns total supply of all tokens created", async () => {
            expect(await contract.totalSupply())
                .to.be.equal(0);

            await contract.connect(minter1).mint(1);
            await contract.connect(minter2).mint(2);

            expect(await contract.totalSupply())
                .to.be.equal(3);
        });
    });
});
