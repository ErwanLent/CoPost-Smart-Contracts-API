pragma solidity ^0.4.4;

contract Delivery {
	bool package_paid_for = false;
	bool package_delivered = false;

	// Variables passed in on creation
	string public shipper_phone;
	string public recipient_phone;
	string public package_hash;
	uint amount_to_pay;

	// Passed in later
	string public carrier_phone;
	address public carrier_address;
	address public shipper_address;

	function Delivery(string _shipper_phone, string _recipient_phone, string _package_hash, uint _amount_to_pay) {
		shipper_phone = _shipper_phone;
		recipient_phone = _recipient_phone;
		package_hash = _package_hash;
		amount_to_pay = _amount_to_pay;
	}

	function updateCarrierInformation(address _carrier_address, string _carrier_phone) constant returns (bool) {
		carrier_address = _carrier_address;
		carrier_phone = _carrier_phone;

		return true;
	}

	function isPackageFinalized() constant returns (bool) {
		return package_delivered;
	}

	function payForPackage() payable returns (bool) {
		if (package_paid_for) {
			msg.sender.send(msg.value);
			return true;
		}

		shipper_address = msg.sender;

        if (msg.value == amount_to_pay) {
        	package_paid_for = true;
        	return true;
        } else {
        	msg.sender.send(msg.value);
        	return false;
        }        
    }

	function finalizeDelivery(string _package_hash, string _recipient_phone) constant returns (bool) {
		if (package_delivered) {
			return true;
		}

		if (sha3(_package_hash) == sha3(package_hash) && sha3(_recipient_phone) == sha3(recipient_phone)) {
			package_delivered = true;
			return true;

			// if (carrier_address.send(this.balance)) {
			// 	return true;
			// } else {
			// 	return false;
			// }

		} else {
			return false;
		}
	}
}