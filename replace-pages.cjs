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

walkDir('src/pages', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let code = fs.readFileSync(filePath, 'utf-8');
    let original = code;
    
    code = code.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
    code = code.replace(/bg-gray-50(?![a-zA-Z0-9_-])/g, 'bg-gray-50 dark:bg-slate-950');
    code = code.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
    code = code.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');
    code = code.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
    code = code.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
    code = code.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
    code = code.replace(/border-gray-100/g, 'border-gray-100 dark:border-slate-800');
    code = code.replace(/border-gray-200/g, 'border-gray-200 dark:border-slate-700');
    code = code.replace(/bg-gray-100/g, 'bg-gray-100 dark:bg-slate-800');
    code = code.replace(/hover:bg-gray-50(?![a-zA-Z0-9_-])/g, 'hover:bg-gray-50 dark:hover:bg-slate-800/50');
    code = code.replace(/hover:bg-gray-100/g, 'hover:bg-gray-100 dark:hover:bg-slate-800');
    
    if (original !== code) {
      fs.writeFileSync(filePath, code);
      console.log('Updated ' + filePath);
    }
  }
});
