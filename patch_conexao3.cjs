const fs = require('fs');
const content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

const newContent = content.replace(/Erro na API Google \(Accounts\): /g, "API Google Accounts falhou: ")
                          .replace(/Erro na API Google \(Locations\): /g, "API Google Locations falhou: ");

fs.writeFileSync('src/pages/Conexao.tsx', newContent);
console.log("Patched strings!");
