// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/NFT.sol";
import "../src/MaliciousBatchContract.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TestToken
        TestToken token = new TestToken();
        console.log("TestToken deployed to:", address(token));

        // Deploy TestNFT
        TestNFT nft = new TestNFT();
        console.log("TestNFT deployed to:", address(nft));

        // Mint some test tokens to the deployer
        token.mint(msg.sender, 1000 * 10 ** 18);
        console.log("Minted 1000 test tokens to deployer");

        // Mint some test NFTs to the deployer
        nft.mintBatch(msg.sender, 5);
        console.log("Minted 5 test NFTs to deployer");

        // Deploy MaliciousBatchContract after both contracts are deployed and initialized
        MaliciousBatchContract malicious = new MaliciousBatchContract(
            address(nft),
            address(token)
        );
        console.log("MaliciousBatchContract deployed to:", address(malicious));

        vm.stopBroadcast();
    }
} 