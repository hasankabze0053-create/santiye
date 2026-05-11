const fs = require('fs');

let code = fs.readFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', 'utf8');
const lines = code.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === ');') {
        // If the line before it was `</View>`, this is a component closing!
        if (lines[i-1].trim() === '</View>') {
            lines[i] = '    );\n};';
        }
    }
}

code = lines.join('\n');
fs.writeFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', code);
