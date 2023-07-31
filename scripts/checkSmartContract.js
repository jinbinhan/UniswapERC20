const { ethers } = require("hardhat");

async function main() {
  const [,deployer] = await ethers.getSigners();

  // 替换为你想要检查的合约的地址
  const contractAddress = "0x0000000000000000000000000000000000000000";

  const contractCode = await deployer.provider.getCode(contractAddress);

  if (contractCode === "0x") {
    console.log(`No contract is deployed at address ${contractAddress}`);
  } else {
    console.log(`A contract is deployed at address ${contractAddress}`);
  }
}

main()
  .then(() => console.log("Check completed"))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
// npx hardhat run --network private scripts/checkSmartContract.js