// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title VisitorBadges
/// @notice ERC-1155 badges — one claim per address per badge id.
/// @dev Eligibility is enforced off-chain / by a future verifier; this contract
///      enforces the one-claim invariant. Phase 1 allows open claim for demo
///      once the owner enables a badge id, or owner mints directly.
contract VisitorBadges is ERC1155, Ownable {
    mapping(uint256 => bool) public claimEnabled;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => string) private _tokenURIs;

    event BadgeClaimed(address indexed account, uint256 indexed id);
    event BadgeEnabled(uint256 indexed id, bool enabled);
    event BadgeURISet(uint256 indexed id, string uri);

    constructor(address initialOwner, string memory baseURI) ERC1155(baseURI) Ownable(initialOwner) {}

    function setBadgeURI(uint256 id, string calldata tokenUri) external onlyOwner {
        _tokenURIs[id] = tokenUri;
        emit BadgeURISet(id, tokenUri);
    }

    function setClaimEnabled(uint256 id, bool enabled) external onlyOwner {
        claimEnabled[id] = enabled;
        emit BadgeEnabled(id, enabled);
    }

    /// @notice Claim a badge once. Reverts if already claimed or not enabled.
    function claim(uint256 id) external {
        require(claimEnabled[id], "disabled");
        require(!hasClaimed[id][msg.sender], "claimed");
        hasClaimed[id][msg.sender] = true;
        _mint(msg.sender, id, 1, "");
        emit BadgeClaimed(msg.sender, id);
    }

    /// @notice Owner mint for curated drops / recovery (still one balance unit).
    function mintAdmin(address to, uint256 id) external onlyOwner {
        require(!hasClaimed[id][to], "claimed");
        hasClaimed[id][to] = true;
        _mint(to, id, 1, "");
        emit BadgeClaimed(to, id);
    }

    function uri(uint256 id) public view override returns (string memory) {
        string memory specific = _tokenURIs[id];
        if (bytes(specific).length > 0) return specific;
        return super.uri(id);
    }
}
