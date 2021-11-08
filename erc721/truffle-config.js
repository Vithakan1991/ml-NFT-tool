require("babel-register");
require("@babel/polyfill");

const HDWalletProvider = require("@truffle/hdwallet-provider");

const fs = require("fs");
const path = require("path");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      provider: () => {
        const privatekey = fs
          .readFileSync(`${path.dirname(__filename)}/.secret.rinkeby`)
          .toString();
        return new HDWalletProvider(
          privatekey,
          "https://rinkeby.infura.io/v3/34b8cb070feb45619332c8867301bdaa"
        );
      },
      network_id: 4,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mainnet: {
      provider: () => {
        const privatekey = fs
          .readFileSync(`${path.dirname(__filename)}/.secret.mainnet`)
          .toString();
        return new HDWalletProvider(
          privatekey,
          "https://mainnet.infura.io/v3/34b8cb070feb45619332c8867301bdaa"
        );
      },
      network_id: 1,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    matictestnet: {
      provider: () => {
        const privatekey = fs
          .readFileSync(`${path.dirname(__filename)}/.secret.matictestnet`)
          .toString();
        return new HDWalletProvider(
          privatekey,
          "https://rpc-mumbai.maticvigil.com/"
        );
      },
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    maticmainnet: {
      provider: () => {
        const privatekey = fs
          .readFileSync(`${path.dirname(__filename)}/.secret.maticmainnet`)
          .toString();
        return new HDWalletProvider(
          privatekey,
          "https://rpc-mainnet.maticvigil.com/"
        );
      },
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
      parser: "solcjs",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
