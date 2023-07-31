const ethers = require('ethers');

async function isERC20(provider, tokenAddress) {
  const ERC20ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
    'function transferFrom(address, address, uint256) returns (bool)',
  ];

  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);

  try {
    await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      tokenContract.balanceOf('0x0000000000000000000000000000000000000000'),
      tokenContract.allowance('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'),
    ]);

    return true;
  } catch (err) {
    return false;
  }
}
async function main() {
    const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049');
    //const provider = ethers.provider
    console.log(await isERC20(provider, '0x9cb41db9a034e4A95004F2eBD72F064E7cE6d496')); // DAI on Ethereum mainnet
  }
  
  main().catch(console.error);
  

//  npx hardhat run --network private .\scripts\checkisERC20.js