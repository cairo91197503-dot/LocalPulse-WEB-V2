const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const proxyRoutes = `
// --- GMB Proxy Routes with Retry & Rate Limiting ---
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      attempt++;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(\`[Proxy] 429 Quota Exceeded for \${url}. Retrying in \${delay}ms (attempt \${attempt})\`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return res;
  }
  return fetch(url, options); // final attempt
};

app.get("/api/gmb/accounts", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    
    const response = await fetchWithRetry(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: authHeader } }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy Accounts Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/gmb/accounts/:accountId/locations", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    
    const accountId = req.params.accountId;
    const response = await fetchWithRetry(
      \`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/\${accountId}/locations?readMask=name,title,metadata,profile,languageCode,storeCode\`,
      { headers: { Authorization: authHeader } }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy Locations Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/gmb/locations/:locationId/reviews", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    
    const locationId = req.params.locationId;
    // locations is already in the path, but mybusinessreviews takes accounts/xxx/locations/yyy or locations/yyy
    // In Conexao.tsx it uses location.name which is typically "locations/xxx" or "accounts/xxx/locations/yyy"
    // So we pass the full name in a query param to avoid route matching issues.
    const locationName = req.query.name;
    
    if (!locationName) return res.status(400).json({ error: "Missing location name" });

    const response = await fetchWithRetry(
      \`https://mybusinessreviews.googleapis.com/v1/\${locationName}/reviews\`,
      { headers: { Authorization: authHeader } }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy Reviews Error:", error);
    res.status(500).json({ error: error.message });
  }
});
// --- End GMB Proxy Routes ---
`;

const targetIndex = content.indexOf('app.use(vite.middlewares);');
if (targetIndex !== -1) {
  content = content.substring(0, targetIndex) + proxyRoutes + '\n  ' + content.substring(targetIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Patched server.ts");
} else {
  console.error("Could not find insertion point in server.ts");
}
