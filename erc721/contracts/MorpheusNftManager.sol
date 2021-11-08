// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EIP712MetaTransaction.sol";

contract MorpheusNftManager is Ownable, ERC721URIStorage, EIP712MetaTransaction {
    
    string private constant DOMAIN_NAME = "morpheuslabs.io";
    string private constant DOMAIN_VERSION = "1";

    uint256 public tokenId = 0;
    
    // Authorized list
    mapping(address => bool) public authorized;
    
    constructor(string memory name_, string memory symbol_, uint256 chainId_) 
        ERC721(name_, symbol_) 
        EIP712Base(DOMAIN_NAME, DOMAIN_VERSION, chainId_) {
    }

    modifier isAuthorized() {
        require(
            msgSender() == owner() || authorized[msgSender()] == true, 
            "MorpheusNftManager: unauthorized"
        );
        _;
    }

    modifier isOwner() {
        require(
            msgSender() == owner(), 
            "MorpheusNftManager: not owner"
        );
        _;
    }

    function createCollectible(string memory tokenURI) public isAuthorized returns (uint256) {
        tokenId = tokenId + 1;
        _mint(msgSender(), tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function addAuthorized(address auth) public isOwner {
        authorized[auth] = true;
    }

    function addAuthorizedBatch(address[] memory authList) public isOwner {
        for (uint256 i = 0; i < authList.length; i++) {
            addAuthorized(authList[i]);
        }
    }

    function clearAuthorized(address auth) public isOwner {
        authorized[auth] = false;
    }

    function checkAuthorized(address auth) public view returns (bool) {
        if (msgSender() == owner()) {
            return true;
        } else {
            return authorized[auth];
        }
    }
}
