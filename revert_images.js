const fs = require('fs');
const path = require('path');

const assetsDir = 'C:\\Users\\koray\\SantiyePro\\src\\assets\\highlight\\light';

const images = [
    { dest: 'urban.png', backup: 'urban_v2_backup.png' },
    { dest: 'renovation.png', backup: 'renovation_v2_backup.png' },
    { dest: 'market.png', backup: 'market_v2_backup.png' },
    { dest: 'law.png', backup: 'law_v2_backup.png' },
];

images.forEach(img => {
    const destPath = path.join(assetsDir, img.dest);
    const backupPath = path.join(assetsDir, img.backup);
    
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, destPath);
        console.log(`Reverted ${img.dest} using ${img.backup}`);
    } else {
        console.error(`Backup not found: ${backupPath}`);
    }
});

console.log('Image revert complete.');
