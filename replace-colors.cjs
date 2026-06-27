const fs = require('fs');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = dir + '/' + f;
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let code = fs.readFileSync(filePath, 'utf-8');
    let original = code;
    
    code = code.replace(/bg-teal-50(?![a-zA-Z0-9_-])/g, 'bg-teal-50 dark:bg-teal-900/30');
    code = code.replace(/border-teal-100/g, 'border-teal-100 dark:border-teal-800/50');
    code = code.replace(/hover:bg-teal-50(?![a-zA-Z0-9_-])/g, 'hover:bg-teal-50 dark:hover:bg-teal-900/40');
    code = code.replace(/hover:bg-teal-100/g, 'hover:bg-teal-100 dark:hover:bg-teal-800/50');
    code = code.replace(/bg-teal-100/g, 'bg-teal-100 dark:bg-teal-900/50');
    code = code.replace(/text-teal-900/g, 'text-teal-900 dark:text-teal-100');
    code = code.replace(/text-teal-700/g, 'text-teal-700 dark:text-teal-300');
    code = code.replace(/bg-amber-50(?![a-zA-Z0-9_-])/g, 'bg-amber-50 dark:bg-amber-900/20');
    code = code.replace(/border-amber-200/g, 'border-amber-200 dark:border-amber-700/50');
    code = code.replace(/text-amber-900/g, 'text-amber-900 dark:text-amber-100');
    code = code.replace(/bg-amber-100/g, 'bg-amber-100 dark:bg-amber-900/50');
    code = code.replace(/text-amber-800/g, 'text-amber-800 dark:text-amber-200');
    code = code.replace(/text-amber-700/g, 'text-amber-700 dark:text-amber-300');
    code = code.replace(/border-amber-100\/50/g, 'border-amber-100/50 dark:border-amber-700/30');
    code = code.replace(/bg-white\/60/g, 'bg-white/60 dark:bg-slate-800/60');
    code = code.replace(/bg-red-50(?![a-zA-Z0-9_-])/g, 'bg-red-50 dark:bg-red-900/20');
    code = code.replace(/border-red-200/g, 'border-red-200 dark:border-red-800/50');
    code = code.replace(/text-red-700/g, 'text-red-700 dark:text-red-300');

    if (original !== code) {
      fs.writeFileSync(filePath, code);
      console.log('Updated ' + filePath);
    }
  }
});
