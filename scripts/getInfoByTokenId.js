// const { ethers } = require("hardhat")
const fs = require('fs');

// Replace with your values
const tokenId = 4;
const POSITION_MANAGER_ADDRESS = '0x1509Cc8BB51c93043359Fa777759AC9f7559FaC8';

// 获取ABI
function getABI(file) {
  let json = fs.readFileSync(file, 'utf8');
  let obj = JSON.parse(json);
  let abi = obj.abi;
  return abi;
}

// Get the ABI from the correct JSON file
const artifacts = {
  NonfungiblePositionManager: getABI('./scripts/NonfungiblePositionManager.json'),
};

async function getPositionData(positionManager, tokenId) {
  const position = await positionManager.positions(tokenId);
  return {
    nonce: position.nonce.toString(),
    operator: position.operator,
    token0: position.token0,
    token1: position.token1,
    fee: position.fee.toString(),
    tickLower: position.tickLower.toString(),
    tickUpper: position.tickUpper.toString(),
    liquidity: position.liquidity.toString(),
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128.toString(),
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128.toString(),
    tokensOwed0: position.tokensOwed0.toString(),
    tokensOwed1: position.tokensOwed1.toString(),
  };
}

async function main() {
  const [owner] = await ethers.getSigners();

  // Create a Contract object for NonfungiblePositionManager
  const positionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager,
    owner
  );

  // Get position data
  const positionData = await getPositionData(positionManager, tokenId);
  
  console.log("Position data for your liquidity position is:", positionData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
