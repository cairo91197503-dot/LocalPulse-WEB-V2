const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const startIndex = content.indexOf('app.post("/api/reviews/reply"');
const endIndex = content.indexOf('res.json(data);', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `app.post("/api/reviews/reply", async (req, res) => {
    try {
      const { token, reviewName, comment } = req.body;
      
      if (!token || !reviewName || !comment) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Handle mock reviews
      if (reviewName.startsWith("reviews/mock")) {
         console.log("Mocking reply for", reviewName);
         return res.json({ comment, updateTime: new Date().toISOString() });
      }

      const response = await fetch(
        \`https://mybusinessreviews.googleapis.com/v1/\${reviewName}/reply\`,
        {
          method: "PUT",
          headers: {
            Authorization: \`Bearer \${token}\`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Google API Error:", errorData);
        throw new Error("Erro na API do Google");
      }

      const data = await response.json();
      res.json(data);`;

  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + 15);
  fs.writeFileSync('server.ts', newContent);
  console.log("Patched server successfully!");
} else {
  console.log("Could not find patch bounds for server.");
}
