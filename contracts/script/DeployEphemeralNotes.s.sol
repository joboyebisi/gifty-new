// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {EphemeralNotes} from "../src/EphemeralNotes.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DeployEphemeralNotes is Script {
    function run() public {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Circle Arc Testnet USDC Address
        address usdcAddress = 0x3600000000000000000000000000000000000000; 

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        EphemeralNotes notes = new EphemeralNotes(usdcAddress);

        // If the deployer (0x28Ba...) needs to transfer ownership to the Grammy bot later, 
        // you can do it via: notes.transferOwnership(botAddress);
        
        vm.stopBroadcast();

        console2.log("EphemeralNotes deployed to:", address(notes));
    }
}
