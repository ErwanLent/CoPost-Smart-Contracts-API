const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const SHIPPER_ADDRESS = '0x9657ef5935f46df4b1d84e51664ca138332b1813';
const CARRIER_ADDRESS = '0x6f55b6664199502f6057f2ca3c98e2ba253b47d8';

// Compile the source code
const input = fs.readFileSync('./contracts/Delivery.sol', 'utf8');
const output = solc.compile(input, 1);

// Error loggins
if (!output.contracts[':Delivery']) {
    console.log(output);
}

const abi = JSON.parse(output.contracts[':Delivery'].interface);
const bytecode = output.contracts[':Delivery'].bytecode;

// let gasEstimate = 6000000;
// web3.eth.estimateGas({data: bytecode}, (err, resp) => {
//     if (err) {
//         console.log(err);
//     }

//     gasEstimate = resp;

//     console.log(`Gas estimate set to: ${gasEstimate}`);
// });

const contract = web3.eth.contract(abi);
let diceRollerContract;

const contractInstance = contract.new('5884495', '5883766', 'package hash yo', web3.toWei(3, 'ether'), {
    data: '0x' + bytecode,
    from: SHIPPER_ADDRESS,
    gas: 800000
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

//checkAllBalances();

exports.index = function(req, res) {
    //checkAllBalances();
    res.render(path.resolve('views/index.ejs'));
};

exports.sendMoney = function(req, res) {
    sendMoney((response) => {
        res.json(response);    
    });
};

exports.getData = function(req, res) {
    getData((response) => {
        res.json(response);    
    });
};

exports.checkBalance = function(req, res) {
    checkAllBalances();

    res.json({
        reponse: 'Checking balances'
    });  
};

function getData(callback) {
    diceRollerContract.getData((error, response) => {
        if (error) {
            console.log('Error found: ', error);    
        }
    
        console.log('number is: ', response + '');

        callback({
            reponse: response + ''
        });
    });
}

function finalizeDelivery(callback) {
    diceRollerContract.finalizeDelivery('package hash yo', '5883765', (error, response) => {
        if (error) {
            console.log('Error found: ', error);    
        }
    
        console.log('number is: ', response + '');

        callback({
            reponse: response + ''
        });
    });
}

function sendMoney(callback) {
    diceRollerContract.payForPackage.sendTransaction({
        from: SHIPPER_ADDRESS,
        value: web3.toWei(5, 'ether'),
        gas: 600000,
    }, function(err, data) {
        callback({
            reponse: (err || data) + ''
        });
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