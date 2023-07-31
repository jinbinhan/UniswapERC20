const fs = require('fs');
const { promisify } = require('util');

async function main() {
  const [owner] = await ethers.getSigners();

  Tether = await ethers.getContractFactory('Tether', owner);
  tether = await Tether.deploy();

  Usdc = await ethers.getContractFactory('UsdCoin', owner);
  usdc = await Usdc.deploy();

  const WrappedBitcoin = await ethers.getContractFactory('WrappedBitcoin', owner);
  const wrappedBitcoin = await WrappedBitcoin.deploy();
  //等待交易回执并输出是否成功
  await tether.deployed();
  await usdc.deployed();
  await wrappedBitcoin.deployed();
  console.log('Tether deployed to:', tether.address);
  console.log('UsdCoin deployed to:', usdc.address);
  console.log('WrappedBitcoin deployed to:', wrappedBitcoin.address);
  

  await tether.connect(owner).mint(
    owner.address,
    ethers.utils.parseEther('100000000')//100000
  )
  await usdc.connect(owner).mint(
    owner.address,
    ethers.utils.parseEther('100000000')
  )
  await wrappedBitcoin.connect(owner).mint(
    owner.address,
    ethers.utils.parseEther('100000000')
  )

  let addresses = [
    `USDC_ADDRESS=${usdc.address}`,
    `TETHER_ADDRESS=${tether.address}`,
    `WRAPPED_BITCOIN_ADDRESS=${wrappedBitcoin.address}`,
  ]
  const data = '\n' + addresses.join('\n')

  const writeFile = promisify(fs.appendFile);
  const filePath = '.env';
  return writeFile(filePath, data)
      .then(() => {
        console.log('Addresses recorded.');
      })
      .catch((error) => {
        console.error('Error logging addresses:', error);
        throw error;
      });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  // npx hardhat run --network private scripts/deployUniswapV3Toknes.js