import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ---- edit this message ----
const MESSAGES = [
  'Another year older, another chapter brighter ✨\n' +
  'May this one be wrapped in joy, tied with laughter,\n' +
  'and filled with every wish your heart has been saving.\n' +
  'Today the whole sky is celebrating you. 💖',

  'May your days sparkle like the gold on your dress 🌟\n' +
  'and your nights be full of peace and quiet magic.\n' +
  'You deserve every good thing coming your way.',

  'Here is to big dreams, small joys and endless smiles 🎈\n' +
  'May this year say yes to everything you hope for.\n' +
  'Never stop shining, you were made to glow. ✨',

  'Wishing you a year with more laughter than worries,\n' +
  'more cake than calories, and more love than you can count 🍰\n' +
  'Happy Birthday, Sammia! 💕',

  'May luck follow you, kindness find you,\n' +
  'and happiness choose you every single day 🍀\n' +
  'The best chapters of your story are still ahead. 📖',

  'Make it a birthday to remember and a year to treasure 🎁\n' +
  'The world is a little brighter because you are in it. 🌙',
];
let messageIndex = 0;

const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);

// ---- renderer / scene ----
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, -0.2, 0);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.minPolarAngle = Math.PI / 2 - 0.35;
controls.maxPolarAngle = Math.PI / 2 + 0.3;
controls.minAzimuthAngle = -0.6;
controls.maxAzimuthAngle = 0.6;

// photo and cake sit side by side on wide screens, stacked on portrait/mobile
const layout = { portrait: false, photo: { x: 0, y: 1.4, s: 0.85 }, cake: { x: 0, y: -3.4, s: 0.75 } };
let balloonsReady = false;
let camDist = 12.5;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
let autoSway = true, swayTimer = 0;
controls.addEventListener('start', () => { autoSway = false; controls.autoRotate = false; clearTimeout(swayTimer); });
controls.addEventListener('end', () => {
  swayTimer = setTimeout(() => { autoSway = true; controls.autoRotate = true; }, 2500);
});

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  layout.portrait = camera.aspect < 0.9;
  if (layout.portrait) {
    camDist = camera.aspect < 0.7 ? 14.5 : 13.5;
    layout.photo = { x: 0, y: 0.4, s: 0.85 };
    layout.cake = { x: 0, y: -4.4, s: 0.9 };
    controls.target.set(0, -0.2, 0);
  } else {
    camDist = camera.aspect < 1.3 ? 15 : 12.5;
    layout.photo = { x: -4.2, y: -0.4, s: 1 };
    layout.cake = { x: 4.0, y: -2.9, s: 1.15 };
    controls.target.set(0, -0.5, 0);
  }
  camera.position.set(0, 0.8, camDist);
  camera.updateProjectionMatrix();
  controls.update();
  if (balloonsReady) layoutBalloons();
}
window.addEventListener('resize', resize);
resize();

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const key = new THREE.DirectionalLight(0xfff0d9, 1.4);
key.position.set(3, 6, 8);
scene.add(key);
const rim = new THREE.PointLight(0xff7eb3, 40, 30);
rim.position.set(-6, 2, 4);
scene.add(rim);
const flameLight = new THREE.PointLight(0xffa640, 6, 8);
flameLight.position.set(0, -1.7, 1.2);
scene.add(flameLight);

// ---- helpers ----
function glowTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function heartGeometry(size = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, 0.35);
  s.bezierCurveTo(0, 0.35, -0.05, 0, -0.5, 0);
  s.bezierCurveTo(-1.1, 0, -1.1, 0.77, -1.1, 0.77);
  s.bezierCurveTo(-1.1, 1.1, -0.75, 1.54, 0, 1.9);
  s.bezierCurveTo(0.75, 1.54, 1.1, 1.1, 1.1, 0.77);
  s.bezierCurveTo(1.1, 0.77, 1.1, 0, 0.5, 0);
  s.bezierCurveTo(0.15, 0, 0, 0.35, 0, 0.35);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 4, curveSegments: 16 });
  g.center();
  g.scale(size, size, size);
  return g;
}

const gold = new THREE.MeshStandardMaterial({ color: 0xe0b44c, metalness: 1, roughness: 0.22 });

// ---- stars ----
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(700 * 3);
for (let i = 0; i < 700; i++) {
  const r = rand(25, 70), th = rand(0, Math.PI * 2), ph = Math.acos(rand(-1, 1));
  starPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  size: 0.7, map: glowTexture('#fff', 'rgba(255,255,255,0)'), transparent: true,
  depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffeedd,
}));
scene.add(stars);

// ---- photo frame ----
const photoGroup = new THREE.Group();
photoGroup.position.set(0, 1.3, 0);
scene.add(photoGroup);

const glow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTexture('rgba(255,150,200,.9)', 'rgba(255,150,200,0)'),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8,
}));
glow.scale.set(7.5, 7.5, 1);
glow.position.z = -0.6;
photoGroup.add(glow);

const PW = 2.4, PH = 3.2, B = 0.16;
const back = new THREE.Mesh(new THREE.BoxGeometry(PW + B * 2, PH + B * 2, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a0d33, roughness: 0.6 }));
back.position.z = -0.07;
photoGroup.add(back);

const photoMat = new THREE.MeshBasicMaterial({ toneMapped: false });
const photo = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), photoMat);
photoGroup.add(photo);

for (const [w, h, x, y] of [
  [PW + B * 2, B, 0, PH / 2 + B / 2], [PW + B * 2, B, 0, -PH / 2 - B / 2],
  [B, PH, -PW / 2 - B / 2, 0], [B, PH, PW / 2 + B / 2, 0],
]) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.26), gold);
  bar.position.set(x, y, 0.05);
  photoGroup.add(bar);
}
const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xff5fa2, roughness: 0.15, clearcoat: 1, emissive: 0x551133 });
for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), gemMat);
  gem.position.set(sx * (PW / 2 + B / 2), sy * (PH / 2 + B / 2), 0.2);
  photoGroup.add(gem);
}
const topHeart = new THREE.Mesh(heartGeometry(0.34), new THREE.MeshPhysicalMaterial({ color: 0xff5fa2, roughness: 0.2, clearcoat: 1, emissive: 0x440b26 }));
topHeart.rotation.z = Math.PI;
topHeart.position.set(0, PH / 2 + B + 0.28, 0.1);
photoGroup.add(topHeart);

const loadMgr = new THREE.LoadingManager(() => {
  const btn = $('open');
  btn.disabled = false;
  btn.textContent = 'Open your surprise ✨';
});
new THREE.TextureLoader(loadMgr).load('assets/image.png', (tex) => {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  photoMat.map = tex;
  photoMat.needsUpdate = true;
});

// ---- cake ----
const cake = new THREE.Group();
cake.position.set(0, -3.6, 0.8);
scene.add(cake);

const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, ...extra });
const add = (geo, m, y) => { const mesh = new THREE.Mesh(geo, m); mesh.position.y = y; cake.add(mesh); return mesh; };

add(new THREE.CylinderGeometry(1.75, 1.85, 0.1, 48), gold, 0);
add(new THREE.CylinderGeometry(1.3, 1.3, 0.8, 48), mat(0xffd1e3), 0.45);
add(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 48), mat(0xfff2f6), 1.2);
for (const [r, y] of [[1.3, 0.85], [0.9, 1.55]]) {
  const ring = add(new THREE.TorusGeometry(r, 0.09, 12, 64), mat(0xff7eb3), y);
  ring.rotation.x = Math.PI / 2;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), mat(0xff7eb3));
    drip.scale.y = rand(1.2, 2.4);
    drip.position.set(Math.cos(a) * r, y - 0.12, Math.sin(a) * r);
    cake.add(drip);
  }
}
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat(0xd7143a, { roughness: 0.2 }));
  cherry.position.set(Math.cos(a) * 0.72, 1.6, Math.sin(a) * 0.72);
  cake.add(cherry);
}

// kawaii face on the front of the bottom tier
const ink = new THREE.MeshStandardMaterial({ color: 0x2a1238, roughness: 0.3 });
for (const sx of [-1, 1]) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), ink);
  eye.position.set(sx * 0.3, 0.52, 1.26);
  eye.scale.z = 0.5;
  cake.add(eye);
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  shine.position.set(sx * 0.3 + 0.025, 0.55, 1.3);
  cake.add(shine);
  const blush = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10), new THREE.MeshStandardMaterial({ color: 0xff8fb8, roughness: 0.7 }));
  blush.position.set(sx * 0.55, 0.4, 1.17);
  blush.scale.z = 0.3;
  blush.lookAt(sx * 1.2, 0.4, 2.4);
  cake.add(blush);
}
const smile = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 20, Math.PI), ink);
smile.rotation.z = Math.PI;
smile.position.set(0, 0.45, 1.27);
cake.add(smile);

// sprinkles and a heart topper
const sprinkleColors = [0xff7eb3, 0xffd166, 0x7bdff2, 0xc77dff, 0xffffff];
for (let i = 0; i < 34; i++) {
  const a = rand(0, Math.PI * 2), r = rand(0.08, 0.8);
  const sp = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 4, 6), mat(sprinkleColors[i % 5]));
  sp.position.set(Math.cos(a) * r, 1.56, Math.sin(a) * r);
  sp.rotation.set(Math.PI / 2, 0, rand(0, 3));
  cake.add(sp);
}
const topper = new THREE.Mesh(heartGeometry(0.1), new THREE.MeshPhysicalMaterial({ color: 0xff5fa2, roughness: 0.2, clearcoat: 1, emissive: 0x440b26 }));
topper.rotation.z = Math.PI;
topper.position.y = 1.78;
cake.add(topper);

const flames = [];
const candleColors = [0xff7eb3, 0x7bdff2, 0xffd166, 0xc77dff, 0xffffff];
candleColors.forEach((c, i) => {
  const a = (i / 5) * Math.PI * 2 + 0.3;
  const x = Math.cos(a) * 0.45, z = Math.sin(a) * 0.45;
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12), mat(c));
  candle.position.set(x, 1.85, z);
  cake.add(candle);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffc04d }));
  flame.scale.set(1, 1.8, 1);
  flame.position.set(x, 2.2, z);
  cake.add(flame);
  flames.push({ mesh: flame, phase: rand(0, 6) });
});

// ---- balloons ----
const balloons = [];
const balloonColors = [0xff7eb3, 0xffd166, 0xc77dff, 0x7bdff2, 0xff9ec8, 0xffffff, 0xf4a261];
for (let i = 0; i < 14; i++) {
  const g = new THREE.Group();
  const col = balloonColors[i % balloonColors.length];
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 }));
  body.scale.set(1, 1.2, 1);
  g.add(body);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 8), new THREE.MeshStandardMaterial({ color: col }));
  knot.position.y = -0.62;
  knot.rotation.x = Math.PI;
  g.add(knot);
  const string = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.68, 0), new THREE.Vector3(0.1, -1.1, 0), new THREE.Vector3(-0.08, -1.6, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
  );
  g.add(string);
  g.scale.setScalar(rand(0.85, 1.25));
  g.visible = false;
  scene.add(g);
  balloons.push({
    g, side: i % 2 ? 1 : -1, rx: Math.random(), ry: Math.random(), rz: Math.random(), center: i % 3 === 0,
    baseX: 0, baseY: 0, phase: rand(0, 6), speed: rand(0.6, 1.2), delay: rand(0, 1.2),
  });
}

function layoutBalloons() {
  balloons.forEach((b) => {
    if (layout.portrait) {
      b.baseX = b.side * (2.7 + b.rx * 0.8);
      b.baseY = -1 + b.ry * 5;
      b.g.position.z = -2 + b.rz * 2;
    } else if (b.center) {
      b.baseX = (b.rx - 0.5) * 3;
      b.baseY = -1 + b.ry * 4.5;
      b.g.position.z = -3.5;
    } else {
      b.baseX = b.side * (7 + b.rx * 2.5);
      b.baseY = -2 + b.ry * 6;
      b.g.position.z = -2.5 + b.rz * 3;
    }
  });
}
balloonsReady = true;
layoutBalloons();

// ---- clouds ----
// glowing crescent moon
const moonCanvas = document.createElement('canvas');
moonCanvas.width = moonCanvas.height = 256;
{
  const g = moonCanvas.getContext('2d');
  const halo = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  halo.addColorStop(0, 'rgba(255,230,160,.55)');
  halo.addColorStop(1, 'rgba(255,230,160,0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#fff3c4';
  g.shadowColor = '#ffe39a';
  g.shadowBlur = 24;
  g.beginPath();
  g.arc(128, 128, 60, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.shadowBlur = 0;
  g.beginPath();
  g.arc(152, 112, 54, 0, Math.PI * 2);
  g.fill();
}
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(moonCanvas), transparent: true, depthWrite: false }));
scene.add(moon);

// fireflies / magic dust
const FF = 90;
const ffPos = new Float32Array(FF * 3);
const ffBase = Array.from({ length: FF }, () => new THREE.Vector3(rand(-11, 11), rand(-5, 6), rand(-6, 3)));
const ffGeo = new THREE.BufferGeometry();
ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
const fireflies = new THREE.Points(ffGeo, new THREE.PointsMaterial({
  size: 0.35, map: glowTexture('rgba(255,236,170,1)', 'rgba(255,200,120,0)'), transparent: true,
  depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9,
}));
fireflies.frustumCulled = false;
scene.add(fireflies);

// shooting stars
const shooters = Array.from({ length: 2 }, () => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.z = -0.5;
  scene.add(m);
  return { m, life: 1, next: rand(2, 6), vx: 0, vy: 0 };
});

// ---- bunting flags ----
const bunting = new THREE.Group();
const flagColors = [0xff7eb3, 0xffd166, 0xc77dff, 0x7bdff2, 0xffffff];
for (let i = 0; i < 15; i++) {
  const x = -7 + i * 1;
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 3), new THREE.MeshStandardMaterial({ color: flagColors[i % 5], roughness: 0.6 }));
  flag.rotation.z = Math.PI;
  flag.position.set(x, 5.6 - Math.sin((i / 14) * Math.PI) * 0.9 - 0.35, -3.5);
  bunting.add(flag);
}
bunting.visible = false;
scene.add(bunting);

// ---- floating hearts ----
const hearts = [];
const heartGeo = heartGeometry(0.16);
for (let i = 0; i < 16; i++) {
  const m = new THREE.Mesh(heartGeo, new THREE.MeshPhysicalMaterial({
    color: [0xff5fa2, 0xff9ec8, 0xffd166, 0xc77dff][i % 4], roughness: 0.25, clearcoat: 1,
  }));
  m.rotation.z = Math.PI;
  m.position.set(rand(-6, 6), rand(-6, 6), rand(-3, 1.5));
  m.visible = false;
  scene.add(m);
  hearts.push({ m, speed: rand(0.3, 0.8), spin: rand(0.5, 1.5) });
}

// ---- confetti ----
const CN = 600;
const confMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.1, 0.18), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CN);
confMesh.frustumCulled = false;
scene.add(confMesh);
const confetti = Array.from({ length: CN }, () => ({
  on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Vector3(), s: new THREE.Vector3(), ph: 0,
}));
const confColors = ['#ff7eb3', '#ffd166', '#c77dff', '#7bdff2', '#ffffff', '#f4a261'].map((c) => new THREE.Color(c));
const dummy = new THREE.Object3D();
let confCursor = 0;
for (let i = 0; i < CN; i++) {
  dummy.scale.setScalar(0);
  dummy.updateMatrix();
  confMesh.setMatrixAt(i, dummy.matrix);
  confMesh.setColorAt(i, confColors[0]);
}

function burst(x, y, z, count = 150) {
  for (let n = 0; n < count; n++) {
    const c = confetti[confCursor];
    const idx = confCursor;
    confCursor = (confCursor + 1) % CN;
    c.on = true;
    c.p.set(x, y, z);
    c.v.set(rand(-4, 4), rand(3, 10), rand(-2.5, 3));
    c.r.set(rand(0, 6), rand(0, 6), rand(0, 6));
    c.s.set(rand(-8, 8), rand(-8, 8), rand(-8, 8));
    c.ph = rand(0, 6);
    confMesh.setColorAt(idx, confColors[(Math.random() * confColors.length) | 0]);
  }
  confMesh.instanceColor.needsUpdate = true;
}

function updateConfetti(dt, t) {
  for (let i = 0; i < CN; i++) {
    const c = confetti[i];
    if (!c.on) continue;
    c.v.y -= 9 * dt;
    c.v.multiplyScalar(1 - 0.9 * dt);
    c.p.addScaledVector(c.v, dt);
    c.p.x += Math.sin(t * 4 + c.ph) * 0.6 * dt;
    c.r.addScaledVector(c.s, dt);
    if (c.p.y < -8) {
      c.on = false;
      dummy.scale.setScalar(0);
    } else {
      dummy.scale.setScalar(1);
    }
    dummy.position.copy(c.p);
    dummy.rotation.set(c.r.x, c.r.y, c.r.z);
    dummy.updateMatrix();
    confMesh.setMatrixAt(i, dummy.matrix);
  }
  confMesh.instanceMatrix.needsUpdate = true;
}

// ---- music (Happy Birthday via WebAudio) ----
const NOTES = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const TUNE = [
  ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
  ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
];
const BEAT = 0.5;
let audio = null, master = null, muted = false, loopTimer = 0;

function playTune() {
  const t0 = audio.currentTime + 0.05;
  let t = t0;
  for (const [n, beats] of TUNE) {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'triangle';
    o.frequency.value = NOTES[n];
    const d = beats * BEAT;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.95);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + d);
    t += d;
  }
  loopTimer = setTimeout(playTune, (t - t0 + 2) * 1000);
}

// Drop any song at assets/song.mp3 and it plays instead of the built-in tune.
let song = null;
function startMusic() {
  song = new Audio('assets/song.mp3');
  song.loop = true;
  song.volume = 0.7;
  song.addEventListener('error', startTune, { once: true });
  song.play().then(() => $('mute').classList.remove('hide')).catch(() => {});
}

function startTune() {
  song = null;
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    master = audio.createGain();
    master.gain.value = 0.25;
    master.connect(audio.destination);
    playTune();
    $('mute').classList.remove('hide');
  } catch (e) { /* audio unavailable, carry on silently */ }
}

$('mute').addEventListener('click', () => {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.25;
  if (song) song.muted = muted;
  $('mute').textContent = muted ? '🔇' : '🔊';
});

// ---- interaction ----
let started = false, startT = 0, blown = false, blownT = 0;
const clock = new THREE.Clock();

$('open').addEventListener('click', () => {
  started = true;
  startT = clock.elapsedTime;
  document.body.classList.add('started');
  $('intro').classList.add('gone');
  balloons.forEach((b) => (b.g.visible = true));
  hearts.forEach((h) => (h.m.visible = true));
  bunting.visible = true;
  startMusic();
  setTimeout(() => burst(0, 0, 2, 200), 500);
  setTimeout(() => $('blow').classList.remove('hide'), 3200);
});

function blow() {
  if (!started || blown) return;
  blown = true;
  blownT = clock.elapsedTime;
  $('message').textContent = MESSAGES[messageIndex];
  messageIndex = (messageIndex + 1) % MESSAGES.length;
  $('blow').classList.add('hide');
  for (let i = 0; i < 6; i++) {
    setTimeout(() => burst(rand(-3, 3), rand(-1, 3), rand(0, 3), 140), 300 + i * 350);
  }
  setTimeout(() => $('card').classList.remove('hide'), 1500);
}
$('blow').addEventListener('click', blow);

$('again').addEventListener('click', () => {
  blown = false;
  $('card').classList.add('hide');
  $('blow').classList.remove('hide');
});

// tap the cake to blow the candles
const ray = new THREE.Raycaster();
let downAt = null;
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (ray.intersectObject(cake, true).length) blow();
});

$('card').classList.add('hide');

// ---- loop ----
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const since = t - startT;

  const ps = started ? easeOutBack(clamp01(since / 1.4)) : 0;
  photoGroup.scale.setScalar(Math.max(ps * layout.photo.s, 0.0001));
  photoGroup.position.x = layout.photo.x;
  photoGroup.position.y = layout.photo.y + Math.sin(t * 1.2) * 0.08;
  photoGroup.rotation.y = Math.sin(t * 0.6) * 0.07;
  photoGroup.rotation.z = Math.sin(t * 0.8) * 0.02;
  topHeart.scale.setScalar(1 + Math.sin(t * 4) * 0.08);

  const cs = started ? easeOutBack(clamp01((since - 0.6) / 1.2)) : 0;
  cake.scale.setScalar(Math.max(cs * layout.cake.s, 0.0001));
  cake.position.x = layout.cake.x;
  cake.position.y = layout.cake.y + Math.sin(t * 1.1 + 1) * 0.06;
  cake.rotation.y = Math.sin(t * 0.5) * 0.45;
  topper.rotation.y = t * 1.5;
  topper.scale.setScalar(1 + Math.sin(t * 4) * 0.1);
  flameLight.position.set(layout.cake.x, layout.cake.y + 2 * layout.cake.s, 1.2);

  // camera glides left and right on its own; dragging pauses it
  if (autoSway) {
    const az = controls.getAzimuthalAngle();
    if (az > 0.45) controls.autoRotateSpeed = -Math.abs(controls.autoRotateSpeed);
    else if (az < -0.45) controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed);
  }

  flames.forEach((f, i) => {
    const out = blown ? clamp01(1 - (t - blownT) / 0.5) : 1;
    const flick = 1 + Math.sin(t * 14 + f.phase) * 0.15 + Math.sin(t * 23 + i) * 0.08;
    f.mesh.scale.set(out * flick, out * 1.8 * flick, out * flick);
  });
  flameLight.intensity = blown ? Math.max(0, flameLight.intensity - dt * 14) : 6 + Math.sin(t * 12) * 0.8;
  if (!blown && flameLight.intensity < 5) flameLight.intensity = 6;

  balloons.forEach((b) => {
    const rise = started ? 1 - easeOutBack(clamp01((since - b.delay) / 2.6)) : 1;
    b.g.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * 0.25 - rise * 11;
    b.g.position.x = b.baseX + Math.sin(t * b.speed * 0.7 + b.phase) * 0.15;
    b.g.rotation.z = Math.sin(t * b.speed + b.phase) * 0.08;
  });

  hearts.forEach((h) => {
    h.m.position.y += h.speed * dt;
    h.m.rotation.y += h.spin * dt;
    if (h.m.position.y > 6.5) {
      h.m.position.set(rand(-6, 6), -6.5, rand(-3, 1.5));
    }
  });

  moon.position.set(layout.portrait ? 3.6 : 9, layout.portrait ? 4.4 : 3.8, -9);
  moon.scale.setScalar(layout.portrait ? 4 : 6);
  moon.material.rotation = Math.sin(t * 0.3) * 0.05;

  for (let i = 0; i < FF; i++) {
    const b = ffBase[i];
    ffPos[i * 3] = b.x + Math.sin(t * 0.4 + i) * 0.8;
    ffPos[i * 3 + 1] = b.y + Math.sin(t * 0.6 + i * 1.7) * 0.7;
    ffPos[i * 3 + 2] = b.z;
  }
  ffGeo.attributes.position.needsUpdate = true;
  fireflies.material.opacity = 0.65 + Math.sin(t * 2) * 0.25;

  shooters.forEach((s) => {
    s.next -= dt;
    if (s.next <= 0 && s.life >= 1) {
      s.life = 0;
      s.m.position.set(rand(-4, 9), rand(3, 6), -6);
      s.vx = -rand(9, 13);
      s.vy = -rand(4, 7);
      s.m.rotation.z = Math.atan2(s.vy, s.vx);
      s.next = rand(3, 8);
    }
    if (s.life < 1) {
      s.life += dt * 0.9;
      s.m.position.x += s.vx * dt;
      s.m.position.y += s.vy * dt;
      s.m.material.opacity = Math.sin(clamp01(s.life) * Math.PI);
    }
  });
  bunting.rotation.z = Math.sin(t * 0.8) * 0.01;
  stars.rotation.y = t * 0.01;
  stars.rotation.x = Math.sin(t * 0.05) * 0.05;

  updateConfetti(dt, t);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
