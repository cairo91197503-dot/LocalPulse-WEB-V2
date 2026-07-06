const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const startMarker = '// --- GMB Proxy Routes with Retry & Rate Limiting ---';
const endMarker = '// --- End GMB Proxy Routes ---\n';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  const proxyCode = content.substring(startIndex, endIndex);
  
  // Remove the proxy code from its current position
  content = content.substring(0, startIndex) + content.substring(endIndex);
  
  // Insert it before the Vite middleware setup
  const targetMarker = '// Vite middleware for development';
  const targetIndex = content.indexOf(targetMarker);
  
  if (targetIndex !== -1) {
    content = content.substring(0, targetIndex) + proxyCode + '\n  ' + content.substring(targetIndex);
    fs.writeFileSync('server.ts', content);
    console.log("Successfully moved proxy code.");
  }
}
