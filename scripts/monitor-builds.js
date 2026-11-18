const { execSync } = require('child_process');
const https = require('https');
const zlib = require('zlib');

process.env.EXPO_TOKEN = 'gwJUVeVdOMrC5LZq2wKH1vsmGmK-HJa_5d09tKtH';
process.env.EAS_NO_VCS = '1';

const builds = [
  { name: 'Worker', id: '6c35c9b1-8da3-4c8e-a1ad-314cfd712bbc', dir: 'apps/worker' },
  { name: 'Hiring', id: 'c2df79d9-3ff4-4df3-a83c-d29ee5266bda', dir: 'apps/hiring' },
  { name: 'Contractor', id: 'ef5d0f4b-ab80-465d-a0a5-ca1ede4f8e0e', dir: 'apps/contractor' }
];

async function checkBuild(b) {
  try {
    const out = execSync(`eas build:view ${b.id} --json`, { cwd: b.dir, env: process.env }).toString();
    const data = JSON.parse(out);
    return {
      name: b.name,
      id: b.id,
      status: data.status,
      error: data.error,
      artifacts: data.artifacts,
      logFiles: data.logFiles
    };
  } catch(e) {
    return { name: b.name, id: b.id, error: e.message };
  }
}

async function main() {
  for (const b of builds) {
    const res = await checkBuild(b);
    console.log(`=== ${res.name} (${res.id}) ===`);
    console.log(`Status: ${res.status}`);
    if (res.error) console.log(`Error:`, JSON.stringify(res.error));
    if (res.artifacts && res.artifacts.buildUrl) {
      console.log(`APK URL: ${res.artifacts.buildUrl}`);
    }
  }
}

main();
