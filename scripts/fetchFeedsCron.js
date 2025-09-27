import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEEDS = [
  { name: 'inventoryA', url: 'https://example.com/feed-a.json' },
  { name: 'inventoryB', url: 'https://example.com/feed-b.json' },
];

const CACHE = path.join(__dirname, '..', '.cache');
fs.mkdirSync(CACHE, { recursive: true });

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? await res.json() : { __raw: await res.text() };
  } finally { clearTimeout(t); }
}

async function runOnce() {
  for (const f of FEEDS) {
    const ts = new Date().toISOString();
    try {
      const data = await get(f.url);
      fs.writeFileSync(path.join(CACHE, `${f.name}.json`), JSON.stringify(data));
      console.log(`[${ts}] OK ${f.name}`);
    } catch (e) {
      console.error(`[${ts}] ERR ${f.name}: ${e.message}`);
    }
  }
}

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));

if (args.now || !args.interval) await runOnce();
const m = Number(args.interval || 0);
if (m > 0) {
  console.log(`Every ${m} min… (Ctrl+C to stop)`);
  setInterval(runOnce, m * 60 * 1000);
}
