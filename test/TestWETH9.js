const { expect } = require("chai");
// const { ethers } = require("hardhat");

const fs = require('fs');
// 获取ABI
function getABI(file) {
  // 读取智能合约编译后的JSON文件
  let json = fs.readFileSync(file, 'utf8');
  // 解析JSON文件获取ABI
  let obj = JSON.parse(json);
  let abi = obj.abi;
  // console.log(abi);
  return abi;
}

describe("WETH9 Contract", function () {
  let WETH9, weth9, owner, addr1;

  beforeEach(async function () {
    // 这里假设你已经有了 WETH9 的 ABI 和部署地址
    const WETH9_ABI = getABI('./WETH9.json')// require("../artifacts/contracts/WETH9.sol/WETH9.json").abi;
    const WETH9_ADDRESS = "0x57fe44c6727015Ce86F984DD4D5eAbc972e04A94"; // 替换为你的 WETH9 合约地址

    //[owner, addr1] = await ethers.getSigners();
    owner = await ethers.provider.getSigner("0xd5B22712eFa2517758fD6946C859daD5dc7732f6");

    WETH9 = new ethers.Contract(WETH9_ADDRESS, WETH9_ABI, owner);
  });

  describe("Information", function () {
    it("Should get the name", async function () {
      let name = await WETH9.name();
      console.log(`Token Name: ${name}`);
    });

    it("Should get the symbol", async function () {
      let symbol = await WETH9.symbol();
      console.log(`Token Symbol: ${symbol}`);
    });

    it("Should get the total supply", async function () {
      let totalSupply = await WETH9.totalSupply();
      console.log(`Total Supply: ${totalSupply.toString()}`);
    });

    it("Should get the owner", async function () {
        //console.log(`Owner: ${owner.address}`);
        console.log(`Owner: ${await owner.getAddress()}`);
    });    

    it("Should get the balance of a specific account", async function () {
      let balance = await WETH9.balanceOf(await owner.getAddress());
    //   console.log(`Balance of owner: ${balance.toString()}`);
      console.log(`Balance of owner in WETH: ${ethers.utils.formatEther(balance)}`);//ethers.utils.formatEther(balance)将余额从wei转换为ETH
    });
  });
});
//npx hardhat test --network private .\test\TestWETH9.js