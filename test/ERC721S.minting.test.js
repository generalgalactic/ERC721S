const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC721S Minting', function () {
  let contract;
  let deployer;
  let minter;

  beforeEach(async () => {
    const ERC721SImpl = await ethers.getContractFactory('ERC721SImpl');
    contract = await ERC721SImpl.deploy('ERC721Impl', 'IMPL');
    [deployer, minter] = await ethers.getSigners();
  });

  describe('Minting', function () {
    it("associates minted token with minter and increases the minter's balance", async () => {
      await contract.connect(minter).mint(1);

      expect(await contract.ownerOf(1)).to.be.equal(minter.address);
      expect(await contract.balanceOf(minter.address)).to.be.equal(1);
    });

    it('emits a transfer event on mint', async () => {
      await expect(contract.connect(minter).mint(1))
        .to.emit(contract, 'Transfer')
        .withArgs(ethers.constants.AddressZero, minter.address, 1);
    });

    it('cannot mint to address 0', async () => {
      await expect(contract.mintToAddress(ethers.constants.AddressZero)).to.be.revertedWith('MintToTheZeroAddress');
    });
  });

  describe('Minting to a contract address', function () {
    it('sucesfully mints to a contract address if receiving contract handles onERC721Received correctly', async () => {
      const ERC721ValidReceiverStub = await ethers.getContractFactory('ERC721ValidReceiverStub');
      receiverStub = await ERC721ValidReceiverStub.deploy();

      await expect(contract.connect(minter).mintToAddress(receiverStub.address))
        .to.emit(receiverStub, 'Received')
        .withArgs(minter.address, ethers.constants.AddressZero, 1, ethers.utils.toUtf8Bytes(''));

      expect(await contract.ownerOf(1)).to.be.equal(receiverStub.address);
      expect(await contract.balanceOf(receiverStub.address)).to.be.equal(1);
    });

    it('reverts if receiving contract does not have a onERC721Received function', async () => {
      const ERC721EmptyReceiverStub = await ethers.getContractFactory('ERC721EmptyReceiverStub');
      receiverStub = await ERC721EmptyReceiverStub.deploy();

      await expect(contract.mintToAddress(receiverStub.address)).to.be.revertedWith(
        'TransferToNonERC721ReceiverImplementer'
      );
    });

    it('reverts if receiving contract reverts', async () => {
      const ERC721RevertReceiverStub = await ethers.getContractFactory('ERC721RevertReceiverStub');
      receiverStub = await ERC721RevertReceiverStub.deploy('');

      await expect(contract.mintToAddress(receiverStub.address)).to.be.reverted;
    });

    it('reverts with message if receiving contract reverts with a messasge', async () => {
      const ERC721RevertReceiverStub = await ethers.getContractFactory('ERC721RevertReceiverStub');
      receiverStub = await ERC721RevertReceiverStub.deploy('revert message');

      await expect(contract.mintToAddress(receiverStub.address)).to.be.revertedWith('revert message');
    });

    it('reverts if receiving contract returns an invalid response', async () => {
      const ERC721InvalidReceiverStub = await ethers.getContractFactory('ERC721InvalidReceiverStub');
      receiverStub = await ERC721InvalidReceiverStub.deploy();

      await expect(contract.mintToAddress(receiverStub.address)).to.be.reverted;
    });

    it('reverts if receiving contract panics', async () => {
      const ERC721PanicReceiverStub = await ethers.getContractFactory('ERC721PanicReceiverStub');
      receiverStub = await ERC721PanicReceiverStub.deploy();

      await expect(contract.mintToAddress(receiverStub.address)).to.be.reverted;
    });
  });
});
