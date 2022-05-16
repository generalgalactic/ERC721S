const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC721S Metadata', function () {
  let contract;
  let minter;

  beforeEach(async () => {
    const ERC721SImpl = await ethers.getContractFactory('ERC721SImpl');
    contract = await ERC721SImpl.deploy('ERC721Impl', 'IMPL');
    [, minter] = await ethers.getSigners();
  });

  it('has a name', async () => {
    expect(await contract.name()).to.be.equal('ERC721Impl');
  });

  it('has a symbol', async () => {
    expect(await contract.symbol()).to.be.equal('IMPL');
  });

  describe('tokenURI', function () {
    it('returns an empty string if no baseURI is set', async () => {
      await contract.connect(minter).mint(1);

      expect(await contract.tokenURI(1)).to.be.equal('');
    });

    it('reverts if given token id does not exist', async () => {
      await expect(contract.tokenURI(1)).to.be.reverted;
    });

    it('tokenURI can be updated by updating baseURI', async () => {
      await contract.connect(minter).mint(1);

      await contract.setBaseURI('https://example.org/token/v1/');

      expect(await contract.tokenURI(1)).to.be.equal('https://example.org/token/v1/1');

      await contract.setBaseURI('https://example.org/token/v2/');

      expect(await contract.tokenURI(1)).to.be.equal('https://example.org/token/v2/1');
    });
  });
});
