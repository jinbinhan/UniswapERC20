// Uniswap contract addresses
POSITION_MANAGER_ADDRESS= '0x1509Cc8BB51c93043359Fa777759AC9f7559FaC8' 
const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')

// Pool addresses
// WETH_SETH_500= '0x20Fb215C00018a522A10b254278805B65Bca4a4F'
LETH_SETH_500= '0x1bA25a297Ad287BA469Cf6A713D19Df981c75436'

// Token addresses
// WETH_ADDRESS= '0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94'//token0
LETH_ADDRESS= '0xcF9A7ED0070A471A8e289328704B2a1F6A35DFd2'//token1
SETH_ADDRESS= '0xE71d0c41973Ec3f273Db135e3eeA2666f63a9cd3'// token1 

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

const artifacts = {
  NonfungiblePositionManager: getABI('./scripts/NonfungiblePositionManager.json'),
  // WETH: getABI('./WETH9.json'),//token0
  LETH: require("../artifacts/contracts/LinToken.sol/LinToken.json"),//token0
  SETH: require("../artifacts/contracts/SaitToken.sol/SaitToken.json"),//token1
  UniswapV3Pool: getABI('./scripts/UniswapV3Pool.json'),//pool
};



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
  const [owner, signer2] = await ethers.getSigners();//这里的signer2是0xd5B22712eFa2517758fD6946C859daD5dc7732f6作用是给第2个账户授权然后添加流动性

  const provider = waffle.provider;

  const LETHContract = new Contract(LETH_ADDRESS,artifacts.LETH.abi,provider)//token0
  const SETHContract = new Contract(SETH_ADDRESS,artifacts.SETH.abi,provider)//token1

  await LETHContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))//token0  这里的1000是指授权的数量，这里是1000个WETH
  await SETHContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'))//token1

  const poolContract = new Contract(LETH_SETH_500, artifacts.UniswapV3Pool, provider)

  const poolData = await getPoolData(poolContract)

  const LETHToken = new Token(12345, LETH_ADDRESS, 18, 'LETH', 'LinToken')//这里将31337改成了12345，因为这里的31337是指chainId，而我们的chainId是12345
  const SETHToken = new Token(12345, SETH_ADDRESS, 18, 'SETH', 'SaitToken')

  const pool = new Pool(
    LETHToken,
    SETHToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('10000'), // 这里是指添加流动性的数量，这里是10000个WETH和10000个SETH
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,//这里是设置价格范围。tickLower是最低价格，tickUpper是最高价格。这里是设置价格范围为-1000到1000。
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  params = {
    token0: LETH_ADDRESS,
    token1: SETH_ADDRESS,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS, // address of deployed contract
    artifacts.NonfungiblePositionManager,
    provider
  )

  const tx = await nonfungiblePositionManager.connect(owner).mint(
    params,
    { gasLimit: '1000000' }
  )
  // 等待交易被确认并获取回执
  const receipt = await tx.wait()

  // 在回执的事件列表中找到 Transfer 事件
  const transferEvent = receipt.events.find(e => e.event === 'Transfer')

  // 从 Transfer 事件中提取 tokenId
  const tokenId = transferEvent.args.tokenId

  console.log("The tokenId for your new liquidity position is:", tokenId.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

    /*
npx hardhat run --network private scripts/addLiquidity.js

*/