/* Portfolio — vanilla JS, zero dependencies. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const hexRGB = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
let mx = innerWidth / 2, my = innerHeight / 2, vw = innerWidth, vh = innerHeight;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; sizeBg(); });

/* ---------- text splitting ---------- */
function split(el, byWord) {
  const txt = el.textContent.trim(); el.setAttribute('aria-label', txt); el.textContent = '';
  let i = 0;
  const mk = (s) => { const c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i++); c.setAttribute('aria-hidden', 'true'); c.textContent = s === ' ' ? ' ' : s; return c; };
  if (byWord) txt.split(' ').forEach(w => { const o = document.createElement('span'); o.className = 'word'; o.setAttribute('aria-hidden', 'true'); const c = mk(w); c.removeAttribute('aria-hidden'); o.appendChild(c); el.appendChild(o); });
  else [...txt].forEach(ch => el.appendChild(mk(ch)));
}
$$('[data-split]').forEach(el => split(el, false));
$$('[data-split-words]').forEach(el => split(el, true));

/* ---------- background particles ---------- */
const bg = $('#bg'), bctx = bg.getContext('2d');
let BW, BH, BD = 1, P = [];
function sizeBg() {
  BD = Math.min(DPR, 1.5); BW = bg.width = Math.round(vw * BD); BH = bg.height = Math.round(vh * BD);
  const n = Math.round(clamp(vw * vh / 17000, 36, 110));
  P = Array.from({ length: n }, () => ({ x: Math.random() * BW, y: Math.random() * BH, vx: (Math.random() - .5) * .5 * BD, vy: (Math.random() - .5) * .5 * BD }));
}
sizeBg();
const fgCur = [243, 240, 232]; let fgTgt = [243, 240, 232], bgOpacity = .55;
function drawBg() {
  for (let i = 0; i < 3; i++) fgCur[i] = lerp(fgCur[i], fgTgt[i], .07);
  const col = `${fgCur.map(Math.round).join()}`;
  bctx.clearRect(0, 0, BW, BH);
  const R = 170 * BD, mxb = mx * BD, myb = my * BD;
  for (const p of P) {
    const dx = p.x - mxb, dy = p.y - myb, d = Math.hypot(dx, dy);
    if (d < R && d > 0) { const f = (1 - d / R) * 1.4; p.vx += dx / d * f * .06; p.vy += dy / d * f * .06; }
    p.vx *= .985; p.vy *= .985;
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x += BW; if (p.x > BW) p.x -= BW; if (p.y < 0) p.y += BH; if (p.y > BH) p.y -= BH;
  }
  const L = 140 * BD;
  bctx.lineWidth = 1 * BD;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    bctx.fillStyle = `rgba(${col},.8)`; bctx.fillRect(a.x - 1.2 * BD, a.y - 1.2 * BD, 2.4 * BD, 2.4 * BD);
    for (let j = i + 1; j < P.length; j++) {
      const b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < L) { bctx.strokeStyle = `rgba(${col},${(1 - d / L) * .35})`; bctx.beginPath(); bctx.moveTo(a.x, a.y); bctx.lineTo(b.x, b.y); bctx.stroke(); }
    }
  }
  bg.style.opacity = lerp(parseFloat(bg.style.opacity || .55), bgOpacity, .06);
}

/* ---------- cursor ---------- */
const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), ringTxt = $('.cursor__ring span');
let rx = mx, ry = my;
if (fine) {
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { ringTxt.textContent = t.dataset.cursor; cur.classList.add('has-label'); } else cur.classList.remove('has-label');
  });
  addEventListener('pointerdown', () => cur.classList.add('is-down'));
  addEventListener('pointerup', () => cur.classList.remove('is-down'));
}

/* ---------- magnetic elements ---------- */
const mags = $$('[data-magnet]').map(el => ({ el, x: 0, y: 0 }));

/* ---------- theme per section ---------- */
const sections = $$('section[data-bg]');
let curSec = null;
function updateTheme() {
  const mid = vh * .5; let found = null;
  for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { found = s; break; } }
  if (found && found !== curSec) {
    curSec = found;
    document.body.style.setProperty('--bg', found.dataset.bg);
    document.body.style.setProperty('--fg', found.dataset.fg);
    fgTgt = hexRGB(found.dataset.fg);
    const c = hexRGB(found.dataset.bg); bgOpacity = (c[0] + c[1] + c[2]) / 3 > 140 ? .3 : .55;
  }
}

/* ---------- scroll-linked pieces ---------- */
const prog = $('.progress i');
const heroRows = $$('.hero__title .row');
const hero = $('#hero');
const shapes = $$('.shape');
const frame = $('.reel__frame'), stage = $('.reel__stage');
const work = $('#work'), track = $('#workTrack'), workIdx = $('#workIdx');
const steps = $$('.step'), stepsBox = $('#steps'), stepsFill = $('#stepsFill');
const ease = x => 1 - Math.pow(1 - x, 3);
let scrollY = 0;

function onScroll() {
  scrollY = window.scrollY;
  const max = document.documentElement.scrollHeight - vh;
  prog.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;
  updateTheme();
  // hero drift
  if (scrollY < vh * 1.2) heroRows.forEach((r, i) => { r.style.transform = `translateX(${(i ? 1 : -1) * scrollY * .12}px)`; });
  // reel scale-up
  const sr = stage.getBoundingClientRect();
  const p = clamp((vh - sr.top) / (vh * .95)), base = vw < 700 ? 88 : 62;
  frame.style.width = lerp(base, 100, ease(p)) + '%';
  frame.style.borderRadius = lerp(32, 0, ease(p)) + 'px';
  // work horizontal scroll
  if (vw > 800) {
    const wr = work.getBoundingClientRect(), wp = clamp(-wr.top / (wr.height - vh));
    const maxX = Math.max(0, track.scrollWidth - vw);
    track.style.transform = `translate3d(${-wp * maxX}px,0,0)`;
    workIdx.textContent = String(Math.round(wp * 4) + 1).padStart(2, '0');
  } else track.style.transform = '';
  // process
  const pr = stepsBox.getBoundingClientRect();
  stepsFill.style.height = clamp((vh * .62 - pr.top) / pr.height) * 100 + '%';
  steps.forEach(s => s.classList.toggle('on', s.getBoundingClientRect().top < vh * .66));
}
addEventListener('scroll', onScroll, { passive: true });

/* ---------- card art ---------- */
const bgs = { orbit: '#0b0d06', tide: '#04141a', grid: '#1a0510', solid: '#0a0d24', type: '#f3f0e8' };
const fib = Array.from({ length: 260 }, (_, i) => { const y = 1 - i / 259 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
function rot(p, ry, rx) { const x1 = p[0] * Math.cos(ry) + p[2] * Math.sin(ry), z1 = -p[0] * Math.sin(ry) + p[2] * Math.cos(ry); return [x1, p[1] * Math.cos(rx) - z1 * Math.sin(rx), p[1] * Math.sin(rx) + z1 * Math.cos(rx)]; }
const ART = {
  orbit(g, w, h, t, hv) {
    const cx = w / 2, cy = h * .45, rs = Math.min(w, h) * .052;
    for (let i = 1; i <= 8; i++) {
      const n = 5 + i * 3, r = i * rs, sp = (i % 2 ? 1 : -1) * (.35 + i * .05) * (1 + hv * 2.5);
      g.strokeStyle = 'rgba(200,255,60,.12)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
      for (let k = 0; k < n; k++) {
        const a = t * sp + k / n * TAU, s = 3 + 5 * (.5 + .5 * Math.sin(a * 2 + t * 2));
        g.fillStyle = (i + k) % 4 === 0 ? '#ff2d87' : '#c8ff3c'; g.beginPath(); g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, s, 0, TAU); g.fill();
      }
    }
    g.fillStyle = '#c8ff3c'; g.beginPath(); g.arc(cx, cy, rs * .7 * (1 + .12 * Math.sin(t * 3)), 0, TAU); g.fill();
  },
  tide(g, w, h, t, hv) {
    const lines = 30, top = h * .12, span = h * .62;
    for (let k = 0; k < lines; k++) {
      const y0 = top + k / lines * span, amp = (30 + 40 * Math.sin(k * .21 + t * .6) ** 2) * (1 + hv * .5);
      g.beginPath();
      for (let x = 0; x <= w + 8; x += 8) {
        const env = Math.exp(-Math.pow((x - w / 2) / (w * .28), 2));
        const y = y0 - env * amp * (Math.sin(x * .03 + t * 1.6 + k * .25) * .6 + Math.sin(x * .07 - t * 1.1) * .4);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fillStyle = '#04141a'; g.fill();
      g.strokeStyle = `rgba(45,226,230,${.35 + .65 * k / lines})`; g.lineWidth = 1.6; g.stroke();
    }
  },
  grid(g, w, h, t, hv) {
    const cols = 9, s = w / cols, rows = Math.ceil(h / s);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = c * s + s / 2, cy = r * s + s / 2, d = Math.hypot(cx - w / 2, cy - h * .4), ph = d * .011 - t * (2.2 + hv * 2.5), m = .5 + .5 * Math.sin(ph);
      const size = s * (.25 + .6 * (.5 + .5 * Math.sin(ph + 1.4)));
      g.save(); g.translate(cx, cy); g.rotate(m * 1.5708); g.fillStyle = (c + r) % 3 === 0 ? '#f3f0e8' : (c + r) % 3 === 1 ? '#ff2d87' : '#c8ff3c';
      g.beginPath(); g.roundRect(-size / 2, -size / 2, size, size, size * (.5 - .46 * m)); g.fill(); g.restore();
    }
  },
  solid(g, w, h, t, hv) {
    const cx = w / 2, cy = h * .44, S = Math.min(w, h) * .27, ry = t * (.7 + hv), rx = .5 + Math.sin(t * .6) * .3;
    const proj = p => { const q = rot(p, ry, rx), f = 4 / (4 - q[2]); return [cx + q[0] * S * f, cy + q[1] * S * f, q[2], f]; };
    fib.forEach(p => { const q = proj(p); g.fillStyle = `rgba(${q[2] > 0 ? '45,226,230' : '59,92,255'},${.35 + .5 * (q[2] + 1) / 2})`; g.fillRect(q[0] - 1.6 * q[3], q[1] - 1.6 * q[3], 3.2 * q[3], 3.2 * q[3]); });
    const V = []; for (let i = 0; i < 8; i++) V.push(proj([(i & 1 ? 1 : -1) * 1.5, (i & 2 ? 1 : -1) * 1.5, (i & 4 ? 1 : -1) * 1.5].map(v => v * .75)));
    g.strokeStyle = 'rgba(243,240,232,.75)'; g.lineWidth = 1.8;
    [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => { g.beginPath(); g.moveTo(V[a][0], V[a][1]); g.lineTo(V[b][0], V[b][1]); g.stroke(); });
    V.forEach(v => { g.fillStyle = '#c8ff3c'; g.fillRect(v[0] - 4, v[1] - 4, 8, 8); });
  },
  type(g, w, h, t, hv) {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const size = Math.min(w, h) * .95;
    g.font = `400 ${size}px Anton, sans-serif`;
    for (let k = 7; k >= 1; k--) {
      g.save(); g.translate(w / 2, h * .46); g.rotate(Math.sin(t * .8 + k * .15) * .08 * (1 + hv)); const s = 1 + k * .05 * (.6 + .4 * Math.sin(t * 1.4)); g.scale(s, s);
      g.lineWidth = 2; g.strokeStyle = `rgba(11,11,16,${.55 / k})`; g.strokeText('K', 0, size * .06); g.restore();
    }
    g.save(); g.translate(w / 2, h * .46); g.rotate(Math.sin(t * .8) * .08 * (1 + hv));
    g.fillStyle = '#ff2d87'; g.fillText('K', 10, size * .06 + 10); g.fillStyle = '#0b0b10'; g.fillText('K', 0, size * .06); g.restore();
  },
};
const cards = $$('.card').map(el => {
  const cv = $('canvas', el), g = cv.getContext('2d'), kind = el.dataset.art, o = { el, cv, g, kind, vis: false, hv: 0, hov: false, w: 0, h: 0 };
  el.addEventListener('pointerenter', () => o.hov = true); el.addEventListener('pointerleave', () => o.hov = false);
  return o;
});
function sizeCards() { cards.forEach(o => { const r = o.el.getBoundingClientRect(); o.w = o.cv.width = Math.round(o.el.offsetWidth * DPR); o.h = o.cv.height = Math.round(o.el.offsetHeight * DPR); }); }
const io = new IntersectionObserver(es => es.forEach(e => { const o = cards.find(c => c.el === e.target); if (o) o.vis = e.isIntersecting; }), { rootMargin: '0px 200px' });
cards.forEach(o => io.observe(o.el));
addEventListener('resize', sizeCards);
function drawCards(t) {
  cards.forEach(o => {
    if (!o.vis) return;
    o.hv = lerp(o.hv, o.hov ? 1 : 0, .08);
    const g = o.g; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const w = o.w / DPR, h = o.h / DPR;
    g.fillStyle = bgs[o.kind]; g.fillRect(0, 0, w, h);
    ART[o.kind](g, w, h, t, o.hv);
  });
}

/* ---------- lab ---------- */
function fit(cv) { const r = cv.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height)); if (cv._w !== w || cv._h !== h) { cv._w = w; cv._h = h; cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); } const g = cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); return [g, w, h]; }
// A: easing
const EASES = {
  linear: x => x,
  'in-out': x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  expo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  back: x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  elastic: x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1,
  bounce: x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; },
};
let easeKey = 'elastic';
const chips = $('#easeChips');
Object.keys(EASES).forEach(k => { const b = document.createElement('button'); b.textContent = k; b.className = k === easeKey ? 'on' : ''; b.onclick = () => { easeKey = k; $$('button', chips).forEach(x => x.classList.toggle('on', x === b)); }; chips.appendChild(b); });
const easeCv = $('#easeCanvas');
function drawEase(t) {
  const [g, w, h] = fit(easeCv); g.clearRect(0, 0, w, h);
  const f = EASES[easeKey], u = clamp((t % 2.6) / 1.8), e = f(u);
  const gx = 26, gy = 14, gw = Math.min(w - 52, (h - 90) * 1.5), gh = h - 90 - gy, ox = (w - gw) / 2;
  g.strokeStyle = 'rgba(243,240,232,.18)'; g.lineWidth = 1; g.strokeRect(ox, gy + 20, gw, gh - 20);
  g.beginPath(); const y0 = gy + 20 + (gh - 20) * (1 - 0), y1 = gy + 20 + (gh - 20) * .2;
  const mapY = v => gy + 20 + (gh - 20) * (1 - (v * .8 + .0)) - (gh - 20) * .0 + (gh - 20) * .0;
  for (let i = 0; i <= 120; i++) { const x = i / 120, v = f(x); const px = ox + x * gw, py = (gy + gh) - v * (gh - 20) * .8 - 6; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.strokeStyle = '#c8ff3c'; g.lineWidth = 3; g.stroke();
  const dx = ox + u * gw, dy = (gy + gh) - e * (gh - 20) * .8 - 6;
  g.strokeStyle = 'rgba(200,255,60,.3)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(dx, gy + gh); g.lineTo(dx, dy); g.lineTo(ox, dy); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#ff2d87'; g.beginPath(); g.arc(dx, dy, 9, 0, TAU); g.fill();
  const ty = h - 34; g.fillStyle = 'rgba(243,240,232,.12)'; g.beginPath(); g.roundRect(26, ty - 4, w - 52, 8, 4); g.fill();
  g.fillStyle = '#f3f0e8'; g.beginPath(); g.arc(26 + 14 + e * (w - 52 - 28), ty, 14, 0, TAU); g.fill();
}
// B: spring
const spCv = $('#springCanvas'); const sp = { x: 0, y: 0, vx: 0, vy: 0, drag: false, trail: [], init: false };
spCv.addEventListener('pointerdown', e => { sp.drag = true; spCv.setPointerCapture(e.pointerId); spMove(e); });
spCv.addEventListener('pointermove', e => { if (sp.drag) spMove(e); });
['pointerup', 'pointercancel'].forEach(n => spCv.addEventListener(n, () => sp.drag = false));
function spMove(e) { const r = spCv.getBoundingClientRect(); sp.x = e.clientX - r.left; sp.y = e.clientY - r.top; sp.vx = sp.vy = 0; }
function drawSpring(t, dt) {
  const [g, w, h] = fit(spCv); const cx = w / 2, cy = h / 2;
  if (!sp.init) { sp.x = cx; sp.y = cy; sp.init = true; }
  if (!sp.drag) { const k = 160, c = 7; for (let i = 0; i < 4; i++) { const s = dt / 4; sp.vx += (-k * (sp.x - cx) - c * sp.vx) * s; sp.vy += (-k * (sp.y - cy) - c * sp.vy) * s; sp.x += sp.vx * s; sp.y += sp.vy * s; } }
  g.clearRect(0, 0, w, h);
  [60, 110, 160].forEach((r, i) => { g.strokeStyle = `rgba(243,240,232,${.1 - i * .025})`; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); });
  sp.trail.push([sp.x, sp.y]); if (sp.trail.length > 24) sp.trail.shift();
  sp.trail.forEach((p, i) => { g.fillStyle = `rgba(255,45,135,${i / sp.trail.length * .35})`; g.beginPath(); g.arc(p[0], p[1], 38 * i / sp.trail.length, 0, TAU); g.fill(); });
  const dx = sp.x - cx, dy = sp.y - cy, dist = Math.hypot(dx, dy);
  g.strokeStyle = '#c8ff3c'; g.lineWidth = Math.max(1, 6 - dist / 40); g.beginPath(); g.moveTo(cx, cy);
  const seg = 14; for (let i = 1; i <= seg; i++) { const u = i / seg, nx = -dy / (dist || 1), ny = dx / (dist || 1), wob = Math.sin(u * 30 - t * 20) * Math.min(10, dist * .05) * Math.sin(u * Math.PI); g.lineTo(cx + dx * u + nx * wob, cy + dy * u + ny * wob); } g.stroke();
  const speed = Math.hypot(sp.vx, sp.vy), sq = clamp(speed / 1800, 0, .4), ang = Math.atan2(sp.vy, sp.vx);
  g.save(); g.translate(sp.x, sp.y); g.rotate(ang); g.scale(1 + sq, 1 - sq * .8); g.fillStyle = '#ff2d87'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill(); g.restore();
  g.fillStyle = '#f3f0e8'; g.beginPath(); g.arc(cx, cy, 5, 0, TAU); g.fill();
}
// C: magnetic field
const fCv = $('#fieldCanvas'); const fp = { x: -999, y: -999, in: false };
fCv.addEventListener('pointermove', e => { const r = fCv.getBoundingClientRect(); fp.x = e.clientX - r.left; fp.y = e.clientY - r.top; fp.in = true; });
fCv.addEventListener('pointerleave', () => fp.in = false);
function drawField(t) {
  const [g, w, h] = fit(fCv); g.clearRect(0, 0, w, h);
  const gap = 30, cols = Math.floor(w / gap), rows = Math.floor(h / gap), ox = (w - (cols - 1) * gap) / 2, oy = (h - (rows - 1) * gap) / 2;
  const px = fp.in ? fp.x : w / 2 + Math.cos(t * .9) * w * .3, py = fp.in ? fp.y : h / 2 + Math.sin(t * 1.3) * h * .3;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * gap, y = oy + r * gap, dx = x - px, dy = y - py, d = Math.hypot(dx, dy), R = 150, k = clamp(1 - d / R), push = k * k * 34;
    const X = x + (dx / (d || 1)) * push, Y = y + (dy / (d || 1)) * push, s = 2 + k * 9;
    g.fillStyle = k > .02 ? `rgb(${Math.round(lerp(243, 200, k))},${Math.round(lerp(240, 255, k))},${Math.round(lerp(232, 60, k))})` : 'rgba(243,240,232,.45)';
    g.beginPath(); g.arc(X, Y, s / 2, 0, TAU); g.fill();
  }
}
// D: tilt
const tilt = $('#tilt'), tileTilt = $('.tile--tilt'); const tl = { rx: 0, ry: 0, tx: 0, ty: 0, hover: false, gx: 50, gy: 50 };
tileTilt.addEventListener('pointermove', e => { const r = tilt.getBoundingClientRect(); tl.tx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); tl.ty = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1); tl.hover = true; });
tileTilt.addEventListener('pointerleave', () => tl.hover = false);
const tLayers = $$('.tilt__layer', tilt).concat($('.tilt__glare', tilt)); const tZ = [0, 60, 120, 10];
function drawTilt(t) {
  if (!tl.hover) { tl.tx = Math.sin(t * .8) * .6; tl.ty = Math.cos(t * .6) * .5; }
  tl.rx = lerp(tl.rx, -tl.ty * 20, .1); tl.ry = lerp(tl.ry, tl.tx * 26, .1);
  tilt.style.transform = `rotateX(${tl.rx}deg) rotateY(${tl.ry}deg)`;
  tLayers.forEach((el, i) => { el.style.transform = `translate(-50%,-50%) translateZ(${tZ[i]}px) translate(${tl.tx * i * 6}px,${tl.ty * i * 6}px)`; });
  const gl = tLayers[3]; gl.style.setProperty('--gx', (50 + tl.tx * 40) + '%'); gl.style.setProperty('--gy', (50 + tl.ty * 40) + '%');
}

/* ---------- reveals, counters, video ---------- */
function startReveals() {
  $$('.eyebrow,.skill,.tile,.stats>div,.contact__row,.foot').forEach((el, i, arr) => { el.classList.add('fade'); el.style.setProperty('--d', (i % 4) * .08 + 's'); });
  const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); if (e.target.matches('.stats>div')) count(e.target.querySelector('b')); } }), { threshold: .2, rootMargin: '0px 0px -6% 0px' });
  $$('.fade,[data-split-words],.contact__title,.hero ~ section .reveal-line').forEach(el => ro.observe(el));
}
function count(b) {
  const to = +b.dataset.count, t0 = performance.now(), d = 1600;
  const step = n => { const p = clamp((n - t0) / d); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const vid = $('#reelVideo'), soundPill = $('#soundPill');
new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }), { threshold: .25 }).observe(vid);
$('.reel__frame').addEventListener('click', () => { vid.muted = !vid.muted; soundPill.textContent = vid.muted ? 'Click for sound' : 'Sound on ♪'; vid.play().catch(() => {}); });

/* contact */
const toast = $('#toast'), mail = $('#mailBtn');
mail.addEventListener('click', async () => {
  const em = 'pavlo.tsyhanash@gmail.com';
  try { await navigator.clipboard.writeText(em); } catch (_) { const ta = document.createElement('textarea'); ta.value = em; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800);
});

/* ---------- main loop ---------- */
let last = performance.now();
function tick(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  drawBg();
  if (fine) {
    rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18);
    dot.style.transform = `translate(${mx}px,${my}px)`; ring.style.transform = `translate(${rx}px,${ry}px)`;
    mags.forEach(m => {
      const r = m.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy), R = Math.max(r.width, r.height) * .8 + 40;
      const tx = d < R ? dx * .28 : 0, ty = d < R ? dy * .28 : 0; m.x = lerp(m.x, tx, .15); m.y = lerp(m.y, ty, .15);
      m.el.style.transform = `translate(${m.x.toFixed(2)}px,${m.y.toFixed(2)}px)`;
    });
  }
  if (scrollY < vh * 1.2) {
    shapes.forEach(s => { const k = +s.dataset.depth / 800; s.style.transform = `translate(${(mx - vw / 2) * k}px,${(my - vh / 2) * k}px)`; });
    if (fine && hero.classList.contains('live')) $$('.hero__title .ch').forEach(c => {
      const r = c.getBoundingClientRect(), dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2), d = Math.hypot(dx, dy), k = clamp(1 - d / 260);
      c.style.transform = k > .01 ? `translateY(${-k * 22}px) scaleY(${1 + k * .12}) skewX(${dx / 260 * -k * 10}deg)` : '';
    });
  }
  drawCards(t); drawEase(t); drawSpring(t, dt); drawField(t); drawTilt(t);
  requestAnimationFrame(tick);
}

/* ---------- loader ---------- */
const num = $('#loadNum'), quick = location.search.includes('noload');
function finishLoad() {
  document.body.classList.add('loaded');
  setTimeout(() => {
    document.body.classList.remove('is-loading'); document.body.classList.add('done');
    hero.classList.add('in'); $$('.hero .reveal-line').forEach(el => el.classList.add('in'));
    startReveals(); onScroll();
    setTimeout(() => hero.classList.add('live'), 1800);
  }, quick ? 50 : 1000);
}
function runLoader() {
  const dur = quick ? 1 : 1700, t0 = performance.now();
  const step = n => { const p = clamp((n - t0) / dur); num.textContent = Math.round(100 * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else finishLoad(); };
  requestAnimationFrame(step);
}
sizeCards(); onScroll(); requestAnimationFrame(tick);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { sizeCards(); runLoader(); });
setTimeout(() => { if (!document.body.classList.contains('loaded')) finishLoad(); }, 6000);
})();
