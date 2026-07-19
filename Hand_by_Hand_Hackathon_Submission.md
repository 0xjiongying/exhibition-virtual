# Hand by Hand — Hackathon Submission

Prepared from the project repository (`0xjiongying/exhibition-virtual`), live site, and on-chain contract scaffold. Fields below are in the exact order of the submission form and are copy-paste ready except where flagged.

---

## 1. Project Name

**Hand by Hand — A Virtual Exhibition**

---

## 2. Description

Hand by Hand is a cinematic, browser-based virtual art museum built for Monad. Visitors either watch a choreographed one-take film through the galleries or freely walk the halls in real-time WebGL (Three.js), while every artwork is rendered pixel-for-pixel, untouched, and never cropped or reinterpreted. A thin on-chain layer — wallet connect, an ERC-721 Exhibition NFT, a provenance registry, and ERC-1155 visitor badges — lets someone own and prove they experienced the exhibition, without ever tokenizing the art on the walls. The whole product layer (wallet, passport, AI curator, discovery search) stays visually invisible until a visitor asks for it, so the museum never feels like a crypto dashboard.

---

## 3. Problem

Every "Web3 museum" or NFT gallery project follows the same broken pattern: the interface competes with the art instead of disappearing behind it. Wallet prompts fire before the first painting loads. Mint buttons sit next to the frame. Badges, token gates, and chain-switch modals fight for the same eye that's supposed to be looking at brushwork. The chain becomes the exhibit; the art becomes a skin behind it.

There's a second, quieter problem: most of these projects tokenize art they don't own — turning someone else's image into a sellable token, with a vague or absent line between "the artwork" and "the token." That's both a bad experience and a real IP liability, and almost no reference implementation draws the line cleanly between owning an *exhibition experience* and owning the *work displayed inside it*.

The personal frustration behind this build: wanting to show art on-chain without ever putting a mint button on a painting, and without pretending the technology is the point.

---

## 4. Solution

Hand by Hand solves this with a strict separation between **presentation** and **ownership**, enforced in both the front end and the contracts:

- **Film / Explore / Sound** — a choreographed cinematic walkthrough, a free-roam mode (`WASD` + click-to-approach), and an optional ambient soundtrack that never autoplays.
- **Dark Museum V2 architecture** — a single obsidian, art-led lighting system shared by both modes; product UI (wallet, passport, curator, discovery) renders in smoked glass so it recedes visually behind the work.
- **Artwork integrity by construction** — art is loaded from `assets/artworks.json` at its native aspect ratio, `toneMapped: false`, never cropped or altered; the README and contracts both encode the rule that displayed works are shown for attribution only and are never minted.
- **On-chain layer scoped to the experience, not the art** — four Monad-target contracts (OpenZeppelin ^5.0.2, Solidity ^0.8.20):
  - `ExhibitionNFT` (ERC-721) — ownership of the exhibition's architecture, curation, and metadata, with a cover image that must be creator-owned; the contract comment explicitly forbids pointing token media at third-party artwork.
  - `ExhibitionRegistry` — on-chain provenance record (creator, NFT id, metadata URI, website, GitHub, version, timestamps).
  - `VisitorBadges` (ERC-1155) — one-per-address achievement badges (First Visit, Explorer, Museum Patron, Early Supporter, Completion).
  - `VisitorPassport` — lean per-wallet visit records.
- **Graceful demo mode** — with contract addresses unset, wallet connect, badge claims, and visit proofs run entirely client-side and are labeled *Demo claimed*; the moment real addresses are dropped into `assets/exhibition.json`, the same UI paths attempt real `claim` / `recordVisit` transactions via raw `eth_sendTransaction` calldata (no heavy SDK dependency).
- **Grounded AI curator** — retrieval-only Q&A over `artworks.json`, `exhibition.json`, and `curator-notes.json`; it scores and returns only facts already in those files and gives an explicit "I do not have that" reply rather than inventing information about the art.
- **Production hardening already shipped** — vendored Three.js (no runtime CDN dependency), an XSS fix, reactive wallet state (`accountsChanged` / `chainChanged` listeners keep local state honest instead of trusting stale storage), a Content-Security-Policy, accessibility passes, and a footer **Disclaimer** panel (plain-language notices for this independent hackathon / testnet demo) — this is built past demo-only code quality, not stopped at "it works once."

---

## 5. Project URL

**https://0xjiongying.github.io/exhibition-virtual/**

*(Verified live and serving the Film / Explore / Sound experience.)*

---

## 6. GitHub Repository

**https://github.com/0xjiongying/exhibition-virtual**

*(Verified public, 14 commits on `main`, JavaScript 82% / HTML 10.6% / Solidity 7.4%.)*

---

## 7. Category (Mainnet/Testnet)

**Testnet**

Chain config in `assets/exhibition.json` is already set to **Monad Testnet** (chain id `10143` / `0x279F`, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadvision.com`). Wallet connect switches or adds that network. Contracts are written and documented but **not deployed yet** — submit under Testnet, not Mainnet. See item 8 below; deploy is still the highest-priority gap before submission.

---

## 8. Smart Contract Address

**⚠ Missing — required before submission.** No contracts are deployed yet. Chain id + RPC are already configured; remaining deploy sequence from `contracts/README.md`:

1. Deploy in order: `ExhibitionNFT` → `ExhibitionRegistry` → `VisitorPassport` → `VisitorBadges` (Foundry or Hardhat against `node_modules/@openzeppelin/contracts`).
2. Mint the exhibition NFT with a metadata URI pointing at a **creator-owned** cover (fill `image` in `metadata/exhibition-nft.json`; never point it at `featured-*` third-party art).
3. Call `registerExhibition` on `ExhibitionRegistry` with the minted `nftId`.
4. Enable badge claims on `VisitorBadges` via `setClaimEnabled`.
5. Paste all four deployed addresses into `assets/exhibition.json` → `contracts.*` so the front end exits demo mode automatically.

Once deployed, list the **`ExhibitionNFT`** contract address here (this is the token judges will most likely check on an explorer), and optionally list the other three in the write-up body if the form allows multiple addresses.

---

## 9. Demo Video URL

**⚠ Missing — required from you.** No video file, YouTube/Vimeo/Loom link, or script exists in the repository. Recommended shot list, built directly from `TREATMENT.md`'s scene breakdown so the video matches the shipped Film mode: open on the crane shot into the hall (0:00–0:20), cut to Explore mode walking to a wall (W/A/S/D), open Passport and claim a badge live, open Curator and ask "What does the Exhibition NFT represent?" to show the grounded-answer behavior, then a quick pass over the contracts folder to show the on-chain scaffold. 60–90 seconds is enough to demonstrate both the cinematic quality bar and the product layer.

---

## 10. Social Post URL

**⚠ Missing — required from you.** No public announcement post was found. Suggested post: lead with the live URL and one line on the core distinction — *"an NFT for the exhibition, not the art"* — since that's the most defensible, judge-legible hook in the project.

---

## Judge's Review

Reviewing this as a hackathon judge scoring on innovation, technical execution, design, and completeness:

**Strengths.** The design POV is unusually disciplined for a hackathon submission — most Web3 gallery projects default to tokenizing the art itself; this one draws an explicit, contract-enforced line between *experience ownership* and *artwork ownership*, which is both a stronger legal posture and a more interesting on-chain primitive to judge. The demo-mode-to-on-chain upgrade path (identical UI, addresses simply switched on) is a genuinely production-minded pattern, not a hackathon shortcut. The "production hardening" commit (vendored dependency, XSS fix, CSP, reactive wallet state) is real evidence this went past a one-off demo, which directly supports a technical-execution score.

**Gaps that will cost points if unresolved.** Three fields in this form are currently unfillable: no deployed contract address, no demo video, no social post. Judges scoring on "completeness" or "live on testnet" will mark this down hard if the submission goes in with those blank — this is the single biggest risk to the submission, bigger than any code issue. `VisitorBadges.claim` is also open-claim by design once enabled (noted candidly in your own `contracts/README.md` as needing a verifier or merkle gate before mainnet) — call this out proactively in the write-up as a known Phase 1 tradeoff rather than letting a judge discover it and read it as an oversight.

**Done since the first draft of this form:** Monad Testnet chain config + wallet add/switch, footer Disclaimer panel, submission draft checked into the repo.

**Still required before you submit, in priority order:** (1) deploy the four contracts to Monad testnet and paste the addresses into `exhibition.json` — this alone flips the contract-address field from missing to filled and lets judges click into a live token; (2) record the 60–90s demo video using the shot list above; (3) publish one social post with the live link. None of these require new product features — the app is already built to demonstrate them.
