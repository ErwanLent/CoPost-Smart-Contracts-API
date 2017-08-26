pragma solidity ^0.4.4;

contract DiceRoller {

	address public house_address;
	address public player_address;

	function DiceRoller(address player) {
		house_address = msg.sender;
		player_address = player;
	}

	function getHouseAddress() constant returns (address) {
		return house_address;
	}

	function getPlayerAddress() constant returns (address) {
		return player_address;
	}	

	function makeBet(uint seed) constant returns (uint) {
		uint randomNumber = uint(sha3(block.blockhash(block.number - 1), seed )) % 10;

		if (randomNumber <= 3) {
			// send ether to house
			//player_address.send(10);
		} else {
			// send ether to player
		}


		return (randomNumber <= 0) ? 1 : randomNumber;
	}	

	function getHouseBalanceInWei() constant returns (uint) {
		return house_address.balance;
	}		

	function getPlayerBalanceInWei() constant returns (uint) {
		return player_address.balance;
	}		
}