// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.0',
  paths: {
    artifacts: './src/artifacts',
  },
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/8fi1Zv8bm5Js_k4HyyfXMtiBNE5Wy_pB',
      accounts: ['PRIVATE'],
    },
  },
};
