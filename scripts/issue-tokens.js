const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {

	// assign contract to object variable
	let tokenFarm = await TokenFarm.deployed();

	// run issueTokens method from imported contract object
	await tokenFarm.issueTokens();

  console.log("Tokens issued!");
  callback();
};
