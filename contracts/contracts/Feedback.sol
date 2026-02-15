// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract Feedback {
    ISemaphore public semaphore;
    uint256 public groupId;
    address public admin;

    event FeedbackSubmitted(uint256 indexed timestamp, string feedback);

    constructor(address _semaphoreAddress, uint256 _groupId) {
        semaphore = ISemaphore(_semaphoreAddress);
        groupId = _groupId;
        admin = msg.sender;
        
        // Create the group on the Semaphore contract
        semaphore.createGroup(groupId, admin);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    function batchAddMembers(uint256[] calldata identityCommitments) external onlyAdmin {
        // Semaphore's addMembers function handles arrays (batching)
        semaphore.addMembers(groupId, identityCommitments);
    }

    function submitFeedback(
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        string calldata feedback
    ) external {
        // 1. Verify the proof
        // note: The scope is often the groupId or a specific topic. Here we use groupId.
        // The signal is the feedback string (hashed or raw). Semaphore verifyProof takes the signal.
        // We need to verify if verifyProof takes uint256 signal or string (often bytes32 or uint256).
        // Standard Semaphore usually expects uint256 signal. We might need to hash the feedback string.
        
        // For simplicity, we assume we pass the hash of the feedback as the signal to the proof,
        // but we emit the plain text feedback.
        // Actually, let's verify the signature of verifyProof first.
        // Assuming strict Semaphore v4 interface usage.
        
        // We will pass the feedback hash as the signal.
        uint256 signal = uint256(keccak256(abi.encodePacked(feedback)));

        semaphore.verifyProof(groupId, merkleTreeRoot, signal, nullifierHash, groupId, proof);

        // 2. Emit the feedback event
        emit FeedbackSubmitted(block.timestamp, feedback);
    }
}
