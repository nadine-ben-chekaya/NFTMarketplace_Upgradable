// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract CollectionBeacon {

    UpgradeableBeacon immutable beacon;
    
    address public vLogic;

    constructor(address _vLogic) {
        beacon = new UpgradeableBeacon(_vLogic);
        vLogic = _vLogic;
    }

    function update(address _vLogic) public {
        beacon.upgradeTo(_vLogic);
        vLogic = _vLogic;
    }

    function implementation() public view returns(address) {
        return beacon.implementation();
    }

}