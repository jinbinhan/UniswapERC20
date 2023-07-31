const { expect } = require("chai");
// const { ethers } = require("hardhat");

const fs = require('fs');
// 获取ABI
function getABI(file) {
  let json = fs.readFileSync(file, 'utf8');
  let obj = JSON.parse(json);
  let abi = obj.abi;
  return abi;
}

describe("WETH9 Contract", function () {
  let WETH9, owner;

  beforeEach(async function () {
    const WETH9_ABI = getABI('./WETH9.json')
    const WETH9_ADDRESS = "0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94";

    owner = await ethers.provider.getSigner("0xd5B22712eFa2517758fD6946C859daD5dc7732f6");
    WETH9 = new ethers.Contract(WETH9_ADDRESS, WETH9_ABI, owner);
  });

  it("Should deposit ETH and get WETH", async function () {
    const depositAmount = ethers.utils.parseEther("2000"); // Change this to the amount of ETH you want to wrap

    // We need to override the default transaction values to include enough ETH
    const overrides = {
      value: depositAmount // This sends the necessary amount of Ether along with the transaction
    };

    // Call the deposit function
    await WETH9.deposit(overrides);

    // Check the WETH balance of the account
    let balance = await WETH9.balanceOf(await owner.getAddress());
    console.log(`Balance of owner in WETH: ${ethers.utils.formatEther(balance)}`);
  });
});
//npx hardhat test --network private ./test/TestConvertETHTOWETH.js
