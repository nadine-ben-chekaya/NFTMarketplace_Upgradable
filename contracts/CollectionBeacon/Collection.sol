// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @dev The current version of the contract.
string constant CONTRACT_VERSION = "2.0.0";

/// @title MyToken - ERC721 Token Contract with URI Storage
/// @dev This contract allows users to mint ERC721 tokens with unique token URIs.
contract Collection is ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializes the contract with the given name and symbol.
    /// @param _name The name of the token.
    /// @param _symbol The symbol of the token.
    function initialize(string memory _name, string memory _symbol) initializer public {
        __ERC721_init(_name, _symbol);
        //__UUPSUpgradeable_init();
    }

    /// @dev Mints a new token with the provided token URI.
    /// @param tokenURI The URI for the token metadata.
    /// @param marketplaceAddress The address of the marketplace contract.
    /// @return The ID of the newly minted token.
    function safeMint(string memory tokenURI, address marketplaceAddress) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(marketplaceAddress, true);
        return newItemId;
    }

    /// @dev Sets approval for all tokens to the specified contract address.
    /// @param _contractadr The address of the contract to set approval for.
    function MySetApproval(address _contractadr) public {
       setApprovalForAll(_contractadr, true); 
    }

    /// @dev Retrieves the version of the contract.
    /// @return The version string of the contract.
    function getVersion() external pure returns (string memory) {
        return CONTRACT_VERSION;
    }

    function getMessage() external pure returns(string memory){
        return "Hi!!, this is a message from the new version of collection SC";
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
