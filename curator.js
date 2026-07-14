// The service entrance. Run `node curator.js`, open http://localhost:8175,
// and drag the artwork files onto their walls. Files are written into
// assets/art/ exactly as provided — byte for byte, never touched.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ART_DIR = path.join(__dirname, 'assets', 'art');
const MANIFEST = path.join(__dirname, 'assets', 'artworks.json');

const PAGE = /* html */ `<!doctype html>
<meta charset="utf-8"><title>Curator — Hand by Hand</title>
<style>
  body { font-family: system-ui, sans-serif; background:#f4f1ea; color:#1c1a17; margin:0; padding:48px; }
  h1 { font-size:14px; letter-spacing:.3em; text-transform:uppercase; }
  p  { color:#6b665c; max-width:60ch; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; margin-top:28px; }
  .slot { border:1.5px dashed #b9b2a4; border-radius:10px; padding:18px; min-height:120px;
          display:flex; flex-direction:column; gap:6px; justify-content:center; text-align:center;
          transition:all .2s; background:#faf8f3; }
  .slot.drag { border-color:#1c1a17; background:#fff; }
  .slot.done { border-style:solid; border-color:#3a7d44; background:#f0f7f1; }
  .slot b { font-size:13px; }
  .slot small { color:#8a8272; font-size:11px; }
  .slot img { max-width:100%; max-height:90px; object-fit:contain; margin-top:6px; }
</style>
<h1>Curator — install the artwork</h1>
<p>Drag each image file onto its wall below (or click a wall to browse). The file is stored
byte-for-byte in <code>assets/art/</code> under the right name. Reload the exhibition when done.</p>
<div class="grid" id="grid"></div>
<script>
const SLOTS = [
  ['featured-01', 'The Sleeping Colossus', 'mountain colossus banner'],
  ['featured-02', 'Vigil at the Frozen Sea', 'winged figure on the ice'],
  ['featured-03', 'Portrait of the Captain', 'pirate captain portrait'],
  ['featured-04', 'The Congregation', 'pixel seal gathering'],
  ['featured-05', 'Three at Golden Hour', 'sunset trio — HERO WALL'],
  ['featured-06', 'Skrumpeys — DN Forever', 'chrome-pink wordmark'],
  ['featured-07', 'The Artist and Familiars', 'artist with pug and cat'],
  ['featured-08', 'The Offering', 'hand with glowing seal'],
  ['featured-09', 'Rest Easy', 'pink sleeper with rabbits'],
  ['featured-10', 'Through the Vortex', 'chase into the light'],
  ['featured-11', 'After Hours', 'neon lowrider alley'],
];
const grid = document.getElementById('grid');
for (const [name, title, hint] of SLOTS) {
  const el = document.createElement('div');
  el.className = 'slot';
  el.innerHTML = '<b>' + title + '</b><small>' + hint + ' → ' + name + '</small>';
  const install = async (file) => {
    const buf = await file.arrayBuffer();
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const r = await fetch('/install?name=' + name + '&ext=' + ext, { method: 'POST', body: buf });
    if (r.ok) {
      el.classList.add('done');
      const img = el.querySelector('img') || el.appendChild(document.createElement('img'));
      img.src = URL.createObjectURL(file);
    } else alert(await r.text());
  };
  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag'));
  el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('drag'); if (e.dataTransfer.files[0]) install(e.dataTransfer.files[0]); });
  el.addEventListener('click', () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => inp.files[0] && install(inp.files[0]);
    inp.click();
  });
  grid.appendChild(el);
}
</script>`;

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(PAGE);
    return;
  }
  if (req.method === 'POST' && url.pathname === '/install') {
    const name = (url.searchParams.get('name') || '').replace(/[^\w-]/g, '');
    const ext = (url.searchParams.get('ext') || 'png').replace(/[^a-z]/g, '');
    if (!/^featured-\d{2}$/.test(name)) { res.statusCode = 400; res.end('bad slot name'); return; }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      fs.mkdirSync(ART_DIR, { recursive: true });
      const file = path.join(ART_DIR, name + '.' + ext);
      fs.writeFileSync(file, Buffer.concat(chunks)); // byte-for-byte, untouched
      // keep the manifest's extension in sync
      const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
      for (const entry of manifest) {
        if (entry.src && entry.src.includes(name + '.')) entry.src = 'assets/art/' + name + '.' + ext;
      }
      fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
      console.log('installed', file, Buffer.concat(chunks).length, 'bytes');
      res.end('ok');
    });
    return;
  }
  res.statusCode = 404; res.end();
}).listen(8175, () => console.log('Curator open at http://localhost:8175'));
