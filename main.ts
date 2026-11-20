// Leonida Trophy Guide — entrypoint for make.fun gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is plain static files under app/:
// app/index.html opens in desktop Chrome and works with the network off, its
// tracker and roadmap run from app/app.js and app/style.css, and the 55 official
// trophies with their guides live in app/data/trophies.json. This program hands
// the guide in: it checks the trophy file first (55 trophies, every one with a
// non-blank guide), copies app/ and screenshots/ beside this file into /output,
// and writes /output/dossier.json with buildDossier from the vendored make.fun
// library. vendor/makefun-frontend.ts stays exactly as the kit shipped it: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Clear only the contents of a directory, never the directory itself: in
// the grader /output is a mounted volume and removing it throws EBUSY
// "Device or resource busy".
function clearDirContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The trophy gate is the heart of the entry: 55 official trophies, each named
// once, each with a guide of its own. Fail loudly here instead of handing in
// a dossier the scorer would refuse.
const shotDir = join(here, 'screenshots');
const shotFiles = existsSync(shotDir)
  ? readdirSync(shotDir).filter((f) => !f.startsWith('.'))
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
}
const dataPath = join(here, 'app', 'data', 'trophies.json');
const doc = JSON.parse(readFileSync(dataPath, 'utf8'));
const trophies = Array.isArray(doc) ? doc : doc.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`trophies.json must hold 55 trophies, found ${trophies?.length ?? 0}`);
}
const unnamed = trophies.filter((t) => typeof t.name !== 'string' || !t.name.trim());
const guideless = trophies.filter((t) => typeof t.guide !== 'string' || !t.guide.trim());
if (unnamed.length > 0 || guideless.length > 0) {
  throw new Error(
    `trophies.json is incomplete: ${unnamed.length} without a name, ${guideless.length} without a guide`,
  );
}
const grades = new Set(trophies.map((t) => t.grade));
for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
  if (!grades.has(g)) throw new Error(`trophies.json is missing the ${g} grade`);
}

// Fresh output every run, so two runs write the same bytes.
clearDirContents(outDir);
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots of 256 KiB, at most 993 files
// and directories in app/ totalling 48 MiB, and the dossier text capped at
// 160 KiB. Anything past a cap fails here with the library's own words.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log(`handed in ${trophies.length} trophies to ${outDir}`);
