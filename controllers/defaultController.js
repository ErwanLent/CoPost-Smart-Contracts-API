﻿const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const COMPANY_ADDRESS = web3.eth.accounts[0];
const SHIPPER_ADDRESS = web3.eth.accounts[1];
const CARRIER_ADDRESS = web3.eth.accounts[web3.eth.accounts.length - 1];

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

const AllContracts = {};  

exports.index = function(req, res) {
    res.render(path.resolve('views/index.ejs'));
};

exports.makePackageContract = function(req, res) {
    const {
        package_hash,
        shipper_phone,
        recipient_phone,
        amount_to_pay_in_ether
    } = req.body;

    if (!package_hash || !shipper_phone || !recipient_phone || !amount_to_pay_in_ether) {
        res.json({
            status: 'error',
            response: 'missing fields'
        });   

        return;        
    }

    if (AllContracts.package_hash) {
        res.json({
            status: 'error',
            response: 'contract already made for this package'
        });   

        return;  
    }

    const contractInstance = contract.new(shipper_phone, recipient_phone, package_hash, web3.toWei(amount_to_pay_in_ether, 'ether'), {
        data: '0x' + bytecode,
        from: COMPANY_ADDRESS,
        gas: 800000
    }, (err, contractResponse) => {
        if (err) {
            console.log(err);   

            res.json({
                status: 'error',
                response: err
            });   

            return;
        }

        // If we have an address property, the contract was deployed
        if (contractResponse.address) {
            console.log('Contract address: ' + contractResponse.address);
            let diceRollerContract = contract.at(contractResponse.address);

            AllContracts.package_hash = diceRollerContract;

            res.json({
                status: 'success',
                contractAddress: contractResponse.address
            });            
        }
    });
};

exports.payForPackage = function(req, res) {
//     diceRollerContract.payForPackage.sendTransaction({
//         from: SHIPPER_ADDRESS,
//         value: web3.toWei(5, 'ether'),
//         gas: 600000,
//     }, function(err, data) {
//         callback({
//             reponse: (err || data) + ''
//         });
//     });

    res.json({
        status: 'success',
        response: 'yolo'
    });
};

exports.finalizeDelivery = function(req, res) {
    //     diceRollerContract.finalizeDelivery('package hash yo', '5883765', (error, response) => {
    //         if (error) {
    //             console.log('Error found: ', error);    
    //         }
        
    //         console.log('number is: ', response + '');

    //         callback({
    //             reponse: response + ''
    //         });
    //     });

    res.json({
        status: 'success',
        response: 'yolo'
    });
};




// exports.sendMoney = function(req, res) {
//     sendMoney((response) => {
//         res.json(response);    
//     });
// };

// exports.getData = function(req, res) {
//     getData((response) => {
//         res.json(response);    
//     });
// };

// exports.checkBalance = function(req, res) {
//     checkAllBalances();

//     res.json({
//         reponse: 'Checking balances'
//     });  
// };

// function getData(callback) {
//     diceRollerContract.getData((error, response) => {
//         if (error) {
//             console.log('Error found: ', error);    
//         }
    
//         console.log('number is: ', response + '');

//         callback({
//             reponse: response + ''
//         });
//     });
// }

// function finalizeDelivery(callback) {
//     diceRollerContract.finalizeDelivery('package hash yo', '5883765', (error, response) => {
//         if (error) {
//             console.log('Error found: ', error);    
//         }
    
//         console.log('number is: ', response + '');

//         callback({
//             reponse: response + ''
//         });
//     });
// }

// function sendMoney(callback) {
//     diceRollerContract.payForPackage.sendTransaction({
//         from: SHIPPER_ADDRESS,
//         value: web3.toWei(5, 'ether'),
//         gas: 600000,
//     }, function(err, data) {
//         callback({
//             reponse: (err || data) + ''
//         });
//     });
// }

function checkAllBalances() {
    let i = 0;
    const eth = web3.eth;
    eth.accounts.forEach(function(e) {
        console.log("eth.accounts[" + i + "]: " + e + " \tbalance: " + web3.fromWei(eth.getBalance(e), "ether") + " ether");
        i++;
    })
};

// function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }