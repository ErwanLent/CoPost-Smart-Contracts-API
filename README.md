# HandOff-Contract-API

API URL: [http://18.220.84.55:3000/](http://18.220.84.55:3000/)

# Endpoints #

**POST**
*/api/makePackageContract*

Required params:

- package_hash
- shipper_phone
- recipient_phone
- amount_to_pay_in_ether

**POST**
*/api/payForPackage*

Required params:

- package_hash
- amount_to_pay_in_ether

**POST**
*/api/updateCarrierInformation*

Required params:

- package_hash
- carrier_phone

Optional params:

- carrier_address

The *carrier_address* is a ethereum address.

**POST**
*/api/finalizeDelivery*

Required params:

- package_hash
- recipient_phone