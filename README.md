# Hand by Hand — A Virtual Exhibition

**Live: https://0xjiongying.github.io/exhibition-virtual/**

A cinematic, browser-based virtual art exhibition.
Theme: **Humanity & Technology, Hand by Hand.**

Built as a Monad hackathon vision: a **premium museum experience** where art stays at the center and crypto stays nearly invisible — plus a production scaffold for Exhibition NFT (experience ownership), registry, visitor passport, and badges.

## Visual language

**Dark Museum V2** (current): pure black / obsidian architecture, cool art-led lighting, smoked-glass UI. Film and Explore share one light-on-dark system.

> **Palette note:** Some product briefs describe warm limestone daylight. That direction is intentionally **not** applied in this pass — Dark V2 remains the shipped aesthetic. Product chrome (wallet, passport, curator, discovery) is layered in smoked glass and quiet type to match the dark hall.

## Run

```sh
npm start
# open http://localhost:8173
```

Or: `npx http-server -p 8173 -c-1 .`

(Any static file server works. Opening `index.html` from disk will not load JSON manifests.)

Stage for hosts that expect `dist/`:

```sh
npm run build
```

## Deploy

The live site is GitHub Pages, served from the `gh-pages` branch (the built `dist/` at its root, plus `.nojekyll`). To redeploy after changes land on `main`:

```sh
npm run build
cd $(mktemp -d) && cp -r <repo>/dist/* . && touch .nojekyll
git init -b gh-pages && git add -A && git commit -m "Deploy"
git push -f https://github.com/0xjiongying/exhibition-virtual.git gh-pages
```

`render.yaml` remains as a blueprint if the site ever moves to Render (build `npm run build`, publish `dist`).

## Modes

- **Film** — continuous cinematic take, letterboxed, captioned.
- **Explore** — drag to look, `W A S D` to walk, click a work to approach, `Esc` to step back.
- **Sound** — optional room tone; off by default (no autoplay).

## Phase 1 product layer (demo mode)

Additive UI near Film / Explore / Sound:

| Control | What it does |
|---------|----------------|
| **Wallet** | `window.ethereum` connect + Monad chain-switch stub (placeholder chain id in `assets/exhibition.json`) |
| **Passport** | Truncated address, local visits, badge catalog, claim buttons, local session metrics + JSON export |
| **Curator** | Retrieval Q&A over `artworks.json` + `exhibition.json` + `assets/curator-notes.json` — never invents facts |
| **Discover** | Search + tag chips; subtle wall highlights + “look toward” list (does not remove art from the hall) |

**Demo mode vs on-chain:** With empty contract addresses in `assets/exhibition.json`, badge claims and visit proofs stay **local** and are labeled *Demo claimed*. After Monad deploy, paste addresses into `exhibition.json` → `contracts.*` to attempt real `claim` / registry calls.

### Try it

1. `npm start` → open the site.
2. Click **Explore**, approach 5 works (and the hero feast wall) for Explorer / Patron / Completion eligibility.
3. **Passport** → claim badges (demo mode without a wallet; Early Supporter needs Wallet).
4. **Curator** → ask “What does the Exhibition NFT represent?” or use the chips.
5. **Discover** → chip *Hackathon* or search a title, then pick a row to approach that wall.

## What the Exhibition NFT means

The ERC-721 (**Exhibition NFT**) is ownership of the **exhibition experience / architecture / metadata** — not the artworks on the walls.

- Cover image must be **creator-owned** (see `assets/cover/exhibition-cover.svg`).
- Never use `featured-*` third-party art as NFT cover or token media.
- See `contracts/README.md` and `metadata/exhibition-nft.json`.

## Copyright

Displayed works are shown **with attribution for exhibition viewing only**. They are **not** minted, sold, licensed, or otherwise tokenized by this platform. Artwork files are never altered or cropped for tokenization; wall fitting preserves aspect ratio; rendering uses `toneMapped: false`.

In-UI notice: footer plate + `assets/exhibition.json` → `copyright.notice`.

## Installing the artwork

The artwork is never generated, modified, or reinterpreted. It is loaded pixel-for-pixel from files you provide:

1. Put image files in `assets/art/` (JPG/PNG/WebP).
2. Edit [assets/artworks.json](assets/artworks.json): each entry is one wall (optional `tags` for discovery). Set `src`, `title`, `artist`, `year`, `description`.
3. Reload. Each work is fitted inside its wall slot at its own aspect ratio — never cropped.

Optional curator install UI: `node curator.js` → http://localhost:8175

## Repository map

| Path | Role |
|------|------|
| `js/main.js` | Dark Museum V2 scene, Film / Explore / Sound |
| `js/museum-boot.js` + `js/*` product modules | Wallet, passport, visit proof, curator, discovery, analytics |
| `assets/exhibition.json` | Exhibition identity + contract address slots |
| `assets/badges.json` | Badge catalog |
| `assets/curator-notes.json` | Curator knowledge (facts only) |
| `contracts/` | Solidity stubs (OZ) — not copied to `dist/` |
| `metadata/exhibition-nft.json` | ERC-721 metadata template |

## On-chain (Monad)

```sh
cd contracts && npm install
# compile/deploy with Foundry or Hardhat — see contracts/README.md
```

Contracts: `ExhibitionRegistry`, `ExhibitionNFT`, `VisitorPassport`, `VisitorBadges`.

## Analytics

Local-only session metrics in `localStorage` (length, works viewed, completion). Export from Passport → Session. No third-party trackers.

## Out of scope (this pass)

Full multi-building campus, ray tracing, fabric sim, live mainnet deploy, NFT marketplace, AI image generation, crypto dashboard chrome.
