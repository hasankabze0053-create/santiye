const fs = require('fs');
const path = require('path');

const artifactsDir = 'C:\\Users\\koray\\.gemini\\antigravity\\brain\\a9a6f581-66ce-482f-a7b7-6a344b8fdb6b';
const assetsDir = 'C:\\Users\\koray\\SantiyePro\\src\\assets\\highlight\\light';

const images = [
    { src: 'urban_light_v3_1778461349510.png', dest: 'urban.png', backup: 'urban_v2_backup.png' },
    { src: 'renovation_light_v3_1778461365384.png', dest: 'renovation.png', backup: 'renovation_v2_backup.png' },
    { src: 'market_light_v3_1778461377216.png', dest: 'market.png', backup: 'market_v2_backup.png' },
    { src: 'law_light_v3_1778461391309.png', dest: 'law.png', backup: 'law_v2_backup.png' },
];

images.forEach(img => {
    const destPath = path.join(assetsDir, img.dest);
    const backupPath = path.join(assetsDir, img.backup);
    const srcPath = path.join(artifactsDir, img.src);
    
    // Backup existing if exists
    if (fs.existsSync(destPath)) {
        // If backup already exists, maybe append timestamp, but let's just use v2_backup
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(destPath, backupPath);
            console.log(`Backed up ${img.dest} to ${img.backup}`);
        } else {
            const timestampBackup = path.join(assetsDir, `${img.dest.replace('.png', '')}_${Date.now()}_backup.png`);
            fs.copyFileSync(destPath, timestampBackup);
            console.log(`Backed up ${img.dest} to ${timestampBackup}`);
        }
    }
    
    // Copy new
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${img.src} to ${img.dest}`);
    } else {
        console.error(`Source not found: ${srcPath}`);
    }
});

console.log('Image update complete.');
