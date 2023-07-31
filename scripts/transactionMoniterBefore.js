const { ethers, utils } = require('ethers');
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const ERC20ABI = require('./abi.json');
const contractInterface = new ethers.utils.Interface(SwapRouterABI);

const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049');
const WALLET_ADDRESS = '0xB77be9138A4eCd565a8DdDF5D053869CbD81b292';
const wallet = new ethers.Wallet('0x31ff99f36fa5cc07da13ec536874df5731221ecdf2a6c6cb838caf2102efd7b9', provider);
const swapRouterAddress = '0x396677bb50B1CCA075F344c44503CA63f7b69cdc';
const tokenUSDCAddress = '0x13220c3b521A175c8E54D0ff6ed8E8CdD0f58867';//usdc
const tokenUSDTAddress = '0xA2f0009b48a721c30B729bcbF2fc599C6C881d7b'; //usdt
const decimals0 = 18
const inputAmount = 30000//000
// .001 => 1 000 000 000 000 000
const tokenAmountIn = ethers.utils.parseUnits(
  inputAmount.toString(),
  decimals0
)

// const outputAmount = 10
//   // .001 => 1 000 000 000 000 000
//   const tokenOutAmount = ethers.utils.parseUnits(
//     inputAmount.toString(),
//     decimals0
//   )
// const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
// const sqrtPriceLimitX96 = 0;
// const gasLimit = '0x' + (8000000).toString(16);


// Connect to the tokens and approve the SwapRouter to manage the tokens
const tokenUSDCContract = new ethers.Contract(tokenUSDCAddress, ERC20ABI, provider);
const tokenUSDTContract = new ethers.Contract(tokenUSDTAddress, ERC20ABI, provider);
//下面的方法是检查余额
async function checkBalance() {
  const balanceUSDC = await tokenUSDCContract.balanceOf(WALLET_ADDRESS);
  const balanceUSDT = await tokenUSDTContract.balanceOf(WALLET_ADDRESS);
  console.log('USDC balance:', ethers.utils.formatUnits(balanceUSDC, decimals0));
  console.log('USDT balance:', ethers.utils.formatUnits(balanceUSDT, decimals0));
}

checkBalance().catch(console.error);
//下面的方法是授权，授权后才能进行交易
async function approveTokens() {
  const approvalResponseUSDC = await tokenUSDCContract.connect(wallet).approve(swapRouterAddress, tokenAmountIn);
  const approvalResponseUSDT = await tokenUSDTContract.connect(wallet).approve(swapRouterAddress, tokenAmountIn);
  await approvalResponseUSDC.wait();
  await approvalResponseUSDT.wait();
  console.log('Tokens approved');
}

approveTokens().catch(console.error);

async function main() {
  provider.on("pending", async (txHash) => {
    if (typeof txHash === 'object' && txHash.hash) {
      txHash = txHash.hash;
    }
    const transaction = await provider.getTransaction(txHash);
    if (transaction && transaction.to === swapRouterAddress) {
      try {
        if (transaction.from.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
          console.log("Skipping my own transaction.");
          return;
        }
        const decodedData = contractInterface.parseTransaction({ data: transaction.data });
        const amountIn = decodedData.args[0].amountIn;//这里从捕获的交易中获取输入数量
        const amountOutMinimum = ethers.utils.parseUnits(decodedData.args[0].amountOutMinimum.toString(), 18);

        const currentPrice = ethers.utils.parseUnits("1", 18);//这里是当前价格，这里是1，也就是1:1，转换成wei
        const expectedAmountOut = amountIn.mul(currentPrice);//其实就是乘以1，也就是不变
        const minimumAcceptableAmountOut = expectedAmountOut.mul(99).div(100);

        if (amountOutMinimum.lt(minimumAcceptableAmountOut)) {//这里是判断最小输出是否小于期望输出的99%
          console.log('amountIn: ', amountIn);
          console.log(`Transaction is unsafe. Expected amount out: ${expectedAmountOut.toString()} wei`);

          const swapRouterContract = new ethers.Contract(
            swapRouterAddress,
            SwapRouterABI,
            provider
          )
          // Front-run transaction
          const paramsFront = {
            tokenIn: tokenUSDCAddress,
            tokenOut: tokenUSDTAddress,
            fee: 500,
            recipient: WALLET_ADDRESS,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: tokenAmountIn,
            amountOutMinimum: 0,//utils.parseUnits('0', decimals0),//修改这里可以调整最小输出，也就是这里控制slippage
            sqrtPriceLimitX96: 0,//这里是限制价格，0表示不限制
          }

          const gasPrice = ethers.utils.parseUnits('2', 'gwei'); // 10 Gwei
          // Send the front-run transaction
          const transactionFront = await swapRouterContract.connect(wallet).exactInputSingle(
            paramsFront,
            {
              gasLimit: '8000000', // Set the gas limit
              gasPrice: gasPrice, // Set the gas price
            }
          )
          console.log('transactionFront:', transactionFront)


          // Wait for the original transaction to be mined
          const receipt = await provider.waitForTransaction(txHash);
          console.log(`Transaction mined: ${receipt.transactionHash}`);

          // Sandwich transaction
          const paramsAfter = {
            tokenIn: tokenUSDTAddress,
            tokenOut: tokenUSDCAddress,
            fee: 500,
            recipient: WALLET_ADDRESS,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: tokenAmountIn,
            amountOutMinimum: 0,//utils.parseUnits('0', decimals0),//修改这里可以调整最小输出，也就是这里控制slippage
            sqrtPriceLimitX96: 0,//这里是限制价格，0表示不限制
          }

          const transactionAfter = await swapRouterContract.connect(wallet).exactInputSingle(
            paramsAfter,
            {
              gasLimit: '8000000', // Set the gas limit
              gasPrice: ethers.utils.parseUnits('1', 'gwei'),// 1 Gwei, // Set the gas price
              value: ethers.utils.parseUnits("0.21", "ether"),//这里是手续费，0.21eth
            }
          )
          console.log('transactionAfter:', transactionAfter)
          // const receiptAfter = await transaction.wait()
          // console.log('receiptAfter:', receiptAfter)
        } else {
          console.log("Transaction is safe.");
        }
      } catch (error) {
        console.log("Error decoding transaction: ", error);
      }
    }
  });
}

main()
  .then(() => console.log("Started listening for pending transactions..."))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
