const fs = require('fs');
let code = fs.readFileSync('src/components/SharedRequestDetail.js', 'utf8');

code = code.replace(/backgroundColor: '#0c0c0c'/g, "backgroundColor: isDarkMode ? '#0c0c0c' : theme.surface");
code = code.replace(/color="#FFD700"/g, "color={isDarkMode ? '#FFD700' : '#B8860B'}");
code = code.replace(/color: '#FFD700'/g, "color: isDarkMode ? '#FFD700' : '#B8860B'");
code = code.replace(/colors=\{request\.is_campaign_active \? \['rgba\(52,199,89,0\.08\)', '#111'\] : \['#111', '#111'\]\}/g, "colors={request.is_campaign_active ? ['rgba(52,199,89,0.08)', isDarkMode ? '#111' : theme.surface] : [isDarkMode ? '#111' : theme.surface, isDarkMode ? '#111' : theme.surface]}");

fs.writeFileSync('src/components/SharedRequestDetail.js', code);
console.log('Fixed premium light mode colors!');
