const { ethers, utils } = require('ethers');
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const ERC20ABI = require('./abi.json');
const contractInterface = new ethers.utils.Interface(SwapRouterABI);

const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049');
const WALLET_ADDRESS = '0xB77be9138A4eCd565a8DdDF5D053869CbD81b292';
const wallet = new ethers.Wallet('0x31ff99f36fa5cc07da13ec536874df5731221ecdf2a6c6cb838caf2102efd7b9', provider);
const swapRouterAddress = '0x396677bb50B1CCA075F344c44503CA63f7b69cdc';
const tokenInAddress = '0x13220c3b521A175c8E54D0ff6ed8E8CdD0f58867'; //usdc
const tokenOutAddress = '0xA2f0009b48a721c30B729bcbF2fc599C6C881d7b'; //usdt
const decimals0 = 18
const inputAmount = 100
  // .001 => 1 000 000 000 000 000
  const tokenInAmount = ethers.utils.parseUnits(
    inputAmount.toString(),
    decimals0
  )
// const tokenInAmount = ethers.utils.parseEther('1');
// const tokenOutAmount = ethers.utils.parseEther('1');
const outputAmount = 10
  // .001 => 1 000 000 000 000 000
  const tokenOutAmount = ethers.utils.parseUnits(
    inputAmount.toString(),
    decimals0
  )
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
const sqrtPriceLimitX96 = 0;
const gasLimit = '0x' + (8000000).toString(16);


// Connect to the tokens and approve the SwapRouter to manage the tokens
const tokenInContract = new ethers.Contract(tokenInAddress, ERC20ABI, provider);
const tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20ABI, provider);

async function approveTokens() {
  const approvalResponseIn = await tokenInContract.connect(wallet).approve(swapRouterAddress, tokenInAmount);
  const approvalResponseOut = await tokenOutContract.connect(wallet).approve(swapRouterAddress, tokenOutAmount);
  await approvalResponseIn.wait();
  await approvalResponseOut.wait();
  console.log('Tokens approved' );
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
        const amountIn = decodedData.args[0].amountIn;
        const amountOutMinimum = ethers.utils.parseUnits(decodedData.args[0].amountOutMinimum.toString(), 18);

        const currentPrice = ethers.utils.parseUnits("1", 18);
        const expectedAmountOut = amountIn.mul(currentPrice);
        const minimumAcceptableAmountOut = expectedAmountOut.mul(99).div(100);

        if (amountOutMinimum.lt(minimumAcceptableAmountOut)) {
          console.log('amountIn: ', amountIn);
          console.log(`Transaction is unsafe. Expected amount out: ${expectedAmountOut.toString()} wei`);
          const swapRouterContract = new ethers.Contract(
            swapRouterAddress,
            SwapRouterABI,
            provider
          )
          // Front-run transaction
          // const path = ethers.utils.concat([tokenInAddress, tokenOutAddress]); 可能没用
          const frontrunTx = {
            to: swapRouterAddress,
            data: contractInterface.encodeFunctionData("exactInputSingle", [{
              tokenIn: tokenInAddress,
              tokenOut: tokenOutAddress,
              fee: 500,
              recipient: wallet.address,
              deadline: deadline,
              amountIn: tokenInAmount,
              amountOutMinimum: minimumAcceptableAmountOut,
              sqrtPriceLimitX96: sqrtPriceLimitX96,
            }]),
            gasPrice: ethers.utils.parseUnits('100', 'gwei'),
            gasLimit: gasLimit,
          };
          const params = {
            tokenIn: tokenInAddress,//这个根据交易对的不同而不同
            tokenOut: tokenOutAddress,//
            fee:500,
            recipient: WALLET_ADDRESS,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: tokenInAmount,
            amountOutMinimum: utils.parseUnits('0', decimals0),//修改这里可以调整最小输出，也就是这里控制slippage
            sqrtPriceLimitX96: 0,//这里是限制价格，0表示不限制
          }

          const transaction = await swapRouterContract.connect(wallet).exactInputSingle(
            params,
            {
              // gasLimit: ethers.utils.hexlify(1000000) 可以研究下差别
              gasLimit: '8000000'
            }
          )
          console.log('transaction:', transaction)
          // Send the front-run transaction
          // let txResponse = await wallet.sendTransaction(frontrunTx);
          // console.log(`Front-run tx sent: ${txResponse.hash}`);
          // await txResponse.wait();

          // Wait for the original transaction to be mined
          const receipt = await provider.waitForTransaction(txHash);
          console.log(`Transaction mined: ${receipt.transactionHash}`);

          // Sandwich transaction
          const sandwichTx = {
            to: swapRouterAddress,
            data: contractInterface.encodeFunctionData("exactInputSingle", [{
              tokenIn: tokenInAddress,
              tokenOut: tokenOutAddress,
              fee: 500,
              recipient: wallet.address,
              deadline: deadline,
              amountIn: tokenInAmount,
              amountOutMinimum: minimumAcceptableAmountOut,
              sqrtPriceLimitX96: sqrtPriceLimitX96,
            }]),
            gasPrice: ethers.utils.parseUnits('100', 'gwei'),
            gasLimit: gasLimit,
          };

          // Send the sandwich transaction
          // txResponse = await wallet.sendTransaction(sandwichTx);
          // console.log(`Sandwich tx sent: ${txResponse.hash}`);
          // await txResponse.wait();

          const params2 = {
            tokenIn: tokenOutAddress,//这个根据交易对的不同而不同
            tokenOut: tokenInAddress,//
            fee:500,
            recipient: WALLET_ADDRESS,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: tokenInAmount,
            amountOutMinimum: utils.parseUnits('0', decimals0),//修改这里可以调整最小输出，也就是这里控制slippage
            sqrtPriceLimitX96: 0,//这里是限制价格，0表示不限制
          }

          const transaction2 = await swapRouterContract.connect(wallet).exactInputSingle(
            params2,
            {
              // gasLimit: ethers.utils.hexlify(1000000) 可以研究下差别
              gasLimit: '8000000'
            }
          )
          console.log('transaction:', transaction2)
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
