const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC721S Burning', function () {
  let contract;
  let deployer;
  let minter;
  let approved;

  beforeEach(async () => {
    const ERC721SImpl = await ethers.getContractFactory('ERC721SImpl');
    contract = await ERC721SImpl.deploy('ERC721Impl', 'IMPL');
    [deployer, minter, approved] = await ethers.getSigners();
  });

  describe('burn', function () {
    it('reverts if attemping to burn token that does not exist', async () => {
      await expect(contract.burn(1)).to.be.reverted;
    });

    it('increments burnCount to adjust totalSupply correctly', async () => {
      await contract.connect(minter).mint(1);
      expect(await contract.totalSupply()).to.be.equal(1);

      await contract.burn(1);
      expect(await contract.totalSupply()).to.be.equal(0);
    });

    it("clears approved, reduces owner's balance, and sets new owner as address 0", async () => {
      await contract.connect(minter).mint(1);
      await contract.connect(minter).approve(approved.address, 1);

      expect(await contract.getApproved(1)).to.be.equal(approved.address);

      await contract.burn(1);

      expect(await contract.balanceOf(minter.address)).to.be.equal(0);

      await expect(contract.getApproved(1)).to.be.revertedWith('ApprovedQueryForNonExistentToken');

      await expect(contract.ownerOf(1)).to.be.revertedWith('OwnerQueryForNonExistentToken');
    });

    it('emits a transfer request to address 0', async () => {
      await contract.connect(minter).mint(1);

      await expect(contract.connect(minter).burn(1))
        .to.emit(contract, 'Transfer')
        .withArgs(minter.address, ethers.constants.AddressZero, 1);
    });
  });
});
