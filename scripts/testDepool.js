const { ethers } = require('hardhat');
require('dotenv').config()
const { abi:NonfungiblePositionManager } = require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');

// 这些参数需要根据你的实际情况进行修改
const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049');  // 使用你的 Ethereum 节点的 RPC 地址
const privateKey = '0x31ff99f36fa5cc07da13ec536874df5731221ecdf2a6c6cb838caf2102efd7b9';  // 使用你的私钥
const positionManagerAddress = '0xd4357E44C2B020bBF1105Cd8bB245C631ECD473d';  // 使用你部署的 NonfungiblePositionManager 合约的地址

const tokenA = '0x17b47890A75badB44A0647355E95Be4e1151615A';  // 使用你的代币 A 的地址
const tokenB = '0x01f360264D118800913f0710Af3a87b04e3d39b7';  // 使用你的代币 B 的地址
const fee = 3000;  // 使用你想要设置的交易费用，例如 0.3% 的费用为 3000
const sqrtPriceX96 = ethers.utils.parseEther('1');  // 使用你想要设置的初始价格的平方根，乘以 2^96

// 创建一个钱包对象
const wallet = new ethers.Wallet(privateKey, provider);

// 创建一个合约对象
const positionManager = new ethers.Contract(positionManagerAddress, NonfungiblePositionManager, wallet);


// 部署池子
async function deployPool() {
    // //判断是否已经创建过池子
    // const poolAddress2 = await positionManager.getPool(
    //     tokenA,
    //     tokenB,
    //     fee,
    // )
    // console.log('poolAddress2===========================', poolAddress2)
    // if (poolAddress2 != '0x0000000000000000000000000000000000000000') {
    //     //console.log('poolAddress===========================', poolAddress2)
    //     console.log('============================================', poolAddress2)
    //     return poolAddress
    // }else{
    //     //console.log('poolAddress2===========================', poolAddress2)
    // }

  const tx = await positionManager.createAndInitializePoolIfNecessary(
    tokenA,
    tokenB,
    fee,
    sqrtPriceX96,
    { gasLimit: 8000000 }//之前是5000000
  );
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  // 打印一些有用的信息
  console.log(`Transaction was mined in block ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`Transaction status: ${receipt.status ? 'success' : 'failure'}`);

  // 获取池子地址
    const poolAddress = await positionManager.getPool(
    tokenA,
    tokenB,
    fee
    );
    console.log(`Pool address: ${poolAddress}`);
    //增加到.env文件中
    let addresses = [
        `USDT_USDC_500=${poolAddress}`
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

deployPool().catch(console.error);

// npx hardhat run --network private scripts/testDepool.js