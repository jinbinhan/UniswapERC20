const { expect } = require("chai");
const { Contract } = require("ethers");
const fs = require('fs');

// 获取ABI
function getABI(file) {
  let json = fs.readFileSync(file, 'utf8');
  let obj = JSON.parse(json);
  let abi = obj.abi;
  return abi;
}

// 池子地址
const poolAddress = '0x1bA25a297Ad287BA469Cf6A713D19Df981c75436';

// 从文件获取池子 ABI
const poolABI = getABI('./scripts/UniswapV3Pool.json');

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0, token0, token1] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
    poolContract.token0(),
    poolContract.token1(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity.toString(),
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
    token0: token0,
    token1: token1,
  };
}

async function getPoolPositions(poolContract, ownerAddress) {
  const positionKey = ethers.utils.solidityKeccak256(['address', 'int24', 'int24'], [ownerAddress, -887272, 887272]);
  const [liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128, tokensOwed0, tokensOwed1] = await poolContract.positions(positionKey);
  return {
    liquidity: liquidity.toString(),
    feeGrowthInside0LastX128: feeGrowthInside0LastX128.toString(),
    feeGrowthInside1LastX128: feeGrowthInside1LastX128.toString(),
    tokensOwed0: tokensOwed0.toString(),
    tokensOwed1: tokensOwed1.toString(),
  };
}

describe("TestLiquidity", function() {
  it("Should return the right pool data and balances", async function() {
    const [owner] = await ethers.getSigners();

    // 创建池子合约对象
    const poolContract = new Contract(poolAddress, poolABI, owner);

    // 获取池子数据
    const poolData = await getPoolData(poolContract);
    console.log('poolData', poolData);

    // 获取池子代币余额
    const poolPositions = await getPoolPositions(poolContract, owner.address);
    console.log('poolPositions', poolPositions);

    // 使用 expect 来验证结果
    expect(poolData).to.not.be.null;
    // 如果你知道预期的结果，你也可以进行更具体的验证
    // expect(poolData.fee).to.equal(expectedFee);
  });
});
