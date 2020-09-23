/*

This file tests all of the TokenFarm contract features

*/

const { assert } = require("chai");
const { default: Web3 } = require("web3");

// import the contracts
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

// write better tests throughout the project
require("chai")
	.use(require("chai-as-promised"))
	.should();

function tokens(n) {
	return web3.utils.toWei(n, "ether");
}

// setup the contract
contract("TokenFarm", ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm;
	// this function gets run before every single test example
	before(async () => {
		// load contracts as objects where their functions are METHODS!
		daiToken = await DaiToken.new();
		dappToken = await DappToken.new();
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

		// transfer all DAPP tokens to the tokenfarm (1 million)
		await dappToken.transfer(tokenFarm.address, tokens("1000000")); // needs 2 arguments, amount and where its going

		// transfer 100 Mock DAI tokens to an investor
		await daiToken.transfer(investor, tokens("100"), { from: owner });
	});

	//tests
	//   make sure mock dai token is on chain
	describe("Mock DAI deployment", async () => {
		it("has a name", async () => {
			const name = await daiToken.name();
			assert.equal(name, "Mock DAI Token");
		});
	});
	// make sure dapp token contract has been deployed
	describe("Dapp Token deployment", async () => {
		it("has a name", async () => {
			const name = await dappToken.name();
			assert.equal(name, "DApp Token");
		});
	});
	// make sure tokenFarm contract has been deployed
	describe("Token Farm deployment", async () => {
		it("has a name", async () => {
			const name = await tokenFarm.name();
			assert.equal(name, "Dapp Token Farm");
		});
		// make sure tokenFarm smart contract has all the tokens transferred to it
		it("contract has tokens", async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address);
			assert.equal(balance.toString(), tokens("1000000"));
		});
	});

	// test depositing functionality of tokenFarm smart contract
	describe("Farming tokens", async () => {
		it("rewards investors for staking mDai tokens", async () => {
			let result;

			// check investor balance BEFORE staking
			result = await daiToken.balanceOf(investor);
			assert.equal(
				result.toString(),
				tokens("100"),
				"investor Mock DAI wallet balance correct before staking"
			); // check for balance of AT LEAST 100 DAI tokens

			// tell investor daiToken account to approve transfer to tokenFarm contract
			await daiToken.approve(tokenFarm.address, tokens("100"), {
				from: investor,
			});
			await tokenFarm.stakeTokens(tokens("100"), { from: investor });

			// check investor mDai balance AFTER staking
			result = await daiToken.balanceOf(investor);
			assert.equal(
				result.toString(),
				tokens("0"),
				"investor Mock DAI wallet balance correct after staking"
			);

			// check tokenFarm mDai balance AFTER staking
			result = await daiToken.balanceOf(tokenFarm.address); 
			assert.equal(
				result.toString(),
				tokens("100"),
				"Token Farm Mock Dai balance correct after staking"
			);

			// make sure the investor's staking balance inside the tokenFarm is correct
			result = await tokenFarm.stakingBalance(investor);
			assert.equal(
				result.toString(),
				tokens("100"),
				"investor staking balance correct after staking"
			);

			// check that investor IS staking
			result = await tokenFarm.isStaking(investor);
			assert.equal(
				result.toString(),
				"true",
				"investor staking status correct after staking"

			);

			// Issue Tokens
			await tokenFarm.issueTokens({ from: owner });

			// Check balance after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

			// Ensure that only the owner can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

			// unstake tokens
			await tokenFarm.unstakeTokens({ from: investor })

			// Check results after unstaking
			result = await daiToken.balanceOf(investor); // check investor balance
			assert.equal(result.toString(), tokens('100'), "investor Mock Dai wallet balance correct after staking");

			result = await daiToken.balanceOf(tokenFarm.address);// check tokenFarm balance
			assert.equal(result.toString(), tokens('0'), "investor Mock Dai wallet balance correct after staking");

			result = await tokenFarm.stakingBalance(investor); // check investor balance
			assert.equal(result.toString(), tokens('0'), "investor staking balance correct after staking");

			result = await tokenFarm.isStaking(investor); // check investor balance
			assert.equal(result.toString(), "false", "investor staking status correct after staking");
		});
	});
});
