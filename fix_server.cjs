const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'app.get("/api/gmb/locations/:locationId/reviews", async (req, res) => {',
  'app.get("/api/gmb/locations/reviews", async (req, res) => {'
);
fs.writeFileSync('server.ts', content);
console.log("Fixed reviews route in server.ts");
