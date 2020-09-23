// *** this file puts new smart contracts onto the blockchain

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
// blockchain state changes when you put smart contracts on it because you're technically adding transactions
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
  // Deploy moke DAI Token
  await deployer.deploy(DaiToken);
  // fetch daiToken address from the network and assign to variable
  const daiToken = await DaiToken.deployed();

  // Deploy moke DAPP Token
  await deployer.deploy(DappToken);
  // fetch DappToken address from the network and assign to variable
  const dappToken = await DappToken.deployed();

  // "deployer" puts all the smart contracts onto the blockchain network itself
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  // transfer all DappTokens to the tokenFarm
  await dappToken.transfer(tokenFarm.address, "1000000000000000000000000");

  // transfer 100 Mock DAI tokens to an investor
  await daiToken.transfer(accounts[1], "100000000000000000000");
};
