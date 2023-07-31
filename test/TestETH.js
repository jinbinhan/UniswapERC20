const { expect } = require("chai");
// const { ethers } = require("hardhat");

describe("ETH Balance", function () {
  let owner;

  beforeEach(async function () {
    // 获取特定账户的签名者
    owner = await ethers.provider.getSigner("0xd5B22712eFa2517758fD6946C859daD5dc7732f6");
  });

  it("Should get the balance of a specific account", async function () {
    // 获取以太坊余额（以wei为单位）
    let balance = await owner.getBalance();
    
    // ethers.utils.formatEther函数可以将余额从wei转换为ETH
    console.log(`Balance of owner (in ETH): ${ethers.utils.formatEther(balance)}`);
  });
});
// npx hardhat test --network private .\test\TestETH.js  