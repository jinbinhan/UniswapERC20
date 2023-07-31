const ethers = require('ethers');
const hre = require("hardhat");
const routerArtifact = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json')

const WETH_ADDRESS = '0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94';
const USDT_ADDRESS = '0xE71d0c41973Ec3f273Db135e3eeA2666f63a9cd3';
const ROUTER_ADDRESS= '0x49651A9E05Ece00f0eb263687613847076B4686a'; // Uniswap V3 router address

const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049');
// const provider = new ethers.providers.JsonRpcProvider("http://192.168.1.168:9049");
const wallet = new ethers.Wallet('0x31ff99f36fa5cc07da13ec536874df5731221ecdf2a6c6cb838caf2102efd7b9');
const signer = wallet.connect(provider);

const router = new ethers.Contract(ROUTER_ADDRESS, routerArtifact.abi, provider);

const logBalances = async () => {
    const ethBalance = await provider.getBalance(signer.address);
    const wethContract = new ethers.Contract(WETH_ADDRESS, await hre.artifacts.readArtifact("ERC20").abi, provider);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, await hre.artifacts.readArtifact("ERC20").abi, provider);
    const wethBalance = await wethContract.balanceOf(signer.address);
    const usdtBalance = await usdtContract.balanceOf(signer.address);
    console.log('--------------------');
    console.log('ETH Balance:', ethers.utils.formatEther(ethBalance));
    console.log('WETH Balance:', ethers.utils.formatEther(wethBalance));
    console.log('USDT Balance:', ethers.utils.formatUnits(usdtBalance, 6));
    console.log('--------------------');
};

const main = async () => {
    await signer.sendTransaction({
        to: WETH_ADDRESS,
        value: ethers.utils.parseEther('5')
    });
    await logBalances();

    const amountIn = ethers.utils.parseEther('1');
    const wethContract = new ethers.Contract(WETH_ADDRESS, await hre.artifacts.readArtifact("ERC20").abi, signer);
    const tx1 = await wethContract.approve(ROUTER_ADDRESS, amountIn);
    await tx1.wait();

    const params = {
        path: ethers.utils.hexConcat([WETH_ADDRESS, USDT_ADDRESS]),
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10, 
        amountIn,
        amountOutMinimum: 0
    };

    const tx2 = await router.connect(signer).exactInput(params, { gasLimit: 1000000 });
    await tx2.wait();

    await logBalances();
};

main();
