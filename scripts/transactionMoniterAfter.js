const { ethers } = require("hardhat");
// const { abi: UniswapV3PoolABI } = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");

const fs = require('fs');

// 获取ABI
function getABI(file) {
  // 读取智能合约编译后的JSON文件
  let json = fs.readFileSync(file, 'utf8');
  // 解析JSON文件获取ABI
  let obj = JSON.parse(json);
  let abi = obj.abi;
  return abi;
}

// 从文件获取池子 ABI
const UniswapV3PoolABI = getABI('./scripts/UniswapV3Pool.json');
async function main() {
  //const provider = ethers.getDefaultProvider("http://192.168.1.168:9049"); // 替换为你的 Ethereum 节点 URL
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const provider = deployer.provider;
  // 替换为你要监听的 Uniswap V3 池的地址
  const poolAddress = "0xD202E691D2B66E92FEd6c8ac91dB54Fee62aD47d";

  const poolContract = new ethers.Contract(poolAddress, UniswapV3PoolABI, provider);

  poolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, tick) => {
    console.log("Swap event:");
    console.log("Sender:", sender);
    console.log("Recipient:", recipient);
    console.log("Amount0:", amount0.toString());
    console.log("Amount1:", amount1.toString());
    console.log("sqrtPriceX96:", sqrtPriceX96.toString());
    console.log("Tick:", tick.toString());
  });

  // 等待新的区块
  provider.on("block", () => {
    console.log("New block received. Waiting for swaps...");
  });
}

main()
  .then(() => console.log("Started listening for swaps..."))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  // npx hardhat run --network private .\scripts\transactionMoniterAfter.js