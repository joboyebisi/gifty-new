// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Note {
    address ephemeralOwner;
    address sender;
    uint256 amount;
}

contract EphemeralNotes is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    mapping(address => Note) public notes;

    event NoteCreated(Note note);
    event NoteRedeemed(Note note, address redeemer);

    constructor(address _usdcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "EphemeralNotes: invalid USDC address");
        usdc = IERC20(_usdcAddress);
    }

    /// @notice Creates a note with escrowed USDC
    /// @dev Requires prior token approval
    function createNote(address _ephemeralOwner, address _sender, uint256 _amount) external {
        require(notes[_ephemeralOwner].ephemeralOwner == address(0), "EphemeralNotes: note already exists");
        require(_ephemeralOwner != address(0), "EphemeralNotes: invalid ephemeral owner");
        require(_amount > 0, "EphemeralNotes: amount must be > 0");
        require(_sender != address(0), "EphemeralNotes: invalid sender");

        notes[_ephemeralOwner] = Note({
            ephemeralOwner: _ephemeralOwner,
            sender: _sender,
            amount: _amount
        });

        emit NoteCreated(notes[_ephemeralOwner]);
        usdc.safeTransferFrom(msg.sender, address(this), _amount);
    }

    /// @notice Allows the note creator to reclaim their escrowed USDC
    function claimNoteSelf(address _ephemeralOwner) external {
        Note memory note = notes[_ephemeralOwner];
        require(note.ephemeralOwner != address(0), "EphemeralNotes: note does not exist");
        require(msg.sender == note.sender, "EphemeralNotes: not note sender");

        emit NoteRedeemed(note, msg.sender);
        delete notes[_ephemeralOwner];
        usdc.safeTransfer(msg.sender, note.amount);
    }

    /// @notice Returns escrowed tokens to the original sender (admin function)
    /// @dev Only the contract owner can call this function (Bot session account)
    function returnNoteToSender(address _ephemeralOwner) external onlyOwner {
        Note memory note = notes[_ephemeralOwner];
        require(note.ephemeralOwner != address(0), "EphemeralNotes: note does not exist");

        emit NoteRedeemed(note, note.sender);
        delete notes[_ephemeralOwner];
        usdc.safeTransfer(note.sender, note.amount);
    }

    /// @notice Allows anyone to claim a note on behalf of a recipient with a valid signature
    function claimNoteRecipient(
        address _ephemeralOwner,
        address _recipient,
        bytes memory _signature
    ) external {
        Note memory note = notes[_ephemeralOwner];
        require(note.ephemeralOwner != address(0), "EphemeralNotes: note does not exist");

        bytes32 message = MessageHashUtils.toEthSignedMessageHash(
            keccak256(abi.encodePacked(_recipient))
        );
        address signer = ECDSA.recover(message, _signature);
        require(signer == _ephemeralOwner, "EphemeralNotes: invalid signature");

        emit NoteRedeemed(note, _recipient);
        delete notes[_ephemeralOwner];
        usdc.safeTransfer(_recipient, note.amount);
    }
}
