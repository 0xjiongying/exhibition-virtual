// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ExhibitionNFT
/// @notice ERC-721 for the exhibition EXPERIENCE / architecture / metadata only.
/// @dev NEVER mint metadata that points to third-party artwork as the token image.
///      Cover / image URI must be creator-owned architecture, logo, or hero branding.
contract ExhibitionNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextId = 1;

    event ExhibitionMinted(uint256 indexed tokenId, address indexed to, string tokenURI);

    constructor(address initialOwner)
        ERC721("Hand by Hand Exhibition", "HBHEX")
        Ownable(initialOwner)
    {}

    /// @notice Mint an exhibition experience token with metadata URI (creator-owned cover only).
    function mintExhibition(address to, string calldata uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit ExhibitionMinted(tokenId, to, uri);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
