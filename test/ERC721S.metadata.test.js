const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721S Metadata", function () {
    let contract;
    let deployer;
    let minter1;

    beforeEach(async () => {
        const ERC721Stub = await ethers.getContractFactory("ERC721Stub");
        contract = await ERC721Stub.deploy("ERC721Stub", "STUB");
        [deployer, minter1] = await ethers.getSigners();
    });

    it("has a name", async () => {
        expect(await contract.name()).to.be.equal("ERC721Stub");
    });

    it("has a symbol", async () => {
        expect(await contract.symbol()).to.be.equal("STUB");
    });

    describe("tokenURI", function () {
        it("returns an empty string if no baseURI is set", async () => {
            await contract.connect(minter1).mint(1);

            expect(await contract.tokenURI(1))
                .to.be.equal("");
        });

        it("reverts if given token id does not exist", async () => {
            await expect(contract.tokenURI(1))
                .to.be.reverted;

        });

        it("tokenURI can be updated by updating baseURI", async () => {
            await contract.connect(minter1).mint(1);

            await contract.setBaseURI("https://example.org/token/v1/");

            expect(await contract.tokenURI(1))
                .to.be.equal("https://example.org/token/v1/1");

            await contract.setBaseURI("https://example.org/token/v2/");

            expect(await contract.tokenURI(1))
                .to.be.equal("https://example.org/token/v2/1");
        });
    });
});
