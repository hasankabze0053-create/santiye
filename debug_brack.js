const fs = require('fs');
const lines = fs.readFileSync('c:/Users/koray/SantiyePro/src/screens/Admin/AdminDashboardScreen.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes(']')) console.log((i + 1) + ': ' + l.trim());
});
