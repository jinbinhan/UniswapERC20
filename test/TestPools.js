const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETH_ADDRESS = '0x2328bACE6cF03C388D335F6206317D0F415E9705'; // SETH 
const SETH_ADDRESS = '0xe0AB9a5B7b32F3e293673516FC5be1DfD76A49D9'; // WETH

const fs = require('fs');

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

describe("Uniswap V3 Deployed Pool Tests", function () {
  let pool;

  before(async function () {
    // 从已部署的地址处获取 Pool 合约实例
    // IUniswapV3PoolABI 需要替换为正确的 ABI，已部署池的地址需要替换为你的 Pool 的地址
    pool = await ethers.getContractAt(getABI('./scripts/UniswapV3Pool.json'), '0x4E360C4d864Ac94A3a7252719573108fe01E8d05');
  });

  it("Should have correct fee", async function () {
    const fee = await pool.fee();
    expect(fee).to.equal(500); // 检查费率是否正确
  });
  
  it("Should have correct token0", async function () {
    const token0 = await pool.token0();
    expect(token0).to.equal(WETH_ADDRESS); // 检查 token0 是否匹配
  });
  
  it("Should have correct token1", async function () {
    const token1 = await pool.token1();
    expect(token1).to.equal(SETH_ADDRESS); // 检查 token1 是否匹配
  });

  it("Should get correct pool state", async function () {
    const slot0 = await pool.slot0();
    console.log(`sqrtPriceX96: ${slot0.sqrtPriceX96.toString()}`);
    console.log(`tick: ${slot0.tick}`);
    console.log(`observationIndex: ${slot0.observationIndex}`);
    console.log(`observationCardinality: ${slot0.observationCardinality}`);
    console.log(`observationCardinalityNext: ${slot0.observationCardinalityNext}`);
    console.log(`twap: ${slot0.twap}`);
    console.log(`liquidity: ${slot0.liquidity}`);
  });

  // 根据需要添加更多的测试
});


//npx hardhat test --network private ./test/TestPools.js