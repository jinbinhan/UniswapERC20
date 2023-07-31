const ethers = require('ethers');
const { abi: SwapRouterABI } = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const provider = new ethers.providers.JsonRpcProvider('http://192.168.1.168:9049'); // 使用你自己的以太坊节点地址

async function getUniswapV3SwapDetails(txHash) {
  const tx = await provider.getTransaction(txHash);
  const txReceipt = await tx.wait();
  
  const contractInterface = new ethers.utils.Interface(SwapRouterABI);
  const parsed = contractInterface.parseTransaction({ data: tx.data });

  console.log('Block Number: ', tx.blockNumber);
  console.log('Transaction Index: ', tx.transactionIndex);
  console.log('From: ', tx.from);
  console.log('To: ', tx.to);
  console.log('Gas Price: ', tx.gasPrice.toString());
  console.log('Gas Limit: ', tx.gasLimit.toString());
  console.log('Gas Used: ', txReceipt.gasUsed.toString());
  console.log('Function Name: ', parsed.name); // e.g., exactInputSingle
  console.log('Function Args: ', parsed.args); // This will print out all the args for the function
  console.log('Transaction Status: ', txReceipt.status ? 'Success' : 'Failed');
}

getUniswapV3SwapDetails('0x73182eb2f1296a06b74beba3d4fe7ed640213009918f3c927404d69e03277302');
