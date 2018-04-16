# CoPost-Smart-Contracts-API

Made at BCG DV blockchain dAppathon

[Delivery Contract](https://github.com/ErwanLent/CoPost-Smart-Contracts-API/blob/master/contracts/Delivery.sol)

# Endpoints #

**POST**
*/api/makePackageContract*

Required params:

- package_hash
- shipper_phone
- recipient_phone
- amount_to_pay_in_ether


----------


**POST**
*/api/payForPackage*

Required params:

- package_hash
- amount_to_pay_in_ether

----------

**POST**
*/api/updateCarrierInformation*

Required params:

- package_hash
- carrier_phone

Optional params:

- carrier_address
- insured_value
- insurance_premium
- expiration_unix

The *carrier_address* is a ethereum address. expiration_unix defaults to 1 month.

----------

**POST**
*/api/finalizeDelivery*

Required params:

- package_hash
- recipient_phone
