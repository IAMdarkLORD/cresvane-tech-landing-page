import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '../public/og-image.png');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const raw = Buffer.alloc((W * H * 3 + H) * 1);
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0;
  for (let x = 0; x < W; x++) {
    const t = y / H;
    raw[o++] = 7;
    raw[o++] = Math.floor(17 + t * 8);
    raw[o++] = Math.floor(31 + t * 12);
  }
}
for (let y = H * 0.35; y < H * 0.65; y++) {
  for (let x = W * 0.1; x < W * 0.9; x++) {
    const px = Math.floor(y) * (W * 3 + 1) + 1 + Math.floor(x) * 3;
    if (px < raw.length - 2) {
      raw[px] = 0;
      raw[px + 1] = 217;
      raw[px + 2] = 255;
    }
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 6 })),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(out, png);
console.log('Wrote', out);
