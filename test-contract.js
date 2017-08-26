const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// // Compile the source code
// const input = fs.readFileSync('Token.sol');
// const output = solc.compile(input.toString(), 1);
// const bytecode = output.contracts[':Token'].bytecode;
// const abi = JSON.parse(output.contracts[':Token'].interface);

// // Contract object
// const contract = web3.eth.contract(abi);


var abi = [{
     name: 'myConstantMethod',
     type: 'function',
     constant: true,
     inputs: [{ name: 'a', type: 'string' }],
     outputs: [{name: 'd', type: 'string' }]
}, {
     name: 'myStateChangingMethod',
     type: 'function',
     constant: false,
     inputs: [{ name: 'a', type: 'string' }, { name: 'b', type: 'int' }],
     outputs: []
}, {
     name: 'myEvent',
     type: 'event',
     inputs: [{name: 'a', type: 'int', indexed: true},{name: 'b', type: 'bool', indexed: false}]
}];

// creation of contract object
var MyContract = web3.eth.contract(abi);