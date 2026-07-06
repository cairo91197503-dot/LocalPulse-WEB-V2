const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

const targetStr = `import { GoogleOAuthProvider } from '@react-oauth/google'`;
const replacementStr = `import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `<GoogleOAuthProvider clientId={rawClientId}>
          <App />
        </GoogleOAuthProvider>`;
const replacementStr2 = `<QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={rawClientId}>
            <App />
          </GoogleOAuthProvider>
        </QueryClientProvider>`;

content = content.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/main.tsx', content);
console.log("Patched main.tsx!");
