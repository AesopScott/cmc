/**
 * Downloads all cmcenters.org images referenced in src/data/*.json
 * and saves them to public/img/, then rewrites the JSON files to use
 * local paths (/img/filename.ext).
 *
 * Run once: node scripts/download-images.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const IMG_DIR = path.join(ROOT, 'public', 'img');

fs.mkdirSync(IMG_DIR, { recursive: true });

const jsonFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

// Build map: originalUrl -> localPath
const urlMap = new Map();

function collectUrls(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach(collectUrls); return; }
  for (const [, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.includes('cmcenters.org/wp-content/uploads/')) {
      urlMap.set(val, null);
    } else {
      collectUrls(val);
    }
  }
}

// Pass 1: collect all image URLs from every JSON file
for (const file of jsonFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  collectUrls(data);
}

console.log(`Found ${urlMap.size} unique image URLs. Downloading...\n`);

function download(url, dest) {
  return new Promise(resolve => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch (_) {}
        download(res.headers.location, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch (_) {}
        console.warn(`  SKIP (${res.statusCode}): ${url}`);
        resolve(null);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    });
    req.on('error', err => {
      file.close();
      try { fs.unlinkSync(dest); } catch (_) {}
      console.warn(`  ERROR: ${url} — ${err.message}`);
      resolve(null);
    });
    req.setTimeout(20000, () => { req.destroy(); resolve(null); });
  });
}

// Pass 2: download
let ok = 0, fail = 0;
for (const url of urlMap.keys()) {
  const urlPath = new URL(url).pathname; // /wp-content/uploads/2024/03/photo.jpg
  const filename = urlPath.replace('/wp-content/uploads/', '').replace(/\//g, '__');
  const dest = path.join(IMG_DIR, filename);
  const localPath = `/img/${filename}`;

  if (fs.existsSync(dest)) {
    process.stdout.write(`  EXISTS: ${filename}\n`);
    urlMap.set(url, localPath);
    ok++;
    continue;
  }

  const result = await download(url, dest);
  if (result) {
    process.stdout.write(`  OK: ${filename}\n`);
    urlMap.set(url, localPath);
    ok++;
  } else {
    urlMap.set(url, url); // keep original if download failed
    fail++;
  }
}

console.log(`\nDownloaded: ${ok}  Failed: ${fail}\n`);

// Pass 3: rewrite all JSON files to use local paths
function rewriteUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(rewriteUrls);
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && urlMap.has(val)) {
      result[key] = urlMap.get(val);
    } else {
      result[key] = rewriteUrls(val);
    }
  }
  return result;
}

for (const file of jsonFiles) {
  const filePath = path.join(DATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const rewritten = rewriteUrls(data);
  fs.writeFileSync(filePath, JSON.stringify(rewritten, null, 4), 'utf8');
  console.log(`  Rewrote: ${file}`);
}

console.log('\nDone. Commit public/img/ and src/data/ to save the images.');
