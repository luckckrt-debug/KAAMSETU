const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crc = zlib.crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function generateSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // non-interlaced
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines: 1 filter byte (0) + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset); // filter type: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      rawData.writeUInt8(r, pxOffset);
      rawData.writeUInt8(g, pxOffset + 1);
      rawData.writeUInt8(b, pxOffset + 2);
      rawData.writeUInt8(a, pxOffset + 3);
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const apps = [
  { name: 'worker', r: 15, g: 23, b: 42 },      // #0F172A (Navy)
  { name: 'hiring', r: 30, g: 58, b: 138 },     // #1E3A8A (Blue)
  { name: 'contractor', r: 249, g: 115, b: 22 } // #F97316 (Orange)
];

apps.forEach(app => {
  const assetDir = path.resolve(__dirname, `../apps/${app.name}/assets`);
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  // 1. Icon (512x512)
  const icon = generateSolidPng(512, 512, app.r, app.g, app.b);
  fs.writeFileSync(path.join(assetDir, 'icon.png'), icon);

  // 2. Adaptive Icon (512x512)
  const adaptiveIcon = generateSolidPng(512, 512, app.r, app.g, app.b);
  fs.writeFileSync(path.join(assetDir, 'adaptive-icon.png'), adaptiveIcon);

  // 3. Splash (1080x1920)
  const splash = generateSolidPng(1080, 1920, app.r, app.g, app.b);
  fs.writeFileSync(path.join(assetDir, 'splash.png'), splash);

  // 4. Favicon (48x48)
  const favicon = generateSolidPng(48, 48, app.r, app.g, app.b);
  fs.writeFileSync(path.join(assetDir, 'favicon.png'), favicon);

  console.log(`[ASSETS] Generated valid CRC32 PNGs for apps/${app.name}`);
});
