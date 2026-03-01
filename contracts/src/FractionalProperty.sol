// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FractionalProperty
 * @dev Tokenizes Real World Assets (Real Estate). Users can buy fractional shares
 * of a specific property ID using USDC.
 */
contract FractionalProperty is ERC1155, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    
    // Mapping from Property ID to fractional share price in USDC
    mapping(uint256 => uint256) public sharePrice;

    event PropertyListed(uint256 indexed propertyId, uint256 pricePerShare);
    event SharesPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount);

    constructor(address _usdcToken) ERC1155("") Ownable(msg.sender) {
        usdc = IERC20(_usdcToken);
    }

    /**
     * @dev List a new property with a specific share price.
     */
    function listProperty(uint256 propertyId, uint256 _sharePrice) external onlyOwner {
        require(_sharePrice > 0, "Price must be > 0");
        sharePrice[propertyId] = _sharePrice;
        emit PropertyListed(propertyId, _sharePrice);
    }

    /**
     * @dev Buy fractional shares of a property using USDC.
     */
    function buyShares(uint256 propertyId, uint256 sharesToBuy) external {
        uint256 price = sharePrice[propertyId];
        require(price > 0, "Property not listed");
        
        uint256 totalCost = price * sharesToBuy;
        
        // Transfer USDC from buyer to this contract
        usdc.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Mint fractional shares (ERC1155) to the buyer
        _mint(msg.sender, propertyId, sharesToBuy, "");
        
        emit SharesPurchased(propertyId, msg.sender, sharesToBuy);
    }
    
    /**
     * @dev Withdraw collected USDC (Owner only).
     */
    function withdrawUSDC(address to, uint256 amount) external onlyOwner {
        usdc.safeTransfer(to, amount);
    }
}
