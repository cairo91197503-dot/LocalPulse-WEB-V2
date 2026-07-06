const fs = require('fs');
let content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

content = content.replace(
  /"https:\/\/mybusinessaccountmanagement.googleapis.com\/v1\/accounts"/g,
  '"/api/gmb/accounts"'
);

// We need to replace the locations fetch as well
// from: `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata,profile,languageCode,storeCode`
// to: `/api/gmb/${account.name}/locations` (account.name is like "accounts/1234")
content = content.replace(
  /\`https:\/\/mybusinessbusinessinformation\.googleapis\.com\/v1\/\$\{account\.name\}\/locations\?readMask=name,title,metadata,profile,languageCode,storeCode\`/g,
  '`/api/gmb/${account.name}/locations`'
);

// and reviews
// from: `https://mybusinessreviews.googleapis.com/v1/${location.name}/reviews`
// to: `/api/gmb/locations/reviews?name=${encodeURIComponent(location.name)}`
content = content.replace(
  /\`https:\/\/mybusinessreviews\.googleapis\.com\/v1\/\$\{location\.name\}\/reviews\`/g,
  '`/api/gmb/locations/reviews?name=${encodeURIComponent(location.name)}`'
);

fs.writeFileSync('src/pages/Conexao.tsx', content);
console.log("Patched Conexao.tsx to use proxy!");
