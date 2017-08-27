pragma solidity ^0.4.4;

contract Delivery {

/* ==========================================================================
   Contract State Variables
   ========================================================================== */	
	bool public package_paid_for = false;
	bool public package_delivered = false;

/* ==========================================================================
   Variables passed in on creation
   ========================================================================== */	
	string private shipper_phone;
	string private recipient_phone;
	string private package_hash;

	uint private amount_to_pay;

/* ==========================================================================
   Lazy Variables
   ========================================================================== */
	uint public expiration_unix;

	uint private insured_value;
	uint private insurance_premium;

	string private carrier_phone;

	address private carrier_address;
	address private shipper_address;
	
/* ==========================================================================
   Public Functions
   ========================================================================== */

	function Delivery(string _shipper_phone, string _recipient_phone, string _package_hash, uint _amount_to_pay) {
		shipper_phone = _shipper_phone;
		recipient_phone = _recipient_phone;
		package_hash = _package_hash;
		amount_to_pay = _amount_to_pay;
	}

	function updateCarrierInformation(address _carrier_address, string _carrier_phone, 
		uint _expiration_unix, uint _insured_value, uint _insurance_premium) constant returns (bool) {
		carrier_address = _carrier_address;
		carrier_phone = _carrier_phone;
		expiration_unix = _expiration_unix;
		insured_value = _insured_value;
		insurance_premium = _insurance_premium;

		return true;
	}

	function isPackageFinalized() constant returns (bool) {
		return package_delivered;
	}

	function finalizeDelivery(string _package_hash, string _recipient_phone) constant returns (bool) {
		if (!package_paid_for) {
			return false;
		}

		if (package_delivered) {
			return true;
		}

		if (sha3(_package_hash) == sha3(package_hash) && sha3(_recipient_phone) == sha3(recipient_phone)) {
			package_delivered = true;
			carrier_address.send(this.balance);
		}

		return package_delivered;
	}	

	function payForPackage() payable returns (bool) {
		if (package_paid_for) {
			msg.sender.send(msg.value);
			return true;
		}

		shipper_address = msg.sender;

        if (msg.value == (amount_to_pay + insurance_premium)) {
        	package_paid_for = true;
        	return true;
        } else {
        	msg.sender.send(msg.value);
        	return false;
        }        
    }
}