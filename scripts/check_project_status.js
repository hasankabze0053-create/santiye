
const https = require('https');

const projectUrl = 'https://nxsjokupnsaeemtnlexf.supabase.co';

console.log(`Checking status of ${projectUrl} ...`);

const req = https.request(projectUrl, { method: 'HEAD' }, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    if (res.statusCode === 503) {
        console.error('❌ Project seems to be PAUSED (503 Service Unavailable).');
    } else if (res.statusCode >= 200 && res.statusCode < 500) {
        console.log('✅ Project seems to be ACTIVE.');
    } else {
        console.log(`⚠️ Received status ${res.statusCode}`);
    }
});

req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
});

req.end();
