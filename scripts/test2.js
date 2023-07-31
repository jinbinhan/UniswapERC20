const { ethers } = require('ethers');
const fs = require('fs');

// 定义流动性池的地址
const poolAddress = '0x20Fb215C00018a522A10b254278805B65Bca4a4F'; // 替换为实际的流动性池合约地址

// 定义流动性池合约的 ABI
const poolAbi = getABI('./scripts/UniswapV3Pool.json')

// 获取ABI
function getABI(file) {
  // 读取智能合约编译后的JSON文件
  let json = fs.readFileSync(file, 'utf8');
  // 解析JSON文件获取ABI
  let obj = JSON.parse(json);
  let abi = obj.abi;
  // console.log(abi);
  return abi;
}
async function getPoolData() {
  // 创建提供者
  const provider = new ethers.providers.JsonRpcProvider("http://192.168.1.168:9049");

  // 创建合约实例
  const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

  // 调用合约方法查询流动性池数据
  const liquidity = await poolContract.liquidity();
  const token0Balance = await poolContract.token0Balance();
  const token1Balance = await poolContract.token1Balance();
  const currentPrice = await poolContract.getCurrentPrice();

  // 打印流动性池的状态
  console.log('Liquidity:', liquidity.toString());
  console.log('Token0 Balance:', token0Balance.toString());
  console.log('Token1 Balance:', token1Balance.toString());
  console.log('Current Price:', currentPrice.toString());
}

getPoolData().catch((error) => {
  console.error('Error:', error);
});
