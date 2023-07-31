const { expect } = require("chai");

describe("SaitToken contract", function () {
  let myToken, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SaitToken");
    myToken = Token.attach("0x62415A2941636200D4a104e38A604bD95471b5b1"); // 替换为你的合约地址
  });

  describe("Information", function () {
    it("Should get the total supply", async function () {
      let totalSupply = await myToken.totalSupply();
      console.log(`Total Supply: ${totalSupply}`);
    });

    it("Should get the name", async function () {
      let name = await myToken.name();
      console.log(`Token Name: ${name}`);
    });

    it("Should get the symbol", async function () {
      let symbol = await myToken.symbol();
      console.log(`Token Symbol: ${symbol}`);
    });

    it("Should get the balance of a specific account", async function () {
      let balance = await myToken.balanceOf(owner.address);
      console.log(`Balance of owner: ${balance}`);
    });
    //指定账户的余额
    it("Should get the balance of a specific account", async function () {
      let balance = await myToken.balanceOf("0xB77be9138A4eCd565a8DdDF5D053869CbD81b292");
      console.log(`Balance of owner: ${balance}`);
    }
    );
  });
});
//npx hardhat test --network private .\test\TestMyToken.js
