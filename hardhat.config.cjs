require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
      accounts: [
        `de8f0004817778640ef82a0c1a0a32e9e3b82e191658f1be007fff7b6a997c26`,
      ],
    },
  },
  solidity: {
    version: "0.8.0",
  },
  etherscan: {
    apiKey: {
      sepolia: `${process.env.NEXT_PUBLIC_SEPOLIA_ETHERSCAN_API_KEY}`,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
