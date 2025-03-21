// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KaiKaiShieldStorage {
    struct FileRecord {
        string fingerprint;
        string ipfsHash;
        address uploader;
        uint256 timestamp;
    }

    mapping(bytes32 => FileRecord) public records;

    event FileStored(bytes32 recordId, string fingerprint, string ipfsHash, address uploader);

    function storeRecord(string memory _fingerprint, string memory _ipfsHash) public {
        bytes32 recordId = keccak256(abi.encodePacked(_fingerprint));
        records[recordId] = FileRecord({
            fingerprint: _fingerprint,
            ipfsHash: _ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp
        });
        emit FileStored(recordId, _fingerprint, _ipfsHash, msg.sender);
    }

    function getRecordByFingerprint(string memory _fingerprint) public view returns (FileRecord memory) {
        bytes32 recordId = keccak256(abi.encodePacked(_fingerprint));
        return records[recordId];
    }
}
