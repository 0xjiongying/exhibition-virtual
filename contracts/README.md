# Hand by Hand — On-chain design (Monad)

These contracts support a **virtual exhibition platform** on Monad-compatible EVM.

## What IS tokenized

| Contract | Standard | Meaning |
|----------|----------|---------|
| `ExhibitionNFT.sol` | ERC-721 | Ownership of the **exhibition experience**: architecture, presentation, curatorial metadata pointer |
| `VisitorBadges.sol` | ERC-1155 | Visit / achievement badges (one claim per address per badge id) |
| `VisitorPassport.sol` | custom | Lean visit records linked to a wallet |
| `ExhibitionRegistry.sol` | custom | Provenance registry (id, creator, nftId, metadataURI, website, github, timestamps, version) |

## What is NOT tokenized

- **Third-party artworks** on the walls
- Image files under `assets/art/`
- Titles, pixels, or commercial rights to featured works
- Any marketplace listing of wall art

The Exhibition NFT **cover / `image` field must be creator-owned** (architecture mark, logo, or museum hero branding). Never use `featured-*` artwork files as NFT cover art.

See `../metadata/exhibition-nft.json` for the metadata schema template.

## Exhibition NFT metadata schema

```json
{
  "name": "string",
  "description": "string — must state experience-only ownership",
  "image": "uri — creator-owned cover only",
  "external_url": "string",
  "attributes": [{ "trait_type": "string", "value": "string" }],
  "properties": {
    "exhibition_id": "string",
    "website": "string",
    "github": "string",
    "copyright": "string",
    "cover_source": "string"
  }
}
```

## Install & compile

```sh
cd contracts
npm install
# Then compile with Foundry or Hardhat pointing at node_modules/@openzeppelin/contracts
```

OpenZeppelin `^5.0.2` is declared in `package.json`. Contracts import OZ ERC-721 / ERC-1155 / Ownable.

## Monad deploy notes

1. Confirm the **official Monad chain id** and RPC; replace the placeholder in `assets/exhibition.json` (`chain.chainIdHex`).
2. Deploy in order: `ExhibitionNFT` → `ExhibitionRegistry` → `VisitorPassport` → `VisitorBadges`.
3. Mint exhibition NFT with metadata URI that points at **creator-owned cover** JSON (pin `metadata/exhibition-nft.json` after filling `image`).
4. `registerExhibition` with the minted `nftId` and the same metadata URI.
5. Enable badge ids on `VisitorBadges` (`setClaimEnabled`) for public claim, or use `mintAdmin`.
6. Paste deployed addresses into `assets/exhibition.json` → `contracts.*` so the front-end can leave demo mode.

## Front-end behavior without deploy

The museum UI runs in **demo mode**: wallet connect + local proof-of-visit + local badge claims labeled clearly. Contract calls are attempted only when addresses are configured and `window.ethereum` is present.

## Security / product notes (Phase 1)

- `VisitorBadges.claim` is intentionally open once enabled — pair with a verifier or merkle gate before mainnet.
- `ExhibitionRegistry` and minting are `onlyOwner` for the hackathon scaffold.
- No artwork royalties or marketplace logic belong here.
