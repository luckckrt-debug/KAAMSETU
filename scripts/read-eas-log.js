const https = require('https');
const zlib = require('zlib');

const url = process.argv[2] || 'https://storage.googleapis.com/eas-workflows-production/logs/17660db1-7d34-4cad-a179-745cf5533061/381e9baf-f3c2-4139-9a2f-09bdba3ccd7a/2026-11-18T11%3A01%3A42Z-6ce7e3a1-4076-488d-b1ef-488836e7643e.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20261118%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261118T110403Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=0f426e571673a3ed6d2a479d90f95b67458de082bb37d73d4387d9eea12b28d5e50263169a25cc4636a284aaa58afeae14176d9b9f53b249b78e8f9f96e891edc9345e7f929c782c081edb9526dcaec29f788248d3d605db375a65dc88d8d75c8c12f7560e13221460713d0da4a70ece792b5824d839a125c1cfe185a5d76f64f28d15eade92890dcf2d668cc0019512db8e60fa9d0cfc860a70f906d0808214f9892664aeeabc6508f5ebc27d87974ac17dd6f1e17278bf07a6f5e4244ef88a62719fd29ab416b27ca3aee0d22fe48a8ccb850714dfa2a73148563d3f747c40943e68a75ef51fa9a5b7f02c46793470a79eb8e68764f4d1911d905748e12481';

https.get(url, res => {
  const chunks = [];
  res.on('data', d => chunks.push(d));
  res.on('end', () => {
    const raw = Buffer.concat(chunks);
    let out = '';
    try {
      out = zlib.gunzipSync(raw).toString('utf8');
    } catch (e) {
      out = raw.toString('utf8');
    }
    // Filter non-printable characters
    const clean = out.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    console.log(clean);
  });
});
