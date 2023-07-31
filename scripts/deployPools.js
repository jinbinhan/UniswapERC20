// Token addresses
SETH_ADDRESS= '0x7b656D2B04a5858b8099909b4A90298111580602'// SETH 
LETH_ADDRESS= '0x9cb41db9a034e4A95004F2eBD72F064E7cE6d496'//0xcF9A7ED0070A471A8e289328704B2a1F6A35DFd2

// Uniswap contract address
// WETH_ADDRESS= '0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94'
FACTORY_ADDRESS= '0x2a9Eb45c24825484cc6610d9bB166AE3b8BF23BB'//
POSITION_MANAGER_ADDRESS= '0x38Ef4f1e0DE865C7c416BB5652aaF3E455D16D43'//这个地址是从哪里来的呢？这个地址是从swapRouter的代码里面拿过来的，这个地址是固定的，不需要修改

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
  UniswapV3Factory: getABI('./scripts/UniswapV3Factory.json'),//require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: getABI('./scripts/NonfungiblePositionManager.json'),//require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
   // UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
   // NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),

};

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 18 }) //这里是关键，需要设置成这样才能得到正确的结果，这个的作用是设置最大的指数和小数位数
//这里参数的意思是：EXPONENTIAL_AT: 999999表示最大的指数是999999，DECIMAL_PLACES: 40表示小数位数是40位，他们的作用是设置最大的指数和小数位数，为什么不是18？因为uniswap的价格是用的18位小数，所以这里的小数位数要设置成18位，但是这里的指数是指数的最大值，不是指数的位数，所以这里的指数要设置成999999，这样才能得到正确的结果

const provider =  waffle.provider;

//这个函数是计算价格的，这个函数是从uniswap的代码里面拿过来的，这个函数的作用是计算价格的，这个函数的作用是计算价格的，这个函数的作用是计算价格的，重要的事情说三遍
function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))//这里的2的96次方是固定的，不需要修改
      .integerValue(3)//这里的3是固定的，不需要修改
      .toString()
  )
}

//这里是创建合约的实例
const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,//这个参数是合约地址，这个地址是从swapRouter的代码里面拿过来的，这个地址是固定的，不需要修改
  artifacts.NonfungiblePositionManager,
  provider
)
//这里是创建合约的实例
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory,
  provider
)

//这里是部署合约的函数
async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }//这里是设置gas的
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}

async function main() {
    //下面的代码意思是：部署交易对，价格是1:1，如果需要部署其他的交易对，可以修改下面的代码，500是手续费，这个是固定的，不需要修改
  const wethseth500 = await deployPool(LETH_ADDRESS, SETH_ADDRESS, 500, encodePriceSqrt(1, 10))//这次增加的是LETH和SETH的交易对，这个交易对的价格是1:10，如果需要修改价格，可以修改这里的代码
  console.log('LETH_SETH_500=', `'${wethseth500}'`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /*
npx hardhat run --network private scripts/deployPools.js

*/