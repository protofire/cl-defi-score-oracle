require('dotenv').config()
const DefiScore = artifacts.require('DefiScore')

module.exports = (deployer, network) => {
  deployer.deploy(DefiScore, process.env.ORACLE, process.env.DEFI_SCORE_JOB_ID)
}
