// const { ethers } = require("hardhat");
const { ethers, utils } = require('ethers')
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')
const { getPoolImmutables } = require('./helpers')
const ERC20ABI = require('./abi.json')

require('dotenv').config()
const INFURA_URL_TESTNET = "http://192.168.1.168:9049"
const WALLET_ADDRESS = "0xd5B22712eFa2517758fD6946C859daD5dc7732f6"
const WALLET_SECRET = "0x3f0b6f4739c7f378b45b38b0ad8295c1e5809837a44019fedd7c15301767cc5e"

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET) // Ropsten
const poolAddress = process.env.USDT_USDC_500
const swapRouterAddress = process.env.SWAP_ROUTER_ADDRESS

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = process.env.TETHER_ADDRESS

const name1 = 'Uniswap Token'
const symbol1 = 'UNI'
const decimals1 = 18
const address1 = process.env.USDC_ADDRESS

async function main() {
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
  )

  const immutables = await getPoolImmutables(poolContract)
  // const state = await getPoolState(poolContract)
  const slot0 = await poolContract.slot0()
  //输出流动性池信息
  poolContract.liquidity().then(liquidity => {
    console.log('liquidity:', liquidity.toString())
  })

  //输出池子信息
  //console.log('immutables:', immutables)
  // console.log('state:', slot0)

  const wallet = new ethers.Wallet(WALLET_SECRET)
  const connectedWallet = wallet.connect(provider)

  const swapRouterContract = new ethers.Contract(
    swapRouterAddress,
    SwapRouterABI,
    provider
  )

  const inputAmount = 7000//1500
  // .001 => 1 000 000 000 000 000
  const amountIn = ethers.utils.parseUnits(
    inputAmount.toString(),
    decimals0
  )
    console.log('amountIn:', amountIn.toString())
  const approvalAmount = amountIn//(amountIn * 100000).toString()
  const tokenContract0 = new ethers.Contract(
    address0,
    ERC20ABI,
    provider
  )
  const approvalResponse0 = await tokenContract0.connect(connectedWallet).approve(
    swapRouterAddress,
    approvalAmount
  )
  const tokenContract1 = new ethers.Contract(
    address1,
    ERC20ABI,
    provider
  )
  const approvalResponse1 = await tokenContract1.connect(connectedWallet).approve(
    swapRouterAddress,
    approvalAmount
  )

  const params = {
    tokenIn: immutables.token0,//这个根据交易对的不同而不同
    tokenOut: immutables.token1,//
    fee: immutables.fee,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    amountIn: amountIn,
    amountOutMinimum: utils.parseUnits('0', decimals1),//修改这里可以调整最小输出，也就是这里控制slippage
    sqrtPriceLimitX96: 0,//这里是限制价格，0表示不限制
  }
  const gasPrice = ethers.utils.parseUnits('1', 'gwei'); // 1 Gwei
  const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(
    params,
    {
      // gasLimit: ethers.utils.hexlify(1000000) 可以研究下差别
      gasLimit: '8000000', // Set the gas limit
      gasPrice: gasPrice, // Set the gas price
    }
  )
  // console.log('transaction:', transaction)
  // const receipt = await transaction.wait()
  // console.log('receipt:', receipt)
}

main()

//  npx hardhat run --network private .\scripts\uniswapTrader.js