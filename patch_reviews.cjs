const fs = require('fs');
const content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

const startIndex = content.indexOf('// Fetch reviews');
const endIndex = content.indexOf('// Fetch media', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `// Fetch reviews
      if (location.name === "locations/mock_location") {
         location.reviews = [
            {
              name: "reviews/mock1",
              reviewer: { displayName: "Maria Silva" },
              starRating: "FIVE",
              comment: "Ótimo atendimento, recomendo a todos! Com certeza voltarei mais vezes.",
              createTime: new Date().toISOString()
            },
            {
              name: "reviews/mock2",
              reviewer: { displayName: "João Pedro" },
              starRating: "FOUR",
              comment: "Gostei bastante, mas acho que pode melhorar o tempo de espera.",
              createTime: new Date(Date.now() - 86400000).toISOString()
            }
         ];
      } else {
        try {
          const token = location._token;
          const reviewsRes = await fetchWithLogging(
            \`https://mybusinessreviews.googleapis.com/v1/\${location.name}/reviews\`,
            {
              headers: { Authorization: \`Bearer \${token}\` },
            },
          );
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            location.reviews = reviewsData.reviews || [];
          }
        } catch (reviewErr) {
          console.error("Error fetching reviews:", reviewErr);
        }
      }

      `;

  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/pages/Conexao.tsx', newContent);
  console.log("Patched reviews successfully!");
} else {
  console.log("Could not find patch bounds for reviews.");
}
