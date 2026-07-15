// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ExhibitionRegistry
/// @notice On-chain provenance registry for exhibitions on Monad-compatible EVM.
/// @dev Registers experience metadata pointers — not artwork ownership.
contract ExhibitionRegistry is Ownable {
    struct Exhibition {
        bytes32 id;
        address creator;
        uint256 nftId;
        string metadataURI;
        string website;
        string github;
        uint64 createdAt;
        uint64 updatedAt;
        string version;
        bool exists;
    }

    mapping(bytes32 => Exhibition) private _exhibitions;
    bytes32[] private _ids;

    event ExhibitionRegistered(
        bytes32 indexed id,
        address indexed creator,
        uint256 nftId,
        string metadataURI,
        string version
    );
    event ExhibitionUpdated(bytes32 indexed id, string metadataURI, string version, uint64 updatedAt);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerExhibition(
        bytes32 id,
        address creator,
        uint256 nftId,
        string calldata metadataURI,
        string calldata website,
        string calldata github,
        string calldata version
    ) external onlyOwner {
        require(id != bytes32(0), "invalid id");
        require(!_exhibitions[id].exists, "exists");
        require(creator != address(0), "creator");

        _exhibitions[id] = Exhibition({
            id: id,
            creator: creator,
            nftId: nftId,
            metadataURI: metadataURI,
            website: website,
            github: github,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp),
            version: version,
            exists: true
        });
        _ids.push(id);

        emit ExhibitionRegistered(id, creator, nftId, metadataURI, version);
    }

    function updateExhibition(
        bytes32 id,
        uint256 nftId,
        string calldata metadataURI,
        string calldata website,
        string calldata github,
        string calldata version
    ) external onlyOwner {
        Exhibition storage e = _exhibitions[id];
        require(e.exists, "missing");
        e.nftId = nftId;
        e.metadataURI = metadataURI;
        e.website = website;
        e.github = github;
        e.version = version;
        e.updatedAt = uint64(block.timestamp);
        emit ExhibitionUpdated(id, metadataURI, version, e.updatedAt);
    }

    function getExhibition(bytes32 id) external view returns (Exhibition memory) {
        require(_exhibitions[id].exists, "missing");
        return _exhibitions[id];
    }

    function exhibitionCount() external view returns (uint256) {
        return _ids.length;
    }

    function exhibitionIdAt(uint256 index) external view returns (bytes32) {
        return _ids[index];
    }
}
