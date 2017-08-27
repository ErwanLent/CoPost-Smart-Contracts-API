const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

//const web3 = new Web3(new Web3.providers.HttpProvider("http://18.220.84.55:8545"));
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
        amount_to_pay_in_wei
    } = req.body;

    if (!package_hash || !shipper_phone || !recipient_phone || !amount_to_pay_in_wei) {
        res.json({
            status: 'error',
            response: 'missing fields'
        });   

        return;        
    }

    if (AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'contract already made for this package'
        });   

        return;  
    }

    const contractInstance = contract.new(shipper_phone, recipient_phone, package_hash, amount_to_pay_in_wei, {
        data: '0x' + bytecode,
        from: COMPANY_ADDRESS,
        gas: 1500000
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

            AllContracts[package_hash] = diceRollerContract;

            res.json({
                status: 'success',
                contractAddress: contractResponse.address
            });            
        }
    });
};

exports.payForPackage = function(req, res) {
    const {
        package_hash,
        amount_to_pay_in_wei
    } = req.body;

    if (!package_hash || !amount_to_pay_in_wei) {
        res.json({
            status: 'error',
            response: 'missing fields'
        });   

        return;               
    }

    if (!AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'No contract package hash found'
        });   

        return;  
    }    

    AllContracts[package_hash].payForPackage.sendTransaction({
        from: SHIPPER_ADDRESS,
        value: amount_to_pay_in_wei,
        gas: 600000,
    }, function(err, data) {
        if (err) {
            console.log(err);   

            res.json({
                status: 'error',
                response: err
            });   

            return;
        }

        res.json({
            status: 'success',
            transaction: data
        });
    });
};

exports.updateCarrierInformation = function(req, res) {
    let {
        package_hash,
        carrier_phone,
        carrier_address,
        insured_value,
        insurance_premium
    } = req.body;

    if (!package_hash || !carrier_phone) {
        res.json({
            status: 'error',
            response: 'missing fields'
        });   

        return;               
    }

    if (!carrier_address) {
        carrier_address = CARRIER_ADDRESS;
    }

    // Default to no insurance
    if (!insured_value || !insurance_premium) {
        insured_value = 0;
        insurance_premium = 0;
    }

    if (!AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'No contract package hash found'
        });   

        return;  
    }    

    AllContracts[package_hash].updateCarrierInformation(carrier_address, carrier_phone, insured_value, insurance_premium,  (error, response) => {
        if (error) {
            console.log(error);   

            res.json({
                status: 'error',
                error: error,
                did_update: false
            });   

            return;
        }
    
        res.json({
            status: 'success',
            did_update: response
        });  
    });    
};

exports.finalizeDelivery = function(req, res) {
    const {
        package_hash,
        recipient_phone
    } = req.body;

    if (!package_hash || !recipient_phone) {
        res.json({
            status: 'error',
            response: 'missing fields'
        });   

        return;               
    }

    if (!AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'No contract package hash found'
        });   

        return;  
    }        

    AllContracts[package_hash].finalizeDelivery(package_hash, recipient_phone, (err, finalizeResponse) => {
        if (err) {
            console.log(err);   

            res.json({
                status: 'error',
                response: err
            });   

            return;
        }

        res.json({
            status: 'success',
            is_finalized: finalizeResponse
        });    
    });
};

exports.checkBalance = function(req, res) {
    checkAllBalances();

    res.json({
        reponse: 'Checking balances'
    });  
};

function checkAllBalances() {
    let i = 0;
    const eth = web3.eth;
    eth.accounts.forEach(function(e) {
        console.log("eth.accounts[" + i + "]: " + e + " \tbalance: " + web3.fromWei(eth.getBalance(e), "ether") + " ether");
        i++;
    })
};