const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

delete pkg.scripts.deploy;

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Removed deploy script.");
