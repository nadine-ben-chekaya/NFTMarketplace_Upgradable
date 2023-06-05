// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
//import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
//import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract Vaultv2 is Initializable {

    string public name;
    uint256 public vaLue;
    
    error Down(string reason);

    function initialize(string memory _name, uint256 _vaLue) public initializer {
        name = _name;
        vaLue = _vaLue;
    }

    function down() public {
        if (vaLue == 0) revert Down("!vaLue");
        vaLue--;
    }

    function up() public {
        vaLue++;
    }

}