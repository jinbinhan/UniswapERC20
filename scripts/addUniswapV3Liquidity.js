const { ethers } = require("hardhat");
require('dotenv').config()

TETHER_ADDRESS = process.env.TETHER_ADDRESS
USDC_ADDRESS = process.env.USDC_ADDRESS
WRAPPED_BITCOIN_ADDRESS = process.env.WRAPPED_BITCOIN_ADDRESS
WETH_ADDRESS = process.env.WETH_ADDRESS
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS
USDT_USDC_500 = process.env.USDT_USDC_500


const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = ethers.provider

  const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  await usdtContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'))
  await usdcContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'))

  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)

  const UsdtToken = new Token(12345, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(12345, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  const pool = new Pool(
    UsdtToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )
 console.log('-------------------------------', nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 0)
 console.log('+++++++++++++++++++++++++++++++', nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 0)
 console.log('poolData.tick', poolData.tick)
  console.log('poolData.tickSpacing', poolData.tickSpacing)
  console.log('poolData.fee', poolData.fee)
  console.log('poolData.liquidity', poolData.liquidity)
  console.log('poolData.sqrtPriceX96', poolData.sqrtPriceX96.toString())

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('10000000'),//这样设置100000导致扣除了100个币。
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing)- poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  })
  
  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts
  
  console.log('amount0Desired', amount0Desired.toString())
  console.log('amount1Desired', amount1Desired.toString())
  
  params = {
    token0: USDC_ADDRESS,
    token1:TETHER_ADDRESS ,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 10,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 10,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  const tx = await nonfungiblePositionManager.connect(owner).mint(
    params,
    { gasLimit: '8000000' }
  )
  const receipt = await tx.wait()
  console.log('Transaction receipt:', receipt);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  //npx hardhat run --network private scripts/addUniswapV3Liquidity.js
  
