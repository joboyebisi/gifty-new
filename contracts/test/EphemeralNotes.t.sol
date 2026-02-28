// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {EphemeralNotes, Note} from "../src/EphemeralNotes.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract EphemeralNotesTest is Test {
    EphemeralNotes public escrow;
    MockUSDC public usdc;

    address public botSession = address(0x123);
    address public alice = address(0x111);
    address public bob = address(0x222);
    
    uint256 public ephemeralKey;
    address public ephemeralOwner;

    function setUp() public {
        usdc = new MockUSDC();
        
        vm.prank(botSession);
        escrow = new EphemeralNotes(address(usdc));

        (ephemeralOwner, ephemeralKey) = makeAddrAndKey("ephemeralOwner");

        usdc.mint(alice, 1000 * 10**6);
    }

    function test_CreateNote() public {
        vm.startPrank(alice);
        usdc.approve(address(escrow), 50 * 10**6);
        
        escrow.createNote(ephemeralOwner, alice, 50 * 10**6);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(escrow)), 50 * 10**6);
        (address owner, address sender, uint256 amount) = escrow.notes(ephemeralOwner);
        assertEq(owner, ephemeralOwner);
        assertEq(sender, alice);
        assertEq(amount, 50 * 10**6);
    }

    function test_ClaimNoteSelf() public {
        vm.startPrank(alice);
        usdc.approve(address(escrow), 50 * 10**6);
        escrow.createNote(ephemeralOwner, alice, 50 * 10**6);
        
        escrow.claimNoteSelf(ephemeralOwner);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(escrow)), 0);
        assertEq(usdc.balanceOf(alice), 1000 * 10**6);
    }

    function test_ReturnNoteToSenderByBot() public {
        vm.startPrank(alice);
        usdc.approve(address(escrow), 50 * 10**6);
        escrow.createNote(ephemeralOwner, alice, 50 * 10**6);
        vm.stopPrank();

        vm.prank(botSession);
        escrow.returnNoteToSender(ephemeralOwner);

        assertEq(usdc.balanceOf(address(escrow)), 0);
        assertEq(usdc.balanceOf(alice), 1000 * 10**6);
    }

    function test_RevertIfReturnNoteToSenderNotOwner() public {
        vm.startPrank(alice);
        usdc.approve(address(escrow), 50 * 10**6);
        escrow.createNote(ephemeralOwner, alice, 50 * 10**6);
        vm.stopPrank();

        vm.prank(alice);
        vm.expectRevert();
        escrow.returnNoteToSender(ephemeralOwner);
    }

    function test_ClaimNoteRecipient() public {
        vm.startPrank(alice);
        usdc.approve(address(escrow), 50 * 10**6);
        escrow.createNote(ephemeralOwner, alice, 50 * 10**6);
        vm.stopPrank();

        // Sign message for Bob to claim
        bytes32 message = keccak256(abi.encodePacked(bob));
        bytes32 ethSignedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ephemeralKey, ethSignedMessage);
        bytes memory signature = abi.encodePacked(r, s, v);

        escrow.claimNoteRecipient(ephemeralOwner, bob, signature);

        assertEq(usdc.balanceOf(bob), 50 * 10**6);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }
}
