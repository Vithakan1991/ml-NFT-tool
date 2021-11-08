// Allows us to use ES6 in our migrations and tests.
require("babel-register");
require("babel-polyfill");

module.exports = {
  compilers: {
    solc: {
      version: "0.5.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000   // Optimize for how many times you intend to run the code
        },
      },
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
  },
};
