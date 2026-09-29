/* 15s motion-graphics showreel. Fully deterministic: renderFrame(t) draws frame at time t (seconds).
   Open index.html to preview in a loop; render.mjs captures frames -> MP4. */
const W = 1920, H = 1080, DUR = 15, FPS = 30;
const C = { bg: '#08080c', lime: '#c8ff3c', mag: '#ff2d87', blue: '#3b5cff', cream: '#f3f0e8', ink: '#0b0b10', cyan: '#2de2e6' };
const CFG = { name1: 'PAVLO', name2: 'TSYHANASH', email: 'pavlo.tsyhanash@gmail.com', roles: 'MOTION / UI / BRAND / 3D' };

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const scC = mk(), sg = scC.getContext('2d');
const tmC = mk(), tg = tmC.getContext('2d');

/* ---------- math / easing ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (t, a, b) => clamp((t - a) / (b - a));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const E = {
  out3: x => 1 - Math.pow(1 - x, 3),
  in3: x => x * x * x,
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  back: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  elastic: x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1,
};
const hexRGB = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join()})`; };
const rgba = (c, a) => { const [r, g, b] = hexRGB(c); return `rgba(${r},${g},${b},${a})`; };
const TAU = Math.PI * 2;

/* ---------- timeline ---------- */
const CUTS = [0, 2, 4.5, 7, 9.5, 12, 15];
const HITS = [[0, 1], [.5, 1], [1, 1.2], [1.5, .5], [2, 1.4], [4.5, 1.4], [7, 1.4], [9.5, 1.4], [12, 1.5], [12.6, 1.1], [13.1, .5]];
const imp = t => { let s = 0; for (const [h, w] of HITS) if (t >= h) s += w * Math.exp(-(t - h) * 8); return Math.min(s, 1.6); };
const sceneIdx = t => { for (let i = 0; i < 6; i++) if (t < CUTS[i + 1]) return i; return 5; };

/* ---------- drawing helpers ---------- */
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
function font(g, fam, size, ls = 0, wt = '') { g.font = `${wt} ${size}px ${fam}`; g.letterSpacing = ls + 'px'; }
function letters(g, txt, cx, size, ls, cb) {
  font(g, 'Anton', size, 0);
  const chars = [...txt], ws = chars.map(c => g.measureText(c).width + ls);
  const tot = ws.reduce((a, b) => a + b, 0) - ls; let x = cx - tot / 2;
  chars.forEach((ch, i) => { cb(ch, i, x, ws[i] - ls); x += ws[i]; });
  return tot;
}
function fitSize(g, txt, fam, maxW, start, wt = '') { font(g, fam, start, 0, wt); const w = g.measureText(txt).width; return w > maxW ? start * maxW / w : start; }

/* speed lines shooting from the centre */
function speedLines(g, s, color, n = 70, alpha = .18) {
  g.save(); g.translate(W / 2, H / 2); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = hash(i) * TAU, sp = 700 + hash(i + 9) * 1600, r = (s * sp + hash(i + 3) * 1800) % 1800, len = 80 + hash(i + 5) * 380;
    g.strokeStyle = rgba(color, alpha * (.4 + hash(i + 1) * .6)); g.lineWidth = 2 + hash(i + 7) * 3;
    g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(Math.cos(a) * (r + len), Math.sin(a) * (r + len)); g.stroke();
  }
  g.restore();
}

/* ================= SCENE 0 : KINETIC TYPE (0-2s) ================= */
function scene0(g, s) {
  const limePhase = s >= .5 && s < 1.0;
  g.fillStyle = limePhase ? C.lime : C.bg; g.fillRect(0, 0, W, H);
  if (!limePhase) {
    // pulsing rings on the beat
    for (let k = 0; k < 4; k++) {
      const ph = ((s * 2 + k * .25) % 1);
      g.strokeStyle = rgba(C.lime, .16 * (1 - ph)); g.lineWidth = 3;
      g.beginPath(); g.arc(W / 2, H / 2, 80 + ph * 900, 0, TAU); g.stroke();
    }
    speedLines(g, s, C.lime, 70, .2);
  } else {
    g.fillStyle = C.ink;
    for (let i = 0; i < 9; i++) { const y = 120 + (i * 140 + s * 900) % (H - 240); g.fillRect(0, y, W * (.15 + .1 * hash(i)), 6); g.fillRect(W - W * (.15 + .1 * hash(i + 4)), H - y, W * .2, 6); }
  }

  g.textBaseline = 'middle'; g.textAlign = 'left';
  if (s < .5) {                                   // "PIXELS"
    const p = E.outExpo(pr(s, 0, .22)), sc = lerp(2.8, 1, p) + s * .12, size = 470 * sc;
    g.save(); g.translate(W / 2, H / 2 + 10 + size * .17); g.globalAlpha = clamp(s / .04);
    letters(g, 'PIXELS', 0, size, 6 * sc, (ch, i, x) => {
      g.fillStyle = C.mag; g.fillText(ch, x + 14, 12); g.fillStyle = C.cyan; g.fillText(ch, x - 14, -12);
      g.fillStyle = C.cream; g.fillText(ch, x, 0);
    });
    g.restore();
  } else if (limePhase) {                         // "IN"
    const ls = s - .5, p = E.outExpo(pr(ls, 0, .2)), sc = lerp(2.2, 1, p) + ls * .1;
    g.save(); g.translate(W / 2, H / 2 + 115 * sc); g.rotate((1 - p) * -.08);
    letters(g, 'IN', 0, 780 * sc, 20, (ch, i, x) => { g.fillStyle = C.ink; g.fillText(ch, x, 0); });
    g.restore();
    g.fillStyle = C.ink; font(g, 'JB', 26, 6, '800'); g.fillText('( 01 )', 120, 170); font(g, 'JB', 22, 4, '800'); g.fillText('DESIGN THAT MOVES', 120, H - 170);
  } else {                                        // "MOTION"
    const ls = s - 1.0, size = 470;
    g.save(); g.translate(W / 2, H / 2 - 20 + size * .17);
    const zoom = 1 + ls * .05; g.scale(zoom, zoom);
    const grow = E.outExpo(pr(ls, .22, .75));
    for (let k = 6; k >= 1; k--) {                // outline echoes
      g.save(); const sc = 1 + k * .075 * grow; g.scale(sc, sc);
      g.lineWidth = 3; g.strokeStyle = rgba(k % 2 ? C.lime : C.cream, .55 / (1 + k * .5)); g.globalAlpha = grow;
      letters(g, 'MOTION', 0, size, 6, (ch, i, x) => { g.strokeText(ch, x, 0); });
      g.restore();
    }
    letters(g, 'MOTION', 0, size, 6, (ch, i, x, w) => {
      const p = pr(ls, i * .045, i * .045 + .34), e = E.back(p); if (p <= 0) return;
      g.save(); g.translate(x + w / 2, (1 - e) * -520); g.rotate((1 - e) * (i % 2 ? .5 : -.5)); g.scale(e, e); g.globalAlpha = clamp(p * 3);
      g.fillStyle = C.mag; g.fillText(ch, -w / 2 + 12, 10); g.fillStyle = C.cyan; g.fillText(ch, -w / 2 - 12, -10);
      g.fillStyle = C.cream; g.fillText(ch, -w / 2, 0); g.restore();
    });
    g.restore();
    const p2 = E.outExpo(pr(ls, .6, .95));
    g.fillStyle = C.lime; g.fillRect(W / 2 - 500 * p2, 850, 1000 * p2, 6);
    g.fillStyle = C.cream; g.globalAlpha = p2; font(g, 'JB', 30, 12, '800'); g.textAlign = 'center';
    g.fillText('SHOWREEL  /  2026', W / 2, 900); g.globalAlpha = 1;
  }
}

/* ================= SCENE 1 : SHAPE SYSTEMS (2-4.5s) ================= */
function scene1(g, s) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const cols = 16, rows = 7, cs = 120, y0 = 120, cs3 = [C.lime, C.mag, C.blue, C.cream];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = c * cs + cs / 2, cy = y0 + r * cs + cs / 2, dx = cx - W / 2, dy = cy - H / 2, d = Math.hypot(dx, dy);
    const intro = E.back(pr(s, d * .00045, d * .00045 + .45)); if (intro <= 0) continue;
    const ph = d * .0062 - s * 4.4, m = .5 + .5 * Math.sin(ph);
    const size = lerp(26, 106, .5 + .5 * Math.sin(ph + 1.4)) * intro;
    const rot = m * Math.PI / 2 + s * .5 * (c % 2 ? 1 : -1) * .3;
    const ci = ((Math.floor(d * .012 - s * 2.4) % 4) + 4) % 4;
    g.save(); g.translate(cx, cy); g.rotate(rot);
    g.fillStyle = cs3[ci];
    rr(g, -size / 2, -size / 2, size, size, lerp(size * .5, 6, m)); g.fill();
    if (m > .82) { g.fillStyle = C.bg; g.beginPath(); g.arc(0, 0, size * .16, 0, TAU); g.fill(); }
    g.restore();
  }
  // big ring + text with difference blend
  const rp = E.outExpo(pr(s, .3, 1.1));
  g.save(); g.translate(W / 2, H / 2); g.rotate(s * .8);
  g.strokeStyle = C.cream; g.lineWidth = 10; g.setLineDash([60, 40]);
  g.beginPath(); g.arc(0, 0, 420 * rp, 0, TAU); g.stroke(); g.restore();
  g.save(); g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.textBaseline = 'middle';
  const tp = pr(s, .35, 1.0);
  letters(g, 'SYSTEMS', W / 2, 330, 8, (ch, i, x, w) => {
    const p = E.back(pr(s, .35 + i * .05, .8 + i * .05)); if (p <= 0) return;
    const y = H / 2 + 56 + Math.sin(s * 5 + i * .7) * 22 * E.outExpo(tp) + (1 - p) * 260;
    g.save(); g.translate(x + w / 2, y); g.scale(1, p); g.fillText(ch, -w / 2, 0); g.restore();
  });
  g.restore();
}

/* ================= SCENE 2 : UI + DATA (4.5-7s) ================= */
function card(g, s, delay, x, y, w, h, fill, draw) {
  const p = E.back(pr(s, delay, delay + .5)); if (p <= 0) return;
  g.save(); g.translate(x + w / 2, y + h / 2 + (1 - p) * 260); g.rotate((1 - p) * .12); g.scale(lerp(.85, 1, p), lerp(.85, 1, p)); g.globalAlpha = clamp(p * 2);
  g.shadowColor = 'rgba(11,11,16,.28)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
  g.fillStyle = fill; rr(g, -w / 2, -h / 2, w, h, 36); g.fill(); g.shadowColor = 'transparent';
  g.save(); rr(g, -w / 2, -h / 2, w, h, 36); g.clip(); g.translate(-w / 2, -h / 2); draw(g, w, h); g.restore();
  g.restore();
}
const SERIES = Array.from({ length: 24 }, (_, i) => Math.pow(i / 23, 1.7) * .78 + .14 + (hash(i * 3.3) - .5) * .12);
const BARS = Array.from({ length: 14 }, (_, i) => .28 + .6 * Math.pow((i + 1) / 14, 1.2) * (.8 + .2 * hash(i * 5.1)));
function scene2(g, s) {
  g.fillStyle = C.cream; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(11,11,16,.14)';
  for (let y = 60; y < H; y += 60) for (let x = 60; x < W; x += 60) g.fillRect(x - 1.5, y - 1.5, 3, 3);
  g.save(); g.fillStyle = C.lime; g.beginPath(); g.arc(1500 - s * 40, 200, 320 * E.outExpo(pr(s, 0, .7)), 0, TAU); g.fill(); g.restore();

  // A: hero number + sparkline
  card(g, s, 0, 120, 140, 640, 840, C.ink, (g, w, h) => {
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = C.lime; font(g, 'JB', 26, 6, '800'); g.fillText('GROWTH / YOY', 50, 80);
    const v = Math.round(312 * E.outExpo(pr(s, .5, 1.9))), txt = '+' + v + '%';
    const sz = Math.min(250, fitSize(g, '+312%', 'Anton', w - 100, 250)); font(g, 'Anton', sz, 0);
    g.fillStyle = C.cream; g.fillText(txt, 46, 120 + sz * .95);
    g.fillStyle = rgba(C.cream, .55); font(g, 'SG', 28, 0, '500'); g.fillText('Engagement after the redesign', 50, 120 + sz * .95 + 56);
    // chart
    const cx0 = 50, cy0 = 470, cw = w - 100, ch = 310, n = SERIES.length - 1, vis = pr(s, .8, 2.0) * n;
    g.strokeStyle = 'rgba(243,240,232,.12)'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(cx0, cy0 + ch * i / 4); g.lineTo(cx0 + cw, cy0 + ch * i / 4); g.stroke(); }
    const pts = SERIES.map((v, i) => [cx0 + cw * i / n, cy0 + ch - ch * v]);
    const cut = Math.floor(vis), fr = vis - cut;
    const path = new Path2D(); path.moveTo(...pts[0]);
    for (let i = 1; i <= cut; i++) path.lineTo(...pts[i]);
    let last = pts[cut];
    if (cut < n) { last = [lerp(pts[cut][0], pts[cut + 1][0], fr), lerp(pts[cut][1], pts[cut + 1][1], fr)]; path.lineTo(...last); }
    const area = new Path2D(path); area.lineTo(last[0], cy0 + ch); area.lineTo(cx0, cy0 + ch); area.closePath();
    const gr = g.createLinearGradient(0, cy0, 0, cy0 + ch); gr.addColorStop(0, rgba(C.lime, .35)); gr.addColorStop(1, rgba(C.lime, 0));
    g.fillStyle = gr; g.fill(area);
    g.strokeStyle = C.lime; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(path);
    const pulse = 1 + .35 * Math.sin(s * 12);
    g.fillStyle = rgba(C.lime, .25); g.beginPath(); g.arc(last[0], last[1], 26 * pulse, 0, TAU); g.fill();
    g.fillStyle = C.lime; g.beginPath(); g.arc(last[0], last[1], 11, 0, TAU); g.fill();
  });

  // B: bar chart
  card(g, s, .12, 800, 140, 1000, 400, '#ffffff', (g, w, h) => {
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = C.ink; font(g, 'JB', 26, 6, '800'); g.fillText('REVENUE / MONTH', 50, 80);
    g.fillStyle = rgba(C.ink, .45); font(g, 'JB', 22, 2, '500'); g.textAlign = 'right'; g.fillText('$ 1.24M', w - 50, 80); g.textAlign = 'left';
    const bw = 44, gap = (w - 100 - bw * 14) / 13, base = h - 50, maxH = 220;
    BARS.forEach((v, i) => {
      const p = E.elastic(pr(s, .6 + i * .045, 1.15 + i * .045)), bh = maxH * v * p;
      g.fillStyle = i === 13 ? C.mag : (i > 9 ? C.blue : C.ink);
      rr(g, 50 + i * (bw + gap), base - bh, bw, Math.max(bh, 0), 12); g.fill();
    });
  });

  // C: gauge
  card(g, s, .24, 800, 580, 480, 400, C.blue, (g, w, h) => {
    const cx = w / 2, cy = h / 2 + 30, R = 120, v = .87 * E.outExpo(pr(s, .9, 2.0));
    g.textBaseline = 'alphabetic'; g.fillStyle = C.cream; font(g, 'JB', 24, 6, '800'); g.textAlign = 'left'; g.fillText('CONVERSION', 40, 62);
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI * .75 + i / 40 * Math.PI * 1.5, lit = i / 40 <= v;
      g.strokeStyle = lit ? C.lime : 'rgba(243,240,232,.22)'; g.lineWidth = lit ? 5 : 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx + Math.cos(a) * (R + 26), cy + Math.sin(a) * (R + 26)); g.lineTo(cx + Math.cos(a) * (R + 44), cy + Math.sin(a) * (R + 44)); g.stroke();
    }
    g.strokeStyle = 'rgba(243,240,232,.2)'; g.lineWidth = 22; g.beginPath(); g.arc(cx, cy, R, Math.PI * .75, Math.PI * 2.25); g.stroke();
    g.strokeStyle = C.cream; g.beginPath(); g.arc(cx, cy, R, Math.PI * .75, Math.PI * (.75 + 1.5 * v)); g.stroke();
    g.fillStyle = C.cream; g.textAlign = 'center'; font(g, 'Anton', 120, 0); g.fillText(Math.round(v * 100), cx - 8, cy + 44);
    font(g, 'Anton', 42, 0); g.fillText('%', cx + 78, cy + 8);
  });

  // D: toggles + button
  card(g, s, .36, 1320, 580, 480, 400, C.mag, (g, w, h) => {
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = C.ink; font(g, 'JB', 24, 6, '800'); g.fillText('SETTINGS', 40, 62);
    const rows = [['Dark mode', 1.1], ['Haptics', 1.32], ['Autopilot', 1.54]];
    rows.forEach(([lab, t0], i) => {
      const y = 100 + i * 64, p = E.inOut(pr(s, t0, t0 + .22));
      g.fillStyle = C.ink; font(g, 'SG', 28, 0, '700'); g.fillText(lab, 40, y + 38);
      g.fillStyle = mix('#7a1240', C.lime, p); rr(g, w - 40 - 84, y + 8, 84, 44, 22); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(w - 40 - 84 + 22 + p * 40, y + 30, 17, 0, TAU); g.fill();
    });
    // button
    const bp = pr(s, 1.9, 2.05), press = Math.sin(bp * Math.PI), bx = 40, by = h - 110, bw = w - 80, bh = 74;
    g.save(); g.translate(bx + bw / 2, by + bh / 2); g.scale(1 - .05 * press, 1 - .05 * press);
    g.fillStyle = C.ink; rr(g, -bw / 2, -bh / 2, bw, bh, 37); g.fill();
    g.save(); rr(g, -bw / 2, -bh / 2, bw, bh, 37); g.clip();
    const rp = pr(s, 1.95, 2.4); g.fillStyle = rgba(C.lime, .5 * (1 - rp)); g.beginPath(); g.arc(60, 0, rp * 420, 0, TAU); g.fill(); g.restore();
    g.fillStyle = C.cream; g.textAlign = 'center'; font(g, 'JB', 26, 6, '800'); g.fillText('SHIP IT  →', 0, 9); g.restore();
  });
}

/* ================= SCENE 3 : REAL-TIME 3D (7-9.5s) ================= */
let KNOT = null;
function buildKnot() {
  const P = u => { const r = Math.cos(3 * u) + 2; return [r * Math.cos(2 * u), r * Math.sin(2 * u), -Math.sin(3 * u)]; };
  const nrm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const N = 900, out = [];
  for (let i = 0; i < N; i++) {
    const u = i / N * TAU, p = P(u), q = P(u + .001);
    const T = nrm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]);
    let Nn = cross(T, [0, 0, 1]); if (Math.hypot(...Nn) < .2) Nn = cross(T, [0, 1, 0]); Nn = nrm(Nn);
    const B = cross(T, Nn);
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * TAU + i * .7, r = .34 + hash(i * 7 + k) * .04;
      out.push([p[0] + r * (Math.cos(a) * Nn[0] + Math.sin(a) * B[0]), p[1] + r * (Math.cos(a) * Nn[1] + Math.sin(a) * B[1]), p[2] + r * (Math.cos(a) * Nn[2] + Math.sin(a) * B[2]), i / N]);
    }
  }
  return out;
}
function rot3(p, ry, rx) {
  const x1 = p[0] * Math.cos(ry) + p[2] * Math.sin(ry), z1 = -p[0] * Math.sin(ry) + p[2] * Math.cos(ry);
  return [x1, p[1] * Math.cos(rx) - z1 * Math.sin(rx), p[1] * Math.sin(rx) + z1 * Math.cos(rx)];
}
function scene3(g, s) {
  if (!KNOT) KNOT = buildKnot();
  const bgG = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200); bgG.addColorStop(0, '#16205a'); bgG.addColorStop(1, '#05060f');
  g.fillStyle = bgG; g.fillRect(0, 0, W, H);
  // retro floor
  g.save(); g.strokeStyle = rgba(C.cyan, .35); g.lineWidth = 2; const hor = 700;
  for (let i = 0; i < 18; i++) { const z = ((i + s * 3) % 18) / 18, y = hor + (H - hor) * z * z; g.globalAlpha = z * .8; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.globalAlpha = .35;
  for (let j = -22; j <= 22; j++) { g.beginPath(); g.moveTo(W / 2 + j * 36, hor); g.lineTo(W / 2 + j * 420, H); g.stroke(); }
  g.restore();
  // giant outline word
  g.save(); g.textBaseline = 'middle'; g.textAlign = 'center'; font(g, 'Anton', 640, 10);
  g.strokeStyle = rgba(C.cream, .16); g.lineWidth = 3; g.strokeText('DEPTH', W / 2 - s * 70 + 60, H / 2 + 110); g.restore();

  const e = E.outExpo(pr(s, 0, .9)), S = lerp(40, 150, e);
  const ry = .6 + s * 1.5 + 3.2 * (1 - e), rx = .5 + Math.sin(s * .9) * .35 + .4 * (1 - e);
  // rings
  g.save(); g.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = rgba(k === 1 ? C.mag : C.cream, .35); g.beginPath();
    for (let i = 0; i <= 96; i++) {
      const a = i / 96 * TAU, p0 = [Math.cos(a) * 3.9, 0, Math.sin(a) * 3.9];
      const q = rot3(rot3(p0, k * 1.05, k * .8 + s * .6 * (k + 1)), -ry * .3, rx * .5), f = 9 / (9 - q[2]);
      const X = W / 2 + q[0] * S * f, Y = H / 2 + q[1] * S * f; i ? g.lineTo(X, Y) : g.moveTo(X, Y);
    }
    g.stroke();
    const a = s * (2 + k) + k * 2, p0 = [Math.cos(a) * 3.9, 0, Math.sin(a) * 3.9], q = rot3(rot3(p0, k * 1.05, k * .8 + s * .6 * (k + 1)), -ry * .3, rx * .5), f = 9 / (9 - q[2]);
    g.fillStyle = k === 1 ? C.mag : C.lime; g.beginPath(); g.arc(W / 2 + q[0] * S * f, H / 2 + q[1] * S * f, 9 * f, 0, TAU); g.fill();
  }
  g.restore();
  // wire cube
  const cube = [], ed = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let i = 0; i < 8; i++) cube.push([(i & 1 ? 1 : -1) * 1.5, (i & 2 ? 1 : -1) * 1.5, (i & 4 ? 1 : -1) * 1.5]);
  const cp = cube.map(p => { const q = rot3(p, -s * .9 + 1, s * .6), f = 9 / (9 - q[2]); return [W / 2 + q[0] * S * f, H / 2 + q[1] * S * f]; });
  g.strokeStyle = rgba(C.cyan, .7); g.lineWidth = 2.5;
  ed.forEach(([a, b]) => { g.beginPath(); g.moveTo(...cp[a]); g.lineTo(...cp[b]); g.stroke(); });
  cp.forEach(p => { g.fillStyle = C.cream; g.fillRect(p[0] - 5, p[1] - 5, 10, 10); });
  // knot point cloud
  g.save(); g.globalCompositeOperation = 'lighter';
  const c1 = hexRGB(C.lime), c2 = hexRGB(C.cyan), c3 = hexRGB(C.mag);
  for (let i = 0; i < KNOT.length; i++) {
    const pt = KNOT[i], q = rot3(pt, ry, rx), f = 9 / (9 - q[2]), u = pt[3];
    const t3 = u < .5 ? u * 2 : (u - .5) * 2, A = u < .5 ? c1 : c2, B = u < .5 ? c2 : c3;
    const depth = clamp((q[2] + 3.6) / 7.2), sz = (1.3 + depth * 2.6) * f;
    g.fillStyle = `rgba(${Math.round(lerp(A[0], B[0], t3))},${Math.round(lerp(A[1], B[1], t3))},${Math.round(lerp(A[2], B[2], t3))},${.28 + depth * .55})`;
    g.fillRect(W / 2 + q[0] * S * f - sz / 2, H / 2 + q[1] * S * f - sz / 2, sz, sz);
  }
  g.restore();
  // callouts
  const co = (x, y, tx, ty, txt, t0) => {
    const p = E.outExpo(pr(s, t0, t0 + .4)); if (p <= 0) return;
    g.strokeStyle = C.lime; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, tx, p), lerp(y, ty, p)); g.stroke();
    g.fillStyle = C.lime; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill();
    g.fillStyle = C.cream; g.textAlign = 'left'; g.textBaseline = 'middle'; g.globalAlpha = p; font(g, 'JB', 24, 4, '800'); g.fillText(txt, tx + 14, ty); g.globalAlpha = 1;
  };
  co(W / 2 - 300, H / 2 - 170, 250, 240, '6,300 VERTICES', .7);
  co(W / 2 + 330, H / 2 + 60, 1420, 400, 'REAL-TIME SHADING', 1.0);
  co(W / 2 - 120, H / 2 + 300, 330, 850, 'EASE  0.00 → 1.00', 1.3);
}

/* ================= SCENE 4 : TYPOGRAPHY (9.5-12s) ================= */
let SLICE = null;
function sliceCanvas() {
  const c = document.createElement('canvas'); c.width = 1700; c.height = 560; const x = c.getContext('2d');
  x.textBaseline = 'middle'; x.textAlign = 'center'; font(x, 'Anton', 430, 6);
  x.fillStyle = C.ink; x.fillText('SMOOTH.', 850 + 14, 290 + 73 + 14); x.fillStyle = C.cream; x.fillText('SMOOTH.', 850, 290 + 73);
  return c;
}
function scene4(g, s) {
  g.fillStyle = C.mag; g.fillRect(0, 0, W, H);
  if (!SLICE) SLICE = sliceCanvas();
  // marquee rows
  g.save(); g.beginPath(); g.rect(0, 112, W, H - 224); g.clip(); g.translate(W / 2, H / 2); g.rotate(-.14); g.textBaseline = 'middle'; g.textAlign = 'left';
  const words = 'DESIGN • MOTION • BRAND • UI • 3D • ', rows = 8, rh = 190;
  font(g, 'Anton', 190, 4); const ww = g.measureText(words).width;
  const enter = E.outExpo(pr(s, 0, .5));
  for (let r = 0; r < rows; r++) {
    const y = (r - (rows - 1) / 2) * rh, dir = r % 2 ? 1 : -1, off = ((s * (260 + r * 40) * dir) % ww);
    g.save(); g.globalAlpha = enter; g.translate(0, y + (1 - enter) * 300 * dir);
    for (let k = -3; k <= 3; k++) {
      const x = k * ww + off - ww / 2;
      if (r % 2) { g.lineWidth = 3; g.strokeStyle = C.ink; g.strokeText(words, x, 0); } else { g.fillStyle = C.ink; g.fillText(words, x, 0); }
    }
    g.restore();
  }
  g.restore();
  // lime panel behind title
  const pp = E.outExpo(pr(s, .1, .7));
  g.fillStyle = C.lime; rr(g, W / 2 - 800 * pp, H / 2 - 250, 1600 * pp, 500, 40); g.fill();
  // sliced title
  const settle = pr(s, .15, 1.0), amp = 420 * Math.pow(1 - E.outExpo(settle), 1.2);
  const glitchOn = (s > 1.55 && s < 1.66) || (s > 2.05 && s < 2.14), n = 14, sh = 560 / n;
  for (let i = 0; i < n; i++) {
    let off = Math.sin(i * .7 + s * 10) * amp * (i % 2 ? 1 : -1);
    if (glitchOn) off += (hash(i * 3 + Math.floor(s * 30)) - .5) * 160;
    const vis = pr(s, .12 + i * .012, .45 + i * .012);
    g.save(); g.globalAlpha = vis; g.drawImage(SLICE, 0, i * sh, 1700, sh + 1, W / 2 - 850 + off, H / 2 - 290 + i * sh, 1700, sh + 1); g.restore();
  }
  // pill caption
  const cp = E.back(pr(s, 1.1, 1.5));
  if (cp > 0) {
    g.save(); g.translate(W / 2, H / 2 + 330); g.scale(cp, cp); g.fillStyle = C.ink; rr(g, -330, -44, 660, 88, 44); g.fill();
    g.fillStyle = C.lime; g.textAlign = 'center'; g.textBaseline = 'middle'; font(g, 'JB', 30, 8, '800'); g.fillText('FRAME BY FRAME', 0, 2);
    g.beginPath(); g.arc(-270, 0, 10 + 3 * Math.sin(s * 10), 0, TAU); g.fill(); g.restore();
  }
}

/* ================= SCENE 5 : FINALE (12-15s) ================= */
function star(g, r, rot, color) {
  g.save(); g.rotate(rot); g.strokeStyle = color; g.lineWidth = r * .26; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke(); }
  g.restore();
}
function scene5(g, s) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // orbiting shapes collapsing
  const oc = E.in3(pr(s, .05, .55)), orR = lerp(460, 0, oc);
  if (s < .62) {
    speedLines(g, s, C.cream, 40, .15);
    for (let k = 0; k < 3; k++) {
      const a = s * 9 + k * TAU / 3; g.save(); g.translate(W / 2 + Math.cos(a) * orR, H / 2 + Math.sin(a) * orR); g.rotate(a * 2);
      g.fillStyle = [C.lime, C.mag, C.blue][k];
      if (k === 0) { g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.fill(); }
      else if (k === 1) { g.fillRect(-60, -60, 120, 120); }
      else { g.beginPath(); g.moveTo(0, -75); g.lineTo(70, 55); g.lineTo(-70, 55); g.closePath(); g.fill(); }
      g.restore();
    }
  }
  // lime burst
  const br = E.outExpo(pr(s, .55, 1.05));
  g.fillStyle = C.lime; g.beginPath(); g.arc(W / 2, H / 2, br * 1400, 0, TAU); g.fill();
  if (s < 1.2) { g.strokeStyle = C.cream; g.lineWidth = 8 * (1 - br); g.beginPath(); g.arc(W / 2, H / 2, br * 1400 + 40, 0, TAU); g.stroke(); }

  g.textBaseline = 'middle'; g.textAlign = 'left';
  // name lockup with masked letter rise
  const lines = [[CFG.name1, 410, 400], [CFG.name2, 1560, 0]];
  const s1 = fitSize(g, CFG.name2, 'Anton', 1560, 370, ''); // size for line 2
  const sizes = [330, Math.min(330, s1)];
  const ys = [H / 2 - 235 + 56, H / 2 + 90 + 56];
  lines.forEach(([txt], li) => {
    const size = sizes[li];
    g.save(); g.beginPath(); g.rect(0, ys[li] - size * .62, W, size * 1.05); g.clip();
    letters(g, txt, W / 2, size, 4, (ch, i, x, w) => {
      const p = pr(s, .85 + li * .12 + i * .035, 1.3 + li * .12 + i * .035), e = E.outExpo(p);
      g.fillStyle = C.ink; g.fillText(ch, x, ys[li] + (1 - e) * size * 1.1);
    });
    g.restore();
  });
  // rule + roles
  const rp = E.outExpo(pr(s, 1.55, 2.0)); g.fillStyle = C.ink; g.fillRect(W / 2 - 780, H / 2 + 338, 1560 * rp, 6);
  const nch = Math.floor(pr(s, 1.6, 2.2) * CFG.roles.length);
  g.textAlign = 'center'; font(g, 'JB', 44, 10, '800'); g.fillStyle = C.ink;
  g.fillText(CFG.roles.slice(0, nch) + (nch < CFG.roles.length && Math.floor(s * 8) % 2 ? '_' : ''), W / 2, H / 2 + 292);
  // availability pill + email
  const ap = E.back(pr(s, 2.05, 2.45));
  if (ap > 0) {
    g.save(); g.translate(W / 2 - 330, H / 2 + 390); g.scale(ap, ap); g.fillStyle = C.ink; rr(g, -290, -38, 580, 76, 38); g.fill();
    g.fillStyle = C.lime; g.beginPath(); g.arc(-235, 0, 11 + 4 * Math.sin(s * 9), 0, TAU); g.fill();
    g.textAlign = 'left'; font(g, 'JB', 27, 4, '800'); g.fillText('AVAILABLE FOR WORK', -200, 2); g.restore();
    g.save(); g.translate(W / 2 + 330, H / 2 + 390); g.scale(ap, ap); g.textAlign = 'center'; g.fillStyle = C.ink; font(g, 'JB', 27, 2, '800'); g.fillText(CFG.email, 0, 2); g.restore();
  }
  // spinning asterisk
  const sp = E.back(pr(s, 1.1, 1.6));
  if (sp > 0) { g.save(); g.translate(1640, 210); g.scale(sp, sp); star(g, 90, s * 1.6, C.ink); g.restore(); }
  const sp2 = E.back(pr(s, 1.3, 1.8));
  if (sp2 > 0) { g.save(); g.translate(250, 250); g.scale(sp2, sp2); star(g, 48, -s * 2.2, C.mag); g.restore(); }
}

const SCENES = [scene0, scene1, scene2, scene3, scene4, scene5];
const TITLES = ['01  KINETIC TYPE', '02  SHAPE SYSTEMS', '03  UI + DATA', '04  REAL-TIME 3D', '05  TYPOGRAPHY', '06  HELLO'];

/* ---------- HUD ---------- */
function hud(g, t, i, s) {
  const dark = i === 1 || i === 3 || (i === 0 && !(s >= .5 && s < 1.0)) || (i === 5 && s < .6);
  const col = dark ? C.cream : C.ink;
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.globalAlpha = .85; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineWidth = 3;
  font(g, 'JB', 20, 4, '800'); g.fillText('SHOWREEL 2026', 70, 84);
  g.textAlign = 'right'; g.fillText(TITLES[i], W - 70, 84);
  const fr = Math.floor(t * FPS), sec = Math.floor(fr / FPS);
  g.textAlign = 'left'; font(g, 'JB', 20, 4, '500'); g.fillText(`00:${String(sec).padStart(2, '0')}:${String(fr % FPS).padStart(2, '0')}`, 70, H - 62);
  g.textAlign = 'right'; g.fillText('1920x1080 / 30FPS', W - 70, H - 62);
  const m = 40, l = 34;   // crop marks
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => { g.beginPath(); g.moveTo(x + dx * l, y); g.lineTo(x, y); g.lineTo(x, y + dy * l); g.stroke(); });
  g.globalAlpha = .25; g.fillRect(70, H - 100, W - 140, 3); g.globalAlpha = .9; g.fillRect(70, H - 100, (W - 140) * t / DUR, 3);
  g.restore();
}

/* ---------- transitions ---------- */
function barsT(g, cov, uncover, n, angle, cols, stagger) {
  g.save(); g.translate(W / 2, H / 2); g.rotate(angle); const L = 2800, size = L / n;
  for (let i = 0; i < n; i++) {
    const d = hash(i * 7.7 + angle * 3), c = clamp(cov * (1 + stagger) - d * stagger);
    g.fillStyle = cols[i % cols.length];
    const x = -L / 2 + i * size, y = uncover ? L / 2 - L * c : -L / 2;
    g.fillRect(x, y, size + 1, L * c);
  }
  g.restore();
}
const TR_PAD = .18;
function trans(g, t) {
  for (let k = 1; k < 6; k++) {
    const ck = CUTS[k], p = (t - (ck - TR_PAD)) / (2 * TR_PAD); if (p < 0 || p > 1) continue;
    const unc = p >= .5, cov = unc ? 1 - E.inOut((p - .5) * 2) : E.inOut(p * 2);
    g.save();
    if (k === 1) barsT(g, cov, unc, 12, 0, [C.lime, C.mag, C.blue, C.cream], .8);
    else if (k === 2) { g.fillStyle = C.mag; const R = cov * 1300; if (!unc) { g.beginPath(); g.arc(W / 2, H / 2, R, 0, TAU); g.fill(); } else { g.beginPath(); g.rect(0, 0, W, H); g.arc(W / 2, H / 2, (1 - cov) * 1300, 0, TAU); g.fill('evenodd'); } }
    else if (k === 3) barsT(g, cov, unc, 9, .35, [C.ink, C.blue, C.lime], .5);
    else if (k === 4) barsT(g, cov, unc, 20, Math.PI / 2, [C.cyan, C.lime, C.cream, C.ink, C.blue], .9);
    else { g.fillStyle = '#fff'; g.globalAlpha = Math.pow(cov, 1.5); g.fillRect(0, 0, W, H); }
    g.restore();
  }
}

/* ---------- post: chromatic aberration, shake, grain, vignette ---------- */
const grainC = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), d = x.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = hash(i * .013) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
function post(t) {
  const a = imp(t), frame = Math.floor(t * FPS), ca = 1.4 + a * 11, shk = a * a * 9;
  const sx = (hash(frame * 1.7) - .5) * 2 * shk, sy = (hash(frame * 2.3 + 5) - .5) * 2 * shk, zoom = 1.02 + a * .012;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  [['#ff0000', -ca], ['#00ff00', 0], ['#0000ff', ca]].forEach(([col, dx]) => {
    tg.globalCompositeOperation = 'source-over'; tg.drawImage(scC, 0, 0);
    tg.globalCompositeOperation = 'multiply'; tg.fillStyle = col; tg.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter'; ctx.save(); ctx.translate(W / 2 + sx + dx, H / 2 + sy); ctx.scale(zoom, zoom); ctx.drawImage(tmC, -W / 2, -H / 2); ctx.restore();
  });
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .12;
  const ox = Math.floor(hash(frame * 3.1) * 512), oy = Math.floor(hash(frame * 4.7) * 512);
  for (let y = -oy; y < H; y += 512) for (let x = -ox; x < W; x += 512) ctx.drawImage(grainC, x, y);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 1180); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.36)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const fo = pr(t, 14.72, 15); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

window.renderFrame = function (t) {
  t = clamp(t, 0, DUR - 1e-4);
  const i = sceneIdx(t), s = t - CUTS[i];
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.globalCompositeOperation = 'source-over'; sg.shadowColor = 'transparent';
  sg.save(); SCENES[i](sg, s, t); sg.restore();
  sg.save(); hud(sg, t, i, s); sg.restore();
  sg.save(); trans(sg, t); sg.restore();
  post(t);
};

window.reelReady = Promise.all(['470px Anton', '700 20px SG', '500 20px SG', '800 20px JB', '500 20px JB'].map(f => document.fonts.load(f))).then(() => {
  if (!location.search.includes('render')) {
    const t0 = performance.now();
    const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    loop();
  }
  return true;
});
