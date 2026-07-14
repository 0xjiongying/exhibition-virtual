# Hand by Hand — A Virtual Exhibition

A cinematic, browser-based concept for a virtual art exhibition.
Theme: **Humanity & Technology, Hand by Hand.**

Visual language (V2): a dark cinematic museum — pure black architecture,
graphite walls, artwork as the only vibrant light. Film and Explore share
one light-on-dark UI.

Two documents make up this project:

- [TREATMENT.md](TREATMENT.md) — the concept film, scene by scene.
- This app — a real-time companion built with the same rules: invisible
  technology, natural light, slow confident camera, artwork as the hero.

## Run

```sh
npx http-server -p 8173 -c-1 .
# open http://localhost:8173
```

(Any static file server works. Opening `index.html` directly from disk will
not load the artwork manifest — serve it over HTTP.)

## Modes

- **Film** — a single ~2½-minute continuous take: crane arrival, walking
  dolly, macro encounters, the threshold. Letterboxed, captioned, grain.
  Midway, a scripted cursor appears once — curved path, hesitation, one
  quiet click — and fill lighting lifts half a stop in answer. In the
  final scenes the hero artwork's own light spills into the hall (its color
  is sampled from the installed artwork).
- **Explore** — drag to look, `W A S D` to walk, click any work to approach
  it (the frame swings a few millimetres; the label plate appears), `Esc`
  to step back.
- **Sound** — optional generated room tone, a quiet dark-room drone, and a
  distant patient piano. Off by default; click to enable (no autoplay).

## Installing the artwork

The artwork is never generated, modified, or reinterpreted. It is loaded
pixel-for-pixel from files you provide:

1. Put image files in `assets/art/` (JPG/PNG/WebP).
2. Edit [assets/artworks.json](assets/artworks.json): each entry is one wall,
   in order — ten gallery walls, then the hero "Threshold" wall at the end
   of the hall. Set `src` (e.g. `"assets/art/nocturne.jpg"`), `title`,
   `artist`, `year`, `description`.
3. Reload. Each work is fitted inside its wall slot at its own aspect
   ratio — never cropped — and rendered with tone mapping disabled so the
   colors on screen are exactly the colors in the file.

Walls without a `src` hold a dark graphite reserved canvas and a *Reserved* label.
