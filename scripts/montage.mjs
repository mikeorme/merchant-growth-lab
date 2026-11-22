// Usage: node scripts/montage.mjs <id> [stepsCsv=1,2,3] [out=/tmp/mgl-montage-<id>.jpg]
// One image of the top of several pages, for a single image view during design and merchandising review.
import sharp from 'sharp';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const [id, stepsCsv = '1,2,3', out = `/tmp/mgl-montage-${id}.jpg`] = process.argv.slice(2);
const tiles = [];
for (const n of stepsCsv.split(',').map(Number)) {
  tiles.push(await sharp(path.join(root, `site/public/shots/${id}/step-${n}.webp`)).resize({ width: 960 }).extract({ left: 0, top: 0, width: 960, height: 520 }).jpeg({ quality: 80 }).toBuffer());
}
await sharp({ create: { width: 960, height: tiles.length * 528, channels: 3, background: '#888' } }).composite(tiles.map((t, i) => ({ input: t, top: i * 528, left: 0 }))).jpeg({ quality: 78 }).toFile(out);
console.log(out);
