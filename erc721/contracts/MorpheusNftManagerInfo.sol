// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EIP712MetaTransaction.sol";

contract MorpheusNftManagerInfo is Ownable, EIP712MetaTransaction {
    
    string private constant DOMAIN_NAME = "morpheuslabs.io";
    string private constant DOMAIN_VERSION = "1";

    // One user address can create multiple NFT contract addresses
    mapping(address => address[]) public collectionList;

    // One user address can add multiple NFT token items
    mapping(address => string[]) public itemTxList;

    // Store user's address for authorization to add item
    address[] public authAddressList;

    constructor(uint256 chainId_) 
        EIP712Base(DOMAIN_NAME, DOMAIN_VERSION, chainId_) {
    }

    modifier isOwner() {
        require(
            msgSender() == owner(), 
            "MorpheusNftManagerInfo: not owner"
        );
        _;
    }
    
    function addCollection(address userAddr_, address contractAddr_) public {
        collectionList[userAddr_].push(contractAddr_);
    }

    function getCollection(address userAddr_) public view returns (address[] memory) {
        return collectionList[userAddr_];
    }

    function clearCollection(address userAddr_) public isOwner {
        delete collectionList[userAddr_];
    }

    function addItemTx(address userAddr_, string memory txHash_) public {
        itemTxList[userAddr_].push(txHash_);
    }

    function getItemTx(address userAddr_) public view returns (string[] memory) {
        return itemTxList[userAddr_];
    }

    function clearItemTx(address userAddr_) public isOwner {
        delete itemTxList[userAddr_];
    }

    // When user submits request for authorization to add item, this method is invoked
    function reqAuth(address userAddr_) public {
        authAddressList.push(userAddr_);
    }

    // The owner invokes this method to get the list of addresses requesting for authorization
    function getAuthReqList() public view returns (address[] memory) {
        return authAddressList;
    }

    // The owner invokes this method to clear the "authAddressList" after having invoked the method MorpheusNftManager.addAuthorized
    function clearAuthReqList() public isOwner {
        delete authAddressList;
    }
}
