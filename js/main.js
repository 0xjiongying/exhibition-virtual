// HAND BY HAND — Humanity & Technology, Hand by Hand
// Dark Museum V2 — flagship cinematic hall. Architecture serves the artwork.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.90;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x050505, 0.018);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 7.5, 26);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

/* ------------------------------------------------------------------ */
/*  Materials — M keys preserved (slab / buildArtwork call sites)      */
/*  Feel: black marble, graphite, dark concrete, gunmetal, titanium    */
/* ------------------------------------------------------------------ */

const M = {
  limestone: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.18, metalness: 0.12, envMapIntensity: 1.35 }), // black marble / polished epoxy floor
  plaster:   new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.88, metalness: 0.02 }), // graphite walls
  concrete:  new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.92, metalness: 0.04 }), // dark concrete
  concreteDark: new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.55, metalness: 0.18, envMapIntensity: 0.7 }), // obsidian fins
  oak:       new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.42, metalness: 0.55, envMapIntensity: 0.65 }), // gunmetal benches
  oakDark:   new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.38, metalness: 0.62, envMapIntensity: 0.7 }),
  aluminum:  new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.32, metalness: 0.92, envMapIntensity: 0.95 }), // brushed titanium
  brass:     new THREE.MeshStandardMaterial({ color: 0x9a9ea6, roughness: 0.28, metalness: 0.9, envMapIntensity: 1.0 }), // titanium sightlines / rails
  water:     new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.03, metalness: 0.05, envMapIntensity: 2.1 }), // black mirror pool
  skylight:  new THREE.MeshBasicMaterial({ color: 0x1a1e24 }), // dim cold light-well (not bright white)
};

/* ------------------------------------------------------------------ */
/*  Architecture — one long daylit hall                                */
/* ------------------------------------------------------------------ */
/*  Interior: x ∈ [-6, 6], y ∈ [0, 9], z ∈ [-46, 30]                   */

const HALL = { halfW: 6, height: 9, zNear: 30, zFar: -46 };
const world = new THREE.Group();
scene.add(world);

function slab(w, h, d, mat, x, y, z, receive = true, cast = false) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.receiveShadow = receive;
  m.castShadow = cast;
  world.add(m);
  return m;
}

const LEN = HALL.zNear - HALL.zFar;           // 76
const zMid = (HALL.zNear + HALL.zFar) / 2;    // -8

// floor + polished dark stone strip near the threshold ("water")
slab(2 * HALL.halfW + 4, 0.4, LEN + 8, M.limestone, 0, -0.2, zMid);
const water = slab(7, 0.04, 4.6, M.water, 0, 0.012, -41.5);

// walls
slab(0.6, HALL.height, LEN, M.plaster, -HALL.halfW - 0.3, HALL.height / 2, zMid);
slab(0.6, HALL.height, LEN, M.plaster,  HALL.halfW + 0.3, HALL.height / 2, zMid);
// end walls — raw concrete at the threshold, plaster behind the entrance
slab(2 * HALL.halfW + 1.2, HALL.height, 0.6, M.concrete, 0, HALL.height / 2, HALL.zFar - 0.3);
slab(2 * HALL.halfW + 1.2, HALL.height, 0.6, M.plaster, 0, HALL.height / 2, HALL.zNear + 0.3);

// ceiling slabs leaving a continuous skylight ribbon (x ∈ [-1.5, 1.5])
const slabW = HALL.halfW - 1.5;
slab(slabW, 0.5, LEN, M.plaster, -(1.5 + slabW / 2), HALL.height + 0.25, zMid);
slab(slabW, 0.5, LEN, M.plaster,  (1.5 + slabW / 2), HALL.height + 0.25, zMid);
// glowing sky above the ribbon
const sky = new THREE.Mesh(new THREE.PlaneGeometry(3, LEN), M.skylight);
sky.rotation.x = Math.PI / 2;
sky.position.set(0, HALL.height + 0.48, zMid);
world.add(sky);
// thin aluminum mullions across the ribbon
for (let z = HALL.zFar + 4; z < HALL.zNear; z += 4) {
  slab(3, 0.06, 0.08, M.aluminum, 0, HALL.height + 0.1, z, false, false);
}

// concrete fins — rhythm and shadow along both walls
for (let z = HALL.zFar + 10; z <= HALL.zNear - 10; z += 10) {
  slab(0.35, HALL.height, 0.9, M.concreteDark, -HALL.halfW + 0.18, HALL.height / 2, z + 5, true, true);
  slab(0.35, HALL.height, 0.9, M.concreteDark,  HALL.halfW - 0.18, HALL.height / 2, z + 5, true, true);
}

// minimal gunmetal benches
for (const z of [4, -18]) {
  slab(2.6, 0.1, 0.55, M.oak, 0, 0.42, z, true, true);
  slab(2.2, 0.37, 0.42, M.oakDark, 0, 0.185, z, true, true);
}
// a single titanium rail detail at the threshold
slab(5.2, 0.045, 0.045, M.brass, 0, 0.88, -38.6, false, true);
slab(0.045, 0.88, 0.045, M.brass, -2.55, 0.44, -38.6, false, true);
slab(0.045, 0.88, 0.045, M.brass,  2.55, 0.44, -38.6, false, true);

// optional mid-hall graphite plinths / voids — do NOT change HALL clamps or SLOTS
slab(1.1, 0.55, 1.1, M.concreteDark, -3.2, 0.275, -8, true, true);
slab(0.9, 0.42, 0.9, M.concrete, 3.4, 0.21, 8, true, true);

/* ------------------------------------------------------------------ */
/*  Light — cool-neutral silhouette hall; artwork is the lamp          */
/* ------------------------------------------------------------------ */

const SUN_BASE = 0.28;
const HEMI_BASE = 0.14;
const AMBIENT_BASE = 0.04;
const HERO_EXPLORE = 6;

const sun = new THREE.DirectionalLight(0xc8d0dc, SUN_BASE);
sun.position.set(5, 34, 6);
sun.target.position.set(-1, 0, -10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 50;  sun.shadow.camera.bottom = -50;
sun.shadow.camera.near = 4;  sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0004;
sun.shadow.radius = 6;
scene.add(sun, sun.target);

const hemi = new THREE.HemisphereLight(0xa8b4c4, 0x080808, HEMI_BASE);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0x101018, AMBIENT_BASE);
scene.add(ambient);

// the threshold: light that belongs to the hero artwork, spilling into the hall.
// its color is taken from the artwork itself once one is installed.
const heroGlow = new THREE.PointLight(0xd8e0ec, 0, 20, 1.8);
heroGlow.position.set(0, 3.1, -42.6);
scene.add(heroGlow);

// volumetric shafts under the skylight — cool, barely there
function gradientTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(180,200,220,0.55)');
  grad.addColorStop(0.55, 'rgba(140,160,185,0.12)');
  grad.addColorStop(1, 'rgba(120,140,165,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const shaftMat = new THREE.MeshBasicMaterial({
  map: gradientTexture(), transparent: true, opacity: 0.055,
  blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});
const shafts = [];
for (const z of [12, -2, -16, -30, -40]) {
  const a = new THREE.Mesh(new THREE.PlaneGeometry(3.4, HALL.height), shaftMat);
  a.position.set(0.4, HALL.height / 2, z);
  a.rotation.y = 0.25;
  a.userData.baseY = a.position.y;
  a.userData.phase = z * 0.07;
  const b = a.clone();
  b.rotation.y = -1.1;
  b.position.x = -0.2;
  b.userData.baseY = b.position.y;
  b.userData.phase = z * 0.07 + 1.7;
  world.add(a, b);
  shafts.push(a, b);
}

/* ------------------------------------------------------------------ */
/*  Atmosphere — slow dust motes (off when prefers-reduced-motion)     */
/* ------------------------------------------------------------------ */

let dust = null;
if (!reduceMotion) {
  const COUNT = 400;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * (2 * HALL.halfW - 1.2);
    positions[i * 3 + 1] = 0.4 + Math.random() * (HALL.height - 1.2);
    positions[i * 3 + 2] = HALL.zFar + 2 + Math.random() * (LEN - 4);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xc8d0dc, size: 0.035, transparent: true, opacity: 0.04,
    depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending,
  });
  dust = new THREE.Points(dustGeo, dustMat);
  dust.userData.baseY = 0;
  world.add(dust);
}

/* ------------------------------------------------------------------ */
/*  Artwork — loaded exactly as provided, never altered                */
/* ------------------------------------------------------------------ */

const SLOTS = [];
for (const z of [16, 6, -4, -14, -24]) {
  SLOTS.push({ x: -HALL.halfW, z, ry:  Math.PI / 2, w: 3.2, h: 2.1 }); // west wall
  SLOTS.push({ x:  HALL.halfW, z, ry: -Math.PI / 2, w: 3.2, h: 2.1 }); // east wall
}
SLOTS.push({ x: 0, z: HALL.zFar, ry: 0, w: 4.6, h: 3.1, hero: true }); // threshold wall

const texLoader = new THREE.TextureLoader();
const artworks = []; // { mesh, data, center, normal, w, h }

function linenTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#141416';
  g.fillRect(0, 0, 512, 512);
  const img = g.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 9;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  g.globalAlpha = 0.06;
  g.strokeStyle = '#2a2a2e';
  for (let y = 0; y < 512; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let x = 0; x < 512; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const linen = linenTexture();

function labelTexture(data) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 340;
  const g = c.getContext('2d');
  g.fillStyle = '#101012';
  g.fillRect(0, 0, 512, 340);
  g.fillStyle = '#f2f2f0';
  g.font = '600 30px "Segoe UI", system-ui, sans-serif';
  g.fillText(data.title, 40, 84);
  g.fillStyle = 'rgba(242,242,240,0.48)';
  g.font = '400 21px "Segoe UI", system-ui, sans-serif';
  g.fillText(`${data.artist}${data.year ? ' · ' + data.year : ''}`.toUpperCase(), 40, 128);
  g.fillStyle = 'rgba(242,242,240,0.72)';
  g.font = '400 20px "Segoe UI", system-ui, sans-serif';
  const words = (data.description || '').split(' ');
  let line = '', y = 182;
  for (const w of words) {
    if (g.measureText(line + w).width > 430) { g.fillText(line, 40, y); line = ''; y += 30; if (y > 320) break; }
    line += w + ' ';
  }
  if (y <= 320) g.fillText(line, 40, y);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildArtwork(slot, data) {
  const group = new THREE.Group();
  const hangY = slot.hero ? 3.1 : 2.35;
  group.position.set(slot.x, hangY, slot.z);
  group.rotation.y = slot.ry;

  let { w, h } = slot;

  const place = (texture) => {
    // frame — gunmetal with a thin titanium sightline
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.085), M.oakDark);
    frame.castShadow = true;
    const sight = new THREE.Mesh(new THREE.BoxGeometry(w + 0.045, h + 0.045, 0.088), M.brass);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      texture
        ? new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }) // exact color, untouched
        : new THREE.MeshStandardMaterial({ map: linen, roughness: 0.94 })
    );
    art.position.z = 0.047;
    group.add(frame, sight, art);

    // museum label
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.30),
      new THREE.MeshBasicMaterial({ map: labelTexture(data) })
    );
    label.position.set(w / 2 + 0.55, -(hangY - 1.5), 0.02);
    group.add(label);

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
    artworks.push({ mesh: art, group, data, center: group.position.clone(), normal, w, h, swingT: -1 });

    // cool-neutral museum spotlight — artwork is the lamp.
    // (loaded artwork is unlit for color fidelity; the spot lights frame and wall,
    //  creating the halo without ever touching the pixels.)
    const spot = new THREE.SpotLight(0xe8eef6, 42, 14, 0.38, 0.75, 1.6);
    spot.position.copy(group.position).addScaledVector(normal, 2.4);
    spot.position.y = HALL.height - 0.5;
    spot.target.position.copy(group.position);
    world.add(spot, spot.target);

    // the hero work lends its own palette to the hall at the threshold
    if (slot.hero && texture) {
      try {
        const cc = document.createElement('canvas');
        cc.width = cc.height = 8;
        const cg = cc.getContext('2d');
        cg.drawImage(texture.image, 0, 0, 8, 8);
        const px = cg.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
        const n = px.length / 4;
        heroGlow.color.setRGB(r / n / 255, g / n / 255, b / n / 255);
      } catch { /* keep the cool default */ }
    }
  };

  if (data.src) {
    texLoader.load(
      data.src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const aspect = tex.image.width / tex.image.height;
        if (aspect >= w / h) h = w / aspect; else w = h * aspect; // fit inside slot, never crop
        place(tex);
      },
      undefined,
      () => place(null)
    );
  } else {
    place(null);
  }

  // offset the group slightly off the wall
  const off = new THREE.Vector3(0, 0, 0.06).applyEuler(new THREE.Euler(0, slot.ry, 0));
  group.position.add(off);
  world.add(group);
}

const FALLBACK = { title: 'Reserved', artist: 'Artwork to be installed', year: '', description: 'This wall is waiting. The work will arrive exactly as its maker left it — every brush stroke preserved.' };

fetch('assets/artworks.json')
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => [])
  .then((list) => {
    SLOTS.forEach((slot, i) => buildArtwork(slot, { ...FALLBACK, ...(list[i] || {}) }));
  });

/* ------------------------------------------------------------------ */
/*  The guide — a hand that shows, never grabs                         */
/* ------------------------------------------------------------------ */
/*  Brushed aluminum, dark joints, a soft rim light of its own.        */
/*  It moves like a museum guide: weighted, unhurried, precise.        */

const hand = new THREE.Group();
const handMat = new THREE.MeshStandardMaterial({ color: 0xd6d8dc, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.1 });
const jointMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, metalness: 0.4, roughness: 0.45 });

function segment(len, r) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), handMat);
  m.position.y = len / 2;
  const joint = new THREE.Mesh(new THREE.SphereGeometry(r * 1.18, 12, 12), jointMat);
  g.add(joint, m);
  return g;
}

// palm and wrist
const palm = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), handMat);
palm.scale.set(0.88, 1.08, 0.34);
const wrist = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.055, 4, 10), handMat);
wrist.position.y = -0.09;
const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.029, 0.013, 16), jointMat);
cuff.position.y = -0.122;
hand.add(palm, wrist, cuff);

// four fingers + thumb, each a chain of pivoting segments
const fingers = [];
const FINGER_LENGTHS = [[0.036, 0.03, 0.023], [0.042, 0.034, 0.025], [0.04, 0.032, 0.024], [0.032, 0.026, 0.02]];
for (let i = 0; i < 4; i++) {
  const chain = [];
  let parent = new THREE.Group();
  parent.position.set(-0.036 + i * 0.024, 0.058, 0);
  parent.rotation.y = (i - 1.5) * -0.06; // fingers fan slightly, like a real hand
  hand.add(parent);
  for (let s = 0; s < 3; s++) {
    const seg = segment(FINGER_LENGTHS[i][s], 0.0085 - s * 0.0012);
    if (s > 0) seg.position.y = FINGER_LENGTHS[i][s - 1];
    parent.add(seg);
    chain.push(seg);
    parent = seg;
  }
  fingers.push(chain);
}
const thumbChain = [];
{
  let parent = new THREE.Group();
  parent.position.set(-0.048, 0.01, 0.014);
  parent.rotation.set(0.35, 0, 1.15);
  hand.add(parent);
  for (const len of [0.034, 0.028]) {
    const seg = segment(len, 0.0095);
    if (thumbChain.length) seg.position.y = 0.034;
    parent.add(seg);
    thumbChain.push(seg);
    parent = seg;
  }
}
hand.traverse((o) => { if (o.isMesh) o.castShadow = true; });

// the rim light travels with the hand — separation from the background
const rim = new THREE.PointLight(0xe8f0ff, 5, 2.2, 2);
rim.position.set(0.22, 0.3, 0.28);
hand.add(rim);

hand.scale.setScalar(2.1);      // a guide's presence on a museum stage
hand.position.set(0, -1.5, 0);  // parked below the floor until called
scene.add(hand);

// ---- hand choreography -------------------------------------------------
const handSpring = { vel: new THREE.Vector3(), curl: [0.12, 0.12, 0.12, 0.12], thumb: 0.25 };
let handAnchor = null;   // { pos, look, gesture: 'point' | 'open', t }

function callHand(art, gesture) {
  const side = gesture === 'point' ? -0.3 : 0.3;
  const lateral = new THREE.Vector3().crossVectors(art.normal, new THREE.Vector3(0, 1, 0));
  // the guide stands below the work and gestures upward — never covering it
  handAnchor = {
    pos: art.center.clone()
      .addScaledVector(art.normal, 0.85)
      .addScaledVector(lateral, side)
      .add(new THREE.Vector3(0, -art.h / 2 - 0.45, 0)),
    near: art.center.clone()
      .addScaledVector(art.normal, 0.5)
      .addScaledVector(lateral, side * 0.5)
      .add(new THREE.Vector3(0, -art.h / 2 - 0.15, 0)),
    look: art.center.clone(),
    gesture, t: 0,
  };
}
function dismissHand() { handAnchor = null; }

const findArt = (x, z) =>
  artworks.find((a) => Math.abs(a.center.x - x) < 0.5 && Math.abs(a.center.z - z) < 0.5);

let handBeat = null; // which film beat currently owns the hand
function directHand(u) {
  let beat = null;
  if (u >= 0.30 && u <= 0.44) beat = 'macro';
  else if (u >= 0.83 && u <= 0.97) beat = 'hero';
  if (beat === handBeat) return;
  handBeat = beat;
  if (beat === 'macro') { const a = findArt(-HALL.halfW, -4); if (a) callHand(a, 'point'); }
  else if (beat === 'hero') { const a = findArt(0, HALL.zFar); if (a) callHand(a, 'open'); }
  else dismissHand();
}

const CURL_POSES = {
  point: { fingers: [0.06, 0.95, 1.0, 1.0], thumb: 0.75 }, // index leads
  open:  { fingers: [0.14, 0.1, 0.12, 0.16], thumb: 0.3 },  // palm offered
};

function updateHand(dt, t) {
  let targetPos;
  if (handAnchor) {
    handAnchor.t += dt;
    // hesitation: hold at a respectful distance, then come gently closer
    targetPos = (handAnchor.t < 2.6 ? handAnchor.pos : handAnchor.near).clone();
    // idle sway — the guide breathes
    targetPos.x += Math.sin(t * 0.7) * 0.008;
    targetPos.y += Math.sin(t * 0.9 + 1.3) * 0.01;
    targetPos.z += Math.sin(t * 0.55 + 2.1) * 0.008;
  } else {
    targetPos = hand.position.clone().setY(-1.5); // sink out of sight where it stands
  }

  // weighted spring: momentum, friction, soft arrival — never a float, never a snap
  handSpring.vel.addScaledVector(targetPos.clone().sub(hand.position), dt * 5.5);
  handSpring.vel.multiplyScalar(Math.max(0, 1 - dt * 3.6));
  hand.position.addScaledVector(handSpring.vel, dt);

  if (handAnchor) {
    // wrist rotation: fingers gesture toward the work, palm turned half toward the visitor
    const toArt = handAnchor.look.clone().sub(hand.position).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), toArt);
    const roll = new THREE.Quaternion().setFromAxisAngle(toArt, Math.sin(t * 0.4) * 0.1 - 0.35);
    hand.quaternion.slerp(roll.multiply(q), Math.min(1, dt * 2.2));

    // finger articulation with micro tremor
    const pose = CURL_POSES[handAnchor.gesture];
    for (let i = 0; i < 4; i++) {
      const target = pose.fingers[i] + Math.sin(t * 3.1 + i * 1.7) * 0.012;
      handSpring.curl[i] += (target - handSpring.curl[i]) * Math.min(1, dt * 4);
      const c = handSpring.curl[i];
      fingers[i][0].rotation.x = c * 0.55;
      fingers[i][1].rotation.x = c * 0.85;
      fingers[i][2].rotation.x = c * 0.6;
    }
    handSpring.thumb += (pose.thumb - handSpring.thumb) * Math.min(1, dt * 4);
    thumbChain[0].rotation.x = handSpring.thumb * 0.5;
    thumbChain[1].rotation.x = handSpring.thumb * 0.7;
  }
}

/* ------------------------------------------------------------------ */
/*  The film — one continuous take                                     */
/* ------------------------------------------------------------------ */

const DURATION = 150; // seconds

const rail = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 7.4, 26),
  new THREE.Vector3(0, 5.2, 19),
  new THREE.Vector3(0.4, 1.8, 11),
  new THREE.Vector3(-2.8, 1.7, 3.5),
  new THREE.Vector3(-4.4, 1.75, -3.2),
  new THREE.Vector3(-2.2, 1.7, -9),
  new THREE.Vector3(2.6, 1.7, -13.5),
  new THREE.Vector3(3.9, 1.75, -19),
  new THREE.Vector3(1.2, 1.8, -26),
  new THREE.Vector3(0, 1.7, -33),
  new THREE.Vector3(0, 2.0, -38.5),
  new THREE.Vector3(0, 3.6, -40.5),
]);

const gaze = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 2.6, -6),
  new THREE.Vector3(0, 2.3, -6),
  new THREE.Vector3(-2, 2.3, -4),
  new THREE.Vector3(-6, 2.3, -4),
  new THREE.Vector3(-6, 2.35, -4),
  new THREE.Vector3(-2, 2.3, -12),
  new THREE.Vector3(6, 2.3, -14),
  new THREE.Vector3(6, 2.35, -14),
  new THREE.Vector3(2, 2.5, -30),
  new THREE.Vector3(0, 2.9, -46),
  new THREE.Vector3(0, 3.0, -46),
  new THREE.Vector3(0, 3.1, -46),
]);

const CHAPTERS = [
  { a: 0.005, b: 0.115, kicker: 'A virtual exhibition', line: 'Humanity & Technology, Hand by Hand.' },
  { a: 0.16,  b: 0.26,  kicker: '', line: 'Technology is invisible. Human creativity is the center.' },
  { a: 0.31,  b: 0.42,  kicker: 'Gallery I', line: 'Slow looking.' },
  { a: 0.50,  b: 0.62,  kicker: '', line: 'The architecture serves the artwork.' },
  { a: 0.70,  b: 0.82,  kicker: 'The threshold', line: 'The artwork is always the hero.' },
  { a: 0.875, b: 0.985, kicker: '', line: 'The artwork is the destination. Technology is the doorway.' },
];

const captionEl = document.getElementById('caption');
const kickerEl = captionEl.querySelector('.kicker');
const lineEl = captionEl.querySelector('.line');
let currentChapter = -1;

function updateCaptions(u) {
  let idx = -1;
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (u >= CHAPTERS[i].a && u <= CHAPTERS[i].b) { idx = i; break; }
  }
  if (idx !== currentChapter) {
    currentChapter = idx;
    if (idx >= 0) {
      kickerEl.textContent = CHAPTERS[idx].kicker;
      lineEl.textContent = CHAPTERS[idx].line;
      captionEl.classList.add('show');
    } else {
      captionEl.classList.remove('show');
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Modes, explore controls, artwork focus                             */
/* ------------------------------------------------------------------ */

const body = document.body;
const fadeEl = document.getElementById('fade');
const plateEl = document.getElementById('plate');
const hintEl = document.getElementById('hint');
const btnFilm = document.getElementById('btnFilm');
const btnExplore = document.getElementById('btnExplore');
const btnSound = document.getElementById('btnSound');

let mode = 'film';          // 'film' | 'explore'
let filmTime = 0;
let fading = false;

// scene 04 — the cursor appears once, does its work, and dissolves
const BEAT = { a: 0.44, b: 0.50 };            // film fraction of the cursor beat
let beatT = -1;                                // -1: not started
let beatClicked = false;
let lightWarm = 0, lightWarmT = 0;             // cursor click: half-stop fill raise (cool)
const bezier = (p0, p1, p2, t) => {
  const s = 1 - t;
  return s * s * p0 + 2 * s * t * p1 + t * t * p2;
};

let yaw = 0, pitch = 0;
const move = { f: 0, b: 0, l: 0, r: 0 };
const vel = new THREE.Vector3();

let focus = null;           // { pos, look, art } — approaching one work
let returnPose = null;

function setMode(next) {
  if (next === mode) return;
  mode = next;
  body.classList.toggle('cinema', mode === 'film');
  btnFilm.classList.toggle('active', mode === 'film');
  btnExplore.classList.toggle('active', mode === 'explore');
  captionEl.classList.remove('show');
  currentChapter = -1;
  focus = null;
  handBeat = null;
  dismissHand();
  plateEl.classList.remove('show');
  if (mode === 'explore') {
    // hand the camera over exactly where the film left it
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    yaw = e.y; pitch = e.x;
    hintEl.textContent = 'Drag to look · W A S D to walk · Click a work to approach · Esc to step back';
    hintEl.classList.add('show');
    setTimeout(() => hintEl.classList.remove('show'), 6500);
  } else {
    hintEl.classList.remove('show');
  }
}

btnFilm.addEventListener('click', () => setMode('film'));
btnExplore.addEventListener('click', () => setMode('explore'));

// pointer look — damped, no snap
let dragging = false, px = 0, py = 0;
let yawT = 0, pitchT = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; px = e.clientX; py = e.clientY; });
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointermove', (e) => {
  if (dragging && mode === 'explore' && !focus) {
    yawT -= (e.clientX - px) * 0.0028;
    pitchT -= (e.clientY - py) * 0.0028;
    pitchT = THREE.MathUtils.clamp(pitchT, -0.7, 0.7);
    px = e.clientX; py = e.clientY;
  }
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') move.f = 1;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') move.b = 1;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.l = 1;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') move.r = 1;
  if (e.code === 'Escape' && focus) unfocus();
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') move.f = 0;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') move.b = 0;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.l = 0;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') move.r = 0;
});

// raycast hover + click-to-approach
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hovered = null;

function pickArtwork(e) {
  ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  camera.updateMatrixWorld();
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(artworks.map((a) => a.mesh));
  return hits.length ? artworks.find((a) => a.mesh === hits[0].object) : null;
}

window.addEventListener('pointermove', (e) => {
  if (mode !== 'explore' || focus) { hovered = null; body.classList.remove('cursor-hot'); return; }
  hovered = pickArtwork(e);
  body.classList.toggle('cursor-hot', !!hovered);
});

canvas.addEventListener('click', (e) => {
  if (mode !== 'explore') return;
  if (focus) { unfocus(); return; }
  const art = pickArtwork(e);
  if (!art) return;
  const dist = Math.max(art.w, art.h) * 1.25 + 0.8;
  returnPose = { pos: camera.position.clone(), yaw: yawT, pitch: pitchT };
  art.swingT = 0;        // the frame stirs as we come close
  callHand(art, 'point'); // and the guide presents it
  focus = {
    pos: art.center.clone().addScaledVector(art.normal, dist),
    look: art.center.clone(),
    art,
  };
  plateEl.querySelector('h2').textContent = art.data.title;
  plateEl.querySelector('.meta').textContent = `${art.data.artist}${art.data.year ? ' · ' + art.data.year : ''}`;
  plateEl.querySelector('.desc').textContent = art.data.description || '';
  plateEl.classList.add('show');
  body.classList.remove('cursor-hot');
});

function unfocus() {
  if (focus) { focus.art.group.rotation.x = 0; focus.art.swingT = -1; }
  focus = null;
  dismissHand();
  plateEl.classList.remove('show');
  if (returnPose) { yawT = returnPose.yaw; pitchT = returnPose.pitch; }
}

/* ------------------------------------------------------------------ */
/*  Humanized cursor — lag, curvature, overshoot, rest                 */
/* ------------------------------------------------------------------ */

const curEl = document.getElementById('cursor');
const ringEl = document.getElementById('cursorRing');
const mouse = { x: innerWidth / 2, y: innerHeight / 2, t: 0 };
const dot = { x: mouse.x, y: mouse.y, vx: 0, vy: 0 };
const ring = { x: mouse.x, y: mouse.y };

window.addEventListener('pointermove', (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now();
  body.classList.remove('cursor-idle');
});

function updateCursor(dt) {
  // under-damped spring: the dot arrives with a small, human overshoot
  const k = 90, d = 13;
  dot.vx += ((mouse.x - dot.x) * k - dot.vx * d) * dt;
  dot.vy += ((mouse.y - dot.y) * k - dot.vy * d) * dt;
  dot.x += dot.vx * dt; dot.y += dot.vy * dt;
  ring.x += (dot.x - ring.x) * Math.min(1, dt * 7);
  ring.y += (dot.y - ring.y) * Math.min(1, dt * 7);
  curEl.style.transform = `translate(${dot.x - 5}px, ${dot.y - 5}px)`;
  ringEl.style.transform = `translate(${ring.x - 17}px, ${ring.y - 17}px)`;
  if (performance.now() - mouse.t > 2800) body.classList.add('cursor-idle');
}

/* ------------------------------------------------------------------ */
/*  Film grain                                                         */
/* ------------------------------------------------------------------ */

const grainC = document.getElementById('grain');
const grainG = grainC.getContext('2d');
grainC.width = 240; grainC.height = 135;
grainC.style.width = '100vw'; grainC.style.height = '100vh';
let grainClock = 0;
function updateGrain(dt) {
  grainClock += dt;
  if (grainClock < 0.09) return;
  grainClock = 0;
  const img = grainG.createImageData(240, 135);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 120;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  grainG.putImageData(img, 0, 0);
}

/* ------------------------------------------------------------------ */
/*  Sound — click-only; room tone + dark drone under piano / strings   */
/*  Future: footsteps + THREE.AudioListener on camera (spatial).       */
/* ------------------------------------------------------------------ */

let audio = null;
function toggleSound() {
  if (audio) {
    audio.stop(); audio = null;
    btnSound.classList.remove('active');
    return;
  }
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // buses: master ← dry / wet / roomTone / darkDrone
  const master = ctx.createGain(); master.gain.value = 0.0;
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 5);

  // the room itself: a long, soft museum reverberation (generated impulse)
  const ir = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3.6), ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6);
  }
  const verb = ctx.createConvolver(); verb.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = 0.55;
  const dry = ctx.createGain(); dry.gain.value = 0.42;
  const instrumentBus = ctx.createGain(); // piano + strings into the room
  instrumentBus.connect(dry).connect(master);
  instrumentBus.connect(verb); verb.connect(wet).connect(master);

  // roomTone: barely-there filtered air, outside the reverb
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    ch[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  const nlp = ctx.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 220;
  const roomTone = ctx.createGain(); roomTone.gain.value = 0.022;
  noise.connect(nlp).connect(roomTone).connect(master);
  noise.start();

  // darkDrone: quiet sub-room presence under the existing piano / strings
  const darkDrone = ctx.createGain(); darkDrone.gain.value = 0.0;
  darkDrone.connect(master);
  darkDrone.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 8);
  const droneOscs = [];
  for (const [freq, type, det] of [[55, 'sine', 0], [82.5, 'triangle', -6], [110, 'sine', 3]]) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = det;
    const g = ctx.createGain(); g.gain.value = type === 'triangle' ? 0.35 : 0.55;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140;
    o.connect(g).connect(lp).connect(darkDrone);
    o.start();
    droneOscs.push(o);
  }

  // harmony: a slow, patient progression — maj7 colors, one chord per long breath
  const CHORDS = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7sus — resolves home
  ];
  let chordIdx = 0;
  const timers = [];

  // piano voice: soft attack, real overtones, long release into the reverb
  function pianoNote(freq, vel, when) {
    const t = ctx.currentTime + when;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2100;
    lp.connect(instrumentBus);
    for (const [mult, amp] of [[1, 1], [2, 0.38], [3, 0.15], [4, 0.06]]) {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.value = freq * mult * (1 + (Math.random() - 0.5) * 0.0015);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * amp * 0.05, t + 0.015 + mult * 0.005);
      g.gain.exponentialRampToValueAtTime(0.00008, t + 7.5 - mult);
      o.connect(g).connect(lp);
      o.start(t); o.stop(t + 7.8);
    }
  }

  // phrases: one to three notes from the current chord, then a long silence
  function phrase() {
    if (!audio) return;
    const chord = CHORDS[chordIdx];
    if (Math.random() < 0.5) pianoNote(chord[0] / 2, 0.65, 0.2); // a low root grounds the room
    let when = 0.4;
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      when += 0.9 + Math.random() * 1.5;
      const f = chord[Math.floor(Math.random() * chord.length)] * (Math.random() < 0.3 ? 2 : 1);
      pianoNote(f, 0.45 + Math.random() * 0.45, when);
    }
    timers.push(setTimeout(phrase, 9000 + Math.random() * 11000));
  }

  // light strings: two detuned voices on root and fifth, swelling and receding
  const padGain = ctx.createGain(); padGain.gain.value = 0;
  const padLp = ctx.createBiquadFilter(); padLp.type = 'lowpass'; padLp.frequency.value = 520;
  padGain.connect(padLp); padLp.connect(instrumentBus);
  const padOscs = [];
  for (const det of [-4, 3]) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.detune.value = det;
    o.connect(padGain); o.start(); padOscs.push(o);
  }
  function breathe() {
    if (!audio) return;
    const chord = CHORDS[chordIdx];
    padOscs[0].frequency.setTargetAtTime(chord[0], ctx.currentTime, 4);
    padOscs[1].frequency.setTargetAtTime(chord[2], ctx.currentTime, 4);
    const t = ctx.currentTime;
    padGain.gain.cancelScheduledValues(t);
    padGain.gain.setValueAtTime(padGain.gain.value, t);
    padGain.gain.linearRampToValueAtTime(0.013, t + 9);   // breathe in
    padGain.gain.linearRampToValueAtTime(0.003, t + 22);  // and out
    chordIdx = (chordIdx + 1) % CHORDS.length;
    timers.push(setTimeout(breathe, 24000));
  }

  audio = {
    ctx,
    stop() {
      timers.forEach(clearTimeout);
      droneOscs.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
      ctx.close();
    },
  };
  timers.push(setTimeout(phrase, 2500));
  breathe();
  btnSound.classList.add('active');
}
btnSound.addEventListener('click', toggleSound);

/* ------------------------------------------------------------------ */
/*  Loop                                                               */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();
const easeInOut = (t) => t * t * (3 - 2 * t);
const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // self-healing viewport — the page may load before the window has a size
  const vw = window.innerWidth, vh = window.innerHeight;
  if (vw > 0 && vh > 0 && (canvas.width !== Math.floor(vw * renderer.getPixelRatio()) || canvas.height !== Math.floor(vh * renderer.getPixelRatio()))) {
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    renderer.setSize(vw, vh);
  }

  if (mode === 'film') {
    filmTime += dt;
    let u = (filmTime % DURATION) / DURATION;
    // near the end, fade to black and let the film begin again
    if (u > 0.985 && !fading) { fading = true; fadeEl.style.opacity = 1; }
    if (u < 0.02 && fading) { fading = false; fadeEl.style.opacity = 0; }

    const e = easeInOut(THREE.MathUtils.clamp(u, 0, 1));
    rail.getPoint(e, tmpPos);   // parameter-space: waypoint i on the rail meets
    gaze.getPoint(e, tmpLook);  // waypoint i of the gaze, so shots stay composed
    // the camera breathes — almost imperceptibly (disabled for reduced motion)
    tmpPos.y += Math.sin(t * 0.5) * 0.015;
    camera.position.lerp(tmpPos, Math.min(1, dt * 4));
    const q = camera.quaternion.clone();
    camera.lookAt(tmpLook);
    camera.quaternion.slerp(q, Math.max(0, 1 - dt * 2.2)); // damped gaze — natural, unhurried
    camera.fov = reduceMotion ? 38 : 38 + Math.sin(t * 0.23) * 0.22; // quieter FOV breathe in darkness
    camera.updateProjectionMatrix();
    updateCaptions(u);

    // scene 04 — the scripted cursor: curved path, hesitation, one quiet click
    if (u >= BEAT.a && u <= BEAT.b) {
      if (beatT < 0) { beatT = 0; beatClicked = false; }
      beatT += dt;
      const span = (BEAT.b - BEAT.a) * DURATION;           // seconds in this beat
      const p = THREE.MathUtils.clamp(beatT / span, 0, 1);
      // travel eased with a pause before the click — the hesitation
      let travel;
      if (p < 0.55) travel = easeInOut(p / 0.55) * 0.94;
      else if (p < 0.72) travel = 0.94 + Math.sin(t * 1.7) * 0.004; // hover, micro drift
      else travel = 1;
      const vw2 = window.innerWidth, vh2 = window.innerHeight;
      mouse.x = bezier(0.74 * vw2, 0.48 * vw2, 0.635 * vw2, travel);
      mouse.y = bezier(0.82 * vh2, 0.62 * vh2, 0.52 * vh2, travel);
      mouse.t = performance.now();                          // keep the cursor awake
      body.classList.remove('cursor-idle');
      if (!beatClicked && p >= 0.72) {                      // the click
        beatClicked = true;
        lightWarmT = 1;                                     // the room answers
        body.classList.add('cursor-hot');
        setTimeout(() => body.classList.remove('cursor-hot'), 380);
      }
    } else if (beatT >= 0 && (u > BEAT.b || u < BEAT.a)) {
      beatT = -1;                                           // cursor dissolves via idle fade
    }
    if (u < 0.02) lightWarmT = 0;                           // each screening starts cold

    // the threshold — the hero work's light spills into the hall (scenes 06–07)
    heroGlow.intensity = 85 * easeInOut(THREE.MathUtils.clamp((u - 0.80) / 0.13, 0, 1));

    directHand(u); // the guide enters on cue
  } else if (focus) {
    // approach one artwork — slow, deliberate, with a soft arrival
    camera.position.lerp(focus.pos, Math.min(1, dt * 1.6));
    const q = camera.quaternion.clone();
    camera.lookAt(focus.look);
    camera.quaternion.slerp(q, Math.max(0, 1 - dt * 2.4));
    // the frame answers the approach: a few millimetres of swing, then rest
    if (focus.art.swingT >= 0) {
      focus.art.swingT += dt;
      const s = focus.art.swingT;
      focus.art.group.rotation.x = 0.016 * Math.exp(-1.4 * s) * Math.sin(5.2 * s);
    }
  } else {
    // explore — softer look damping, more walk inertia
    yaw += (yawT - yaw) * Math.min(1, dt * 3.8);
    pitch += (pitchT - pitch) * Math.min(1, dt * 3.8);
    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    const acc = new THREE.Vector3()
      .addScaledVector(dir, move.f - move.b)
      .addScaledVector(side, move.r - move.l);
    if (acc.lengthSq() > 0) acc.normalize().multiplyScalar(6.5);
    vel.addScaledVector(acc, dt);
    vel.multiplyScalar(Math.max(0, 1 - dt * 2.6)); // more friction lag / glide
    camera.position.addScaledVector(vel, dt);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -HALL.halfW + 0.8, HALL.halfW - 0.8);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, HALL.zFar + 1.4, HALL.zNear - 1.4);
    camera.position.y += (1.7 - camera.position.y) * Math.min(1, dt * 3);
  }

  if (mode !== 'film') {
    // in explore, the threshold keeps a quieter presence
    heroGlow.intensity += (HERO_EXPLORE - heroGlow.intensity) * Math.min(1, dt * 2);
  }
  // lightWarm: half-stop raise of fill/hemi after cursor click (no warm sun flood)
  lightWarm += (lightWarmT - lightWarm) * Math.min(1, dt * 0.9);
  hemi.intensity = HEMI_BASE * (1 + 0.35 * lightWarm);
  ambient.intensity = AMBIENT_BASE * (1 + 0.4 * lightWarm);
  sun.intensity = SUN_BASE * (1 + 0.12 * lightWarm);

  // atmosphere drift — shafts + dust (off when prefers-reduced-motion)
  if (!reduceMotion) {
    for (const s of shafts) {
      s.position.y = s.userData.baseY + Math.sin(t * 0.18 + s.userData.phase) * 0.08;
    }
    shaftMat.opacity = 0.045 + Math.sin(t * 0.12) * 0.012;
    if (dust) {
      dust.position.y = Math.sin(t * 0.07) * 0.12;
      dust.rotation.y = t * 0.008;
    }
  }

  updateHand(dt, t);
  updateCursor(dt);
  updateGrain(dt);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// arrive from black
requestAnimationFrame(() => { fadeEl.style.opacity = 0; });
tick();

// quiet debug hook (also lets the film be scrubbed: __exhibition.seek(0.5))
window.__exhibition = {
  renderer, scene, camera, artworks, hand, callHand, dismissHand, updateHand,
  pick: (x, y) => pickArtwork({ clientX: x, clientY: y }),
  seek(u) { filmTime = u * DURATION; },
  renderOnce() {
    const e = easeInOut(THREE.MathUtils.clamp((filmTime % DURATION) / DURATION, 0, 1));
    rail.getPoint(e, tmpPos); gaze.getPoint(e, tmpLook);
    camera.position.copy(tmpPos); camera.lookAt(tmpLook);
    renderer.render(scene, camera);
  },
};
