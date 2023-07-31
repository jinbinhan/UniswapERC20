const { ethers } = require("hardhat");

const { abi: UniswapV3RouterABI } = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const fs = require('fs');

function encodePath(path, fees) {
  const result = ethers.utils.concat(path.map((token, i) => 
    ethers.utils.concat([
      ethers.utils.getAddress(token),
      ethers.utils.hexZeroPad(ethers.BigNumber.from(fees[i]).toHexString(), 32)
    ])
  ));
  return result;
}

function getABI(file) {
  let json = fs.readFileSync(file, 'utf8');
  let obj = JSON.parse(json);
  return obj.abi;
}

// const UniswapV3RouterABI = getABI('./scripts/SwapRouter.json');

async function main() {
  const [, deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const routerAddress = "0xE71CFbaCf079A470915aA96bF7236fC0c0C7B1f8";
  const tokenAddresses = ["0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94", "0xE71d0c41973Ec3f273Db135e3eeA2666f63a9cd3"];
  const fees = ["3000", "3000"];

  const routerContract = new ethers.Contract(routerAddress, UniswapV3RouterABI, deployer);

  const params = {
    path: encodePath(tokenAddresses, fees),
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    amountIn: ethers.utils.parseUnits("4.0", 18),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const tx = await routerContract.exactInput(params, { value: params.amountIn, gasLimit:  ethers.utils.hexlify(1000000) });
  const receipt = await tx.wait();

  console.log("Swap executed in transaction:", receipt.transactionHash);
}

main()
  .then(() => console.log("Swap completed"))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
