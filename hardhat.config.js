
require("@nomiclabs/hardhat-waffle");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    private: {
      url: "http://192.168.1.168:9049", // 替换为您的私人节点的URL
      accounts: ["0x31ff99f36fa5cc07da13ec536874df5731221ecdf2a6c6cb838caf2102efd7b9","0x3f0b6f4739c7f378b45b38b0ad8295c1e5809837a44019fedd7c15301767cc5e","0xbf9373ab06698060011859f200ff2c20deda1f9cabb9ab41e2368e47c86472cd"], // 替换为您的私人账户的私钥
      chainId: 12345,
    },
  },
  solidity: "0.8.18",
};
