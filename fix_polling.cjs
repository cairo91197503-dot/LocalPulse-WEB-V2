const fs = require('fs');
let content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

content = content.replace(
  'const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds',
  '// const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds'
);

content = content.replace(
  'clearInterval(interval);',
  '// clearInterval(interval);'
);

fs.writeFileSync('src/pages/Conexao.tsx', content);
console.log("Disabled polling in Conexao.tsx");
