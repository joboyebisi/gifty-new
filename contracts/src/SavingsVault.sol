// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SavingsVault
 * @dev Agentic Escrow Vault where users can lock USDC periodically (monthly) 
 * towards a specific real estate property goal.
 */
contract SavingsVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    // user => propertyId => amount saved
    mapping(address => mapping(uint256 => uint256)) public savings;

    event Saved(address indexed user, uint256 indexed propertyId, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed propertyId, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /**
     * @dev Deposit USDC into savings for a specific property.
     */
    function deposit(uint256 propertyId, uint256 amount) external {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        savings[msg.sender][propertyId] += amount;
        emit Saved(msg.sender, propertyId, amount);
    }

    /**
     * @dev Withdraw savings back to wallet.
     */
    function withdraw(uint256 propertyId, uint256 amount) external {
        require(savings[msg.sender][propertyId] >= amount, "Insufficient savings");
        savings[msg.sender][propertyId] -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, propertyId, amount);
    }
    
    /**
     * @dev Agent (Owner) can execute the purchase once savings hit target.
     * In a real system, this would trigger an interaction with FractionalProperty.sol
     */
    function executeAgentPurchase(address user, uint256 propertyId, uint256 amount, address treasury) external onlyOwner {
        require(savings[user][propertyId] >= amount, "Insufficient savings for execution");
        savings[user][propertyId] -= amount;
        usdc.safeTransfer(treasury, amount);
        // ... (Minting shares logic handled externally or via interface)
    }
}
