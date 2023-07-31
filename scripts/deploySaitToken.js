async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const saitToken = await ethers.deployContract("LinToken", [1000000000]);

  console.log("SaitToken address:", saitToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run --network private scripts/deploySaitToken.js
