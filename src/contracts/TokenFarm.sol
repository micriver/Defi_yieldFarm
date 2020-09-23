pragma solidity ^0.5.16;

// import functions and source code from other smart contracts
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
	// contract states:
	string public name = "Dapp Token Farm"; // "string" for declarative value types in solidity
	address public owner; // public modifier means that we will be able to access this variable value outside of the contract
	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers; // array w/ all addresses that have ever staked
	
	// to show the investor has a staking balance:
	mapping(address => uint) public stakingBalance;
	// hash mapping that keeps track of all people who have ever staked
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	// gets run once whenver the smart contract is deployed to the network
	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		// store address to dapp and dai token smart contracts/tokens 1, deploy dai, 2, deploy dapp, 3, deploy yield farm
		// underscore refers to a token address/smart contract. We are storing them in state variables above
		// assigned variables upon deployment:
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// Stake Tokens where investors ( deposit ) mDAI into the smart contract to earn rewards
	function stakeTokens(uint _amount) public { 	// public visibilty is so that the function can be called outside the smart contract 

		require(_amount > 0, "amount cannot be 0"); // require an amount greater than 0

		// msg is a global variable corresponding to the message sent at function call
		// sender is person who called the function
		// address(this) converts this smart contracts address to the address type
		daiToken.transferFrom(msg.sender, address(this), _amount); // transfer the mDAI token from the investor's wallet to this smart contract for staking

		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; // update staking balance

		if(!hasStaked[msg.sender]) { // Add user to stakers array *only* if they haven't staked already
			stakers.push(msg.sender);//if the user's address is not inside the array, push the new user into the staker array
		}
		isStaking[msg.sender] = true; // Update staking status
		hasStaked[msg.sender] = true; // Update staking status
	}

	// Unstaking Tokens - (withdraw)
	function unstakeTokens() public {
		// fetch the staking balance
		uint balance = stakingBalance[msg.sender]; 

		// you can't withdraw zero tokens
		require(balance > 0, "staking balance cannot be 0"); 

		// send the balance back to the user
		daiToken.transfer(msg.sender, balance); 

		// reset their staking balance
		stakingBalance[msg.sender] = 0;

		// update their staking status
		isStaking[msg.sender] = false;
	}

	// Issuing Tokens - (earning interest)
	function issueTokens() public { 
		require (msg.sender == owner, "caller must be the owner"); // this function can only be run by its owner

		for (uint i=0; i<stakers.length; i++) { // loop through the array of stakers
			address recipient = stakers[i]; // for every person thats staking in the farm
			uint balance = stakingBalance[recipient]; // check their staking balance
			if (balance > 0) {
				dappToken.transfer(recipient, balance); // issue 1 DApp token for every mDAI token thats deposited
			}
		}
	}
}
