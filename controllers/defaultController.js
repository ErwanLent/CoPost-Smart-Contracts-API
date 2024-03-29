﻿const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const PACKAGE_EXPIRATION_CHECKER_INTERVAL = 3600000;

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
const ContractData = {};

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

    if (AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'contract already made for this package'
        });   

        return;  
    }

    const contractInstance = contract.new(COMPANY_ADDRESS, shipper_phone, recipient_phone, package_hash, web3.toWei(amount_to_pay_in_ether, 'ether'), {
        data: '0x' + bytecode,
        from: COMPANY_ADDRESS,
        gas: 2500000
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
        amount_to_pay_in_ether
    } = req.body;

    if (!package_hash || !amount_to_pay_in_ether) {
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
        value: web3.toWei(amount_to_pay_in_ether, 'ether'),
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

        // Insurance Logic
        if (ContractData[package_hash] && ContractData[package_hash].insured_value > 0) {
            AllContracts[package_hash].isPackagePaidFor((err, isPackagePaidFor) => {
                if (isPackagePaidFor) {
                    // Package and premium paid for, pay insured value
                    AllContracts[package_hash].payForInsuredValue.sendTransaction({
                        from: COMPANY_ADDRESS,
                        value: web3.toWei(ContractData[package_hash].insured_value, 'ether'),
                        gas: 600000,
                    }, (err, data) => { });
                }
            });
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
        insurance_premium,
        expiration_unix
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

    ContractData[package_hash] = {};
    ContractData[package_hash].insured_value = insured_value;

    // Default to 1 month from now
    if (!expiration_unix) {
        const monthFromNowDate = new Date();
        monthFromNowDate.setMonth(monthFromNowDate.getMonth() + 1);
        const monthFromNowUnix = monthFromNowDate.getTime() / 1000;

        expiration_unix = monthFromNowUnix;
    }

    if (!AllContracts[package_hash]) {
        res.json({
            status: 'error',
            response: 'No contract package hash found'
        });   

        return;  
    }    

    AllContracts[package_hash].updateCarrierInformation.sendTransaction(carrier_address, carrier_phone, 
        expiration_unix, web3.toWei(insured_value, 'ether'), web3.toWei(insurance_premium, 'ether'), {
        from: COMPANY_ADDRESS,
        gas: 2500000
    },  (error, response) => {
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
            did_update: true,
            transaction: response
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

    AllContracts[package_hash].finalizeDelivery.sendTransaction(package_hash, recipient_phone, {
        from: COMPANY_ADDRESS,
        gas: 2500000
    }, (err, finalizeResponse) => {
        if (err) {
            console.log(err);   

            res.json({
                status: 'error',
                response: err,
                is_finalized: false
            });   

            return;
        }

        AllContracts[package_hash].isPackageFinalized((error, response) => {
            if (error) {
                console.log(error);   

                res.json({
                    status: 'error',
                    response: error,
                    is_finalized: false
                });   

                return;
            }  

            res.json({
                status: 'success',
                is_finalized: response
            });                        

            delete AllContracts[package_hash];
        });         
    });
};

exports.checkBalance = function(req, res) {
    checkAllBalances();

    res.json({
        reponse: 'Checking balances'
    });  
};

exports.checkDeliveryStatus = function(req, res) {
    const {
        package_hash
    } = req.body;

    if (!package_hash) {
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

    AllContracts[package_hash].isPackageFinalized(package_hash, (err, finalizeResponse) => {
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

function checkAllBalances() {
    let i = 0;
    const eth = web3.eth;
    eth.accounts.forEach(function(e) {
        console.log("eth.accounts[" + i + "]: " + e + " \tbalance: " + web3.fromWei(eth.getBalance(e), "ether") + " ether");
        i++;
    })
};

setInterval(() => {
    checkForExpiredPackage(0);
}, PACKAGE_EXPIRATION_CHECKER_INTERVAL);

function checkForExpiredPackage(currentContractIndex) {
    if (currentContractIndex >= Object.keys(AllContracts).length) {
        return;
    }

    if (!AllContracts[Object.keys(AllContracts)[currentContractIndex]]) {
        checkForExpiredPackage(currentContractIndex + 1);
    }

    AllContracts[Object.keys(AllContracts)[currentContractIndex]].isPackageExpired((err, isPackageExpired) => {
        if (err) {
            checkForExpiredPackage(currentContractIndex + 1);
            return;
        }

        if (isPackageExpired) {
            console.log('package is expired');
            AllContracts[Object.keys(AllContracts)[currentContractIndex]].destroyFailedContract.sendTransaction({
                from: COMPANY_ADDRESS,
                gas: 2500000
            }, (err, response) => {
                console.log(err || response);
                delete AllContracts[Object.keys(AllContracts)[currentContractIndex]];

                checkForExpiredPackage(currentContractIndex);
            });
        } else {
            checkForExpiredPackage(currentContractIndex + 1);
        }
    });    
}