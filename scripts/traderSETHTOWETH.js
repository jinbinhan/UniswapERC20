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

const poolArtifact = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');
const routerArtifact = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');

const provider = ethers.provider

async function main() {
    const ERC20Artifact = await hre.artifacts.readArtifact("ERC20");
    const [a, signer] = await ethers.getSigners();
    const LETH = new ethers.Contract(TETHER_ADDRESS, ERC20Artifact.abi, signer);

    const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, routerArtifact.abi, signer);
    const poolContract = new ethers.Contract(USDT_USDC_500, poolArtifact.abi, signer);

    const amountIn = ethers.utils.parseEther('1',18);// 1 USDT
    const approveTx = await LETH.approve(SWAP_ROUTER_ADDRESS, amountIn);
    await approveTx.wait();

    const slot0 = await poolContract.slot0();

    const params = {
        tokenIn: TETHER_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: 500,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    const tx = await router.exactInputSingle(params);
    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);
}

main().catch(console.error);

//npx hardhat run --network private scripts/traderSETHTOWETH.js