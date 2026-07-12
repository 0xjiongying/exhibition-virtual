# HAND BY HAND
### A concept film for a virtual exhibition
**Theme: Humanity & Technology, Hand by Hand**

---

## Logline

A single unbroken visit to the museum of the future. No interface. No noise.
A human hand and a quiet cursor guide us through vast daylit galleries where
technology has disappeared and only the artwork — and our curiosity — remain.

Runtime: ~2 min 30 s · Aspect: 2.39:1 · Grade: warm neutral, film grain, HDR

---

## Design references

Apple product films · Anthropic concept videos · TeamLab · Louis Vuitton
exhibition design · Tadao Ando · John Pawson · Fincher-precision camera ·
museum editorial photography.

Rules of the world:
- The artwork is never altered. Every brush stroke, texture and color is preserved exactly.
- Technology is invisible. There are no screens, no LEDs, no chrome.
- Light is natural: skylights, warm white, soft shadow, faint fog.
- Every camera move is motivated, slow, and confident. No cuts inside a scene.

---

## Scene by scene

### 01 — Arrival (0:00–0:20)
White. A slow fade reveals a monumental concrete hall from nine metres up —
a crane shot drifting forward under a ribbon skylight. Dust hangs in the
light. Limestone floor, white plaster walls, oak benches. Far away, small
and perfect, the artworks wait.

*Caption (editorial, lower third): “Humanity & Technology, Hand by Hand.”*

Sound: room tone, one piano note, long silence.

### 02 — Descent (0:20–0:40)
The crane eases down to eye level without stopping — one continuous move —
and becomes a walking-pace dolly. Footsteps, soft cloth. The camera breathes:
gentle focus breathing as columns pass. Fog thins as we go deeper.

### 03 — First encounter (0:40–1:05)
The dolly slows and curves toward the first painting. Generous negative
space; the work alone on a wall of plaster. A **real human hand** enters
frame — hesitates a few centimetres from the surface — and hovers, never
touching. Micro-tremor in the fingers. Breathing rhythm.

The camera moves past the hand into **macro**: raking skylight reveals the
topology of the paint itself. Shallow depth of field. We hold. Longer than
is comfortable. That is the point.

*Caption: “Slow looking.”*

### 04 — The cursor (1:05–1:25)
A small cursor fades in beside the frame — curved path, variable speed, a
tiny overshoot before it settles on the label. One quiet click: the label
glows softly and the wall lighting warms half a stop. The cursor drifts
away and dissolves. Technology appeared only to serve, then vanished.

### 05 — The gallery breathes (1:25–1:50)
Lateral tracking shot along the north wall: painting, void, painting, void —
a metronome of art and silence. Across the hall, a shallow black water
strip mirrors the skylight. Strings enter under the piano, barely.

### 06 — The threshold (1:50–2:10)
At the end of the hall, one large work. The hand returns and — for the first
time — touches the frame. The frame swings a few millimetres, weight and
friction visible, and the painting’s own light spills outward: the artwork
becomes a portal, its palette washing gently across the concrete. The
architecture doesn’t compete; it receives.

### 07 — Hand by hand (2:10–2:30)
The camera rises in a slow reverse crane. Below, a visitor’s hand and the
cursor rest side by side on the oak rail — human and machine, equally still,
looking at the same painting.

*Final caption: “The artwork is the destination. Technology is the doorway.”*

Fade to warm white. Silence, then the room tone continues a beat after black.

---

## The interactive prototype

This repository contains a real-time companion to the film — the same
architecture, light, pacing and rules, built to run in a browser:

- **Film mode** plays the choreographed camera rail above, with captions,
  letterbox and grain.
- **Explore mode** hands the camera to the visitor: walk, look, approach any
  work; a humanized cursor with lag, curvature and hesitation is the only
  visible technology.
- Artwork is loaded untouched from `assets/artworks.json`. Until real assets
  arrive, frames hold neutral linen and the label reads *Reserved*. Nothing
  is generated, nothing is reinterpreted.
