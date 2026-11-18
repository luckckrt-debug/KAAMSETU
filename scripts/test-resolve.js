const { execSync } = require('child_process');
const path = require('path');

const cwd = path.resolve('apps/worker/android');
try {
  const r1 = execSync('node --print "require.resolve(\'@react-native/gradle-plugin/package.json\')"', { cwd }).toString().trim();
  console.log('r1:', r1);
} catch (e) {
  console.error('r1 error:', e.message);
}

try {
  const r2 = execSync('node --print "require.resolve(\'@react-native/gradle-plugin/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"', { cwd }).toString().trim();
  console.log('r2:', r2);
} catch (e) {
  console.error('r2 error:', e.message);
}
