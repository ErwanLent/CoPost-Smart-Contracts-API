const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const HOUSE_ADDRESS = '0x52809e5bbf871ec8816198cb59dec594aefc3973';
const PLAYER_ADDRESS = '0x4b41b8272328b89ebe7fc3c274ef45f4aba12d98';

//checkAllBalances();

// Compile the source code
const input = fs.readFileSync('./contracts/DiceRoller.sol', 'utf8');
const output = solc.compile(input, 1);

const abi = JSON.parse(output.contracts[':DiceRoller'].interface);
const bytecode = output.contracts[':DiceRoller'].bytecode;

let gasEstimate = 250000;
web3.eth.estimateGas({data: bytecode}, (err, resp) => {
    if (err) {
        console.log(err);
    }

    gasEstimate = resp;

    console.log(`Gas estimate set to: ${gasEstimate}`);
});

const contract = web3.eth.contract(abi);
let diceRollerContract;

const contractInstance = contract.new(PLAYER_ADDRESS, {
    data: '0x' + bytecode,
    from: HOUSE_ADDRESS,
    gas: 180000 * 2
}, (err, res) => {
    if (err) {
        console.log(err);   
        return;
    }

    // If we have an address property, the contract was deployed
    if (res.address) {
        console.log('Contract address: ' + res.address);
        diceRollerContract = contract.at(res.address);
    }
});    

exports.index = function(req, res) {
    checkAllBalances();

    res.render(path.resolve('views/index.ejs'));
};

exports.getNewNumber = function(req, res) {
    makeBet((response) => {
        res.json(response);    
    });
};

function makeBet(callback) {
    diceRollerContract.makeBet(getRandomInt(1, 10000000), (error, response) => {
        if (error) {
            console.log('Error found: ', error);    
        }
    
        console.log('Random numnber is: ', response + '');

        callback({
            number: response + ''
        });
    });
}

function getHouseBalance(callback) {
    diceRollerContract.getHouseBalanceInWei((error, response) => {
        if (error) {
            console.log('Error found: ', error);    
        }
        
        const etherBalance = web3.fromWei(response + '', 'ether');

        console.log('House balance is: ', etherBalance);

        callback(etherBalance);
    });
}

function getPlayerBalance(callback) {
    diceRollerContract.getPlayerBalanceInWei((error, response) => {
        if (error) {
            console.log('Error found: ', error);    
        }
        
        const etherBalance = web3.fromWei(response + '', 'ether');

        console.log('House balance is: ', etherBalance);

        callback(etherBalance);
    });
}

function checkAllBalances() {
    let i = 0;
    const eth = web3.eth;
    eth.accounts.forEach(function(e) {
        console.log("eth.accounts[" + i + "]: " + e + " \tbalance: " + web3.fromWei(eth.getBalance(e), "ether") + " ether");
        i++;
    })
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}