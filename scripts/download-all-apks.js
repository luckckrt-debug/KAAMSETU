const https = require('https');
const fs = require('fs');
const path = require('path');

const apks = [
  {
    name: 'KaamSetu-Worker-preview.apk',
    url: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk',
    package: 'com.kaamsetu.worker',
    label: 'KaamSetu Worker'
  },
  {
    name: 'KaamSetu-Hiring-preview.apk',
    url: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk',
    package: 'com.kaamsetu.app',
    label: 'KaamSetu Hiring'
  },
  {
    name: 'KaamSetu-Contractor-preview.apk',
    url: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk',
    package: 'com.kaamsetu.contractor',
    label: 'KaamSetu Contractor'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      let downloaded = 0;
      res.on('data', chunk => {
        downloaded += chunk.length;
      });
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ dest, downloaded }));
      });
      file.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function main() {
  const dir = path.resolve('central-directory/apks');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`Starting download of KaamSetu APKs to: ${dir}`);

  for (const item of apks) {
    const dest = path.join(dir, item.name);
    // If file already exists with > 10MB size, skip or re-download
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10 * 1024 * 1024) {
      console.log(`[ALREADY EXISTS] ${item.name} (${(fs.statSync(dest).size / (1024*1024)).toFixed(2)} MB)`);
      continue;
    }
    console.log(`[DOWNLOADING] ${item.label} (${item.name})...`);
    try {
      const res = await downloadFile(item.url, dest);
      console.log(`[SUCCESS] ${item.name} -> ${(res.downloaded / (1024*1024)).toFixed(2)} MB`);
    } catch (e) {
      console.error(`[ERROR] ${item.name}:`, e.message);
    }
  }

  console.log('All downloads completed!');
}

main();
