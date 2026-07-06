const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const devDepsToMove = [
  "vite", "esbuild", "typescript", "tsx", "tailwindcss", "@tailwindcss/vite", 
  "@vitejs/plugin-react", "autoprefixer", "@types/node", "@types/react", 
  "@types/react-dom", "@types/express", "@types/intro.js"
];

for (const dep of devDepsToMove) {
  if (pkg.devDependencies && pkg.devDependencies[dep]) {
    pkg.dependencies[dep] = pkg.devDependencies[dep];
    delete pkg.devDependencies[dep];
  }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Moved dev dependencies to dependencies.");
