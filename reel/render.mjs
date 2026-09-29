// usage: node render.mjs shots t1,t2,...   -> PNG stills in ./shots
//        node render.mjs video [audio.wav]  -> reel.mp4 (H.264 1080p30)
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => console.error('PAGEERR', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(`http://localhost:${port}/index.html?render`);
await page.evaluate(() => window.reelReady);
const mode = process.argv[2];
if (mode === 'shots') {
  fs.mkdirSync(path.join(dir, 'shots'), { recursive: true });
  for (const t of process.argv[3].split(',').map(Number)) {
    const url = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .9); }, t);
    fs.writeFileSync(path.join(dir, 'shots', `t${t.toFixed(2)}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  }
} else {
  const audio = process.argv[3];
  const out = path.join(dir, 'reel.mp4');
  const args = ['-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-'];
  if (audio) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30');
  if (audio) args.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
  args.push('-movflags', '+faststart', out);
  const ff = spawn(FFMPEG, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('close', r));
  const N = 450, t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const url = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .96); }, i / 30);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await done;
}
await browser.close(); srv.close();
