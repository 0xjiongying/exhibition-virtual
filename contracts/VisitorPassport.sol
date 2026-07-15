// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title VisitorPassport
/// @notice Lean visit / passport linkage for exhibition visitors.
/// @dev Phase 1: record a visit once per exhibition id per address (extend later).
contract VisitorPassport is Ownable {
    struct VisitRecord {
        bytes32 exhibitionId;
        uint64 firstVisitAt;
        uint64 lastVisitAt;
        uint32 visitCount;
        bool completed;
    }

    /// visitor => exhibitionId => record
    mapping(address => mapping(bytes32 => VisitRecord)) private _visits;
    mapping(address => bytes32[]) private _exhibitionIds;

    event VisitRecorded(address indexed visitor, bytes32 indexed exhibitionId, uint32 visitCount, bool completed);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Record or refresh a visit. Anyone may record their own visit.
    function recordVisit(bytes32 exhibitionId, bool completed) external {
        require(exhibitionId != bytes32(0), "invalid id");
        VisitRecord storage r = _visits[msg.sender][exhibitionId];
        if (r.firstVisitAt == 0) {
            r.exhibitionId = exhibitionId;
            r.firstVisitAt = uint64(block.timestamp);
            _exhibitionIds[msg.sender].push(exhibitionId);
        }
        r.lastVisitAt = uint64(block.timestamp);
        r.visitCount += 1;
        if (completed) r.completed = true;
        emit VisitRecorded(msg.sender, exhibitionId, r.visitCount, r.completed);
    }

    function getVisit(address visitor, bytes32 exhibitionId) external view returns (VisitRecord memory) {
        return _visits[visitor][exhibitionId];
    }

    function visitorExhibitionCount(address visitor) external view returns (uint256) {
        return _exhibitionIds[visitor].length;
    }

    function visitorExhibitionIdAt(address visitor, uint256 index) external view returns (bytes32) {
        return _exhibitionIds[visitor][index];
    }
}
