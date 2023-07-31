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
//const { abi: UniswapV3Factory } = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json");
//const { abi: NonfungiblePositionManager } = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");
const artifacts = {
    UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
    NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  };
  
const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
const { promisify } = require("util");
const fs = require("fs");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })// 这里

// const provider = ethers.provider
const provider = ethers.getDefaultProvider("http://192.168.1.168:9049");

//输出provider 来检查问题
// console.log('provider', provider)

//这个函数用来计算价格的平方根
function encodePriceSqrt(reserve1, reserve0) {
    return BigNumber.from(
        new bn(reserve1.toString())
            .div(reserve0.toString())
            .sqrt()
            .multipliedBy(new bn(2).pow(96))
            .integerValue(3)
            .toString()
    )
}

const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
)

const factory = new Contract(
    FACTORY_ADDRESS,
    artifacts.UniswapV3Factory.abi,
    provider
)

async function deployPool(token0, token1, fee, price) {
    const [owner] = await ethers.getSigners();
    console.log('owner', owner.address)
    console.log('provider', provider)

    //判断是否已经创建过池子
    const poolAddress2 = await factory.connect(owner).getPool(
        token0,
        token1,
        fee,
    )
    console.log('poolAddress2===========================', poolAddress2)
    if (poolAddress2 != '0x0000000000000000000000000000000000000000') {
        //console.log('poolAddress===========================', poolAddress2)
        console.log('============================================', poolAddress2)
        return poolAddress
    }else{
        //console.log('poolAddress2===========================', poolAddress2)
    }

    const txResponse =  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
        token0,
        token1,
        fee,
        price,
        { gasLimit: 8000000 }//之前是5000000
    )
    // 打印交易哈希
    console.log(`Transaction hash: ${txResponse.hash}`);
    // 等待交易被挖矿并获取交易回执
    const receipt = await txResponse.wait();
    // 打印一些有用的信息
    console.log(`Transaction was mined in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`Transaction status: ${receipt.status ? 'success' : 'failure'}`);

    const poolAddress = await factory.connect(owner).getPool(
        token0,
        token1,
        fee,
    )
    return poolAddress
}

async function main() {
    // console.log('Deploying pools...')
    // console.log('TETHER_ADDRESS', TETHER_ADDRESS)
    // console.log('USDC_ADDRESS', USDC_ADDRESS)
    // console.log('FACTORY_ADDRESS', FACTORY_ADDRESS)
    // console.log('POSITION_MANAGER_ADDRESS', POSITION_MANAGER_ADDRESS)

    const usdtUsdc500 = await deployPool(USDC_ADDRESS, TETHER_ADDRESS,500, encodePriceSqrt(1, 10000))//500是手续费,这里参数是USDC/TETHER 哪个小哪个就作为token0
    try {
        // Your code here
        console.log('usdtUsdc500', usdtUsdc500)
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }

    
    //增加到.env文件中
    let addresses = [
        `USDT_USDC_500=${usdtUsdc500}`
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


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network private scripts/deployUniswapV3Pools.js