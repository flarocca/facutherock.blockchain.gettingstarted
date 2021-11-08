require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          }
        }
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/11dd077e259b486b92ee63c4c70ac903",
        //url: "https://eth-mainnet.alchemyapi.io/v2/k4aLWLwswQ9SsW44cHT8DEZ7mSEOQwop"
      }
    }
  }
};
