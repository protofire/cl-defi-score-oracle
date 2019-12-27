require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')

const privateKey = process.env.PK.replace(/^0x/, '')
const url = process.env.RPC_URL

module.exports = {
  networks: {
    cldev: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    kovan: {
      provider: () => new HDWalletProvider(privateKey, url),
      network_id: 42
    },
    live: {
      provider: () => {
        return new HDWalletProvider(privateKey, url)
      },
      network_id: '*',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: '0.4.24',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'byzantium',
      },
    },
  },
}
