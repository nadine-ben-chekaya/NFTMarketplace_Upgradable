// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./CollectionBeacon.sol";
import "./Collection.sol";


contract CollectionFactory {

    mapping(uint256 => address) private collections;

    CollectionBeacon immutable beacon;

    constructor(address _vLogic) {
        beacon = new CollectionBeacon(_vLogic);
    }

    function create(string calldata _name, string calldata _symbol, uint256 x) external returns (address) {
        BeaconProxy proxy = new BeaconProxy(address(beacon), 
            abi.encodeWithSelector(Collection(address(0)).initialize.selector, _name, _symbol)
        );
        collections[x] = address(proxy);
        return address(proxy);
    }

    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }

     function getBeacon() public view returns (address) {
        return address(beacon);
    }

     function getCollectionAdr(uint256 x) public view returns (address) {
        return collections[x];
    }


}