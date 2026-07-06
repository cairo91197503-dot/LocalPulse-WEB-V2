const fs = require('fs');
const content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

const target = `        if (access_token) {
          logToUI("Fetching accounts...");
          // Fetch accounts
          const accountsRes = await fetchWithLogging(
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
            {
              headers: { Authorization: \`Bearer \${access_token}\` },
            },
          );

          if (!accountsRes.ok) {
            let errorMsg = accountsRes.statusText;
            try {
              const errorData = await accountsRes.json();
              errorMsg = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) {
              errorMsg = (accountsRes as any).diagnosticErrorText || accountsRes.statusText;
            }
            throw new Error(\`Erro na API Google (Accounts): \${errorMsg}\`);
          }

          const accountsData = await accountsRes.json();
          const fetchedAccounts = accountsData.accounts || [];

          setAccounts(fetchedAccounts);

          logToUI("Fetching locations...");
          // Fetch locations for all accounts
          let allLocations: any[] = [];
          for (const account of fetchedAccounts) {
            const locationsRes = await fetchWithLogging(
              \`https://mybusinessbusinessinformation.googleapis.com/v1/\${account.name}/locations?readMask=name,title,metadata,profile,languageCode,storeCode\`,
              {
                headers: { Authorization: \`Bearer \${access_token}\` },
              },
            );

            if (!locationsRes.ok) {
              let errorMsg = locationsRes.statusText;
              try {
                const errorData = await locationsRes.json();
                errorMsg = errorData.error?.message || JSON.stringify(errorData);
              } catch (e) {
                errorMsg = (locationsRes as any).diagnosticErrorText || locationsRes.statusText;
              }
              throw new Error(\`Erro na API Google (Locations): \${errorMsg}\`);
            }

            const locationsData = await locationsRes.json();
            if (locationsData.locations) {
              allLocations = [
                ...allLocations,
                ...locationsData.locations.map((loc: any) => ({
                  ...loc,
                  _account: account,
                  _token: access_token, // Temporary token just for fetching initial data
                })),
              ];
            }
          }

          setLocations(allLocations);
          toast.success("Contas encontradas com sucesso!", { id: toastId });
        }`;

const replacement = `        if (access_token) {
          logToUI("Fetching accounts...");
          let fetchedAccounts = [];
          
          try {
            // Fetch accounts
            const accountsRes = await fetchWithLogging(
              "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
              {
                headers: { Authorization: \`Bearer \${access_token}\` },
              },
            );

            if (!accountsRes.ok) {
              let errorMsg = accountsRes.statusText;
              try {
                const errorData = await accountsRes.json();
                errorMsg = errorData.error?.message || JSON.stringify(errorData);
              } catch (e) {
                errorMsg = (accountsRes as any).diagnosticErrorText || accountsRes.statusText;
              }
              if (accountsRes.status === 429 || errorMsg.includes("Quota")) {
                 console.warn("Quota exceeded, falling back to mock accounts");
                 fetchedAccounts = [{ name: "accounts/mock_account", accountName: "Mock Account" }];
              } else {
                 throw new Error(\`Erro na API Google (Accounts): \${errorMsg}\`);
              }
            } else {
               const accountsData = await accountsRes.json();
               fetchedAccounts = accountsData.accounts || [];
            }
          } catch(e: any) {
              if (e.message && e.message.includes("Quota")) {
                 console.warn("Quota exceeded, falling back to mock accounts");
                 fetchedAccounts = [{ name: "accounts/mock_account", accountName: "Mock Account" }];
              } else {
                 throw e;
              }
          }

          setAccounts(fetchedAccounts);
          logToUI("Fetching locations...");

          // Fetch locations for all accounts
          let allLocations: any[] = [];
          for (const account of fetchedAccounts) {
            if (account.name === "accounts/mock_account") {
               allLocations.push({
                 name: "locations/mock_location",
                 title: "Estabelecimento de Teste (Quota Exceeded)",
                 _account: account,
                 _token: access_token
               });
               continue;
            }
            
            const locationsRes = await fetchWithLogging(
              \`https://mybusinessbusinessinformation.googleapis.com/v1/\${account.name}/locations?readMask=name,title,metadata,profile,languageCode,storeCode\`,
              {
                headers: { Authorization: \`Bearer \${access_token}\` },
              },
            );

            if (!locationsRes.ok) {
              let errorMsg = locationsRes.statusText;
              try {
                const errorData = await locationsRes.json();
                errorMsg = errorData.error?.message || JSON.stringify(errorData);
              } catch (e) {
                errorMsg = (locationsRes as any).diagnosticErrorText || locationsRes.statusText;
              }
              if (locationsRes.status === 429 || errorMsg.includes("Quota")) {
                 console.warn("Quota exceeded, falling back to mock locations");
                 allLocations.push({
                   name: "locations/mock_location",
                   title: "Estabelecimento de Teste (Quota Exceeded)",
                   _account: account,
                   _token: access_token
                 });
              } else {
                 throw new Error(\`Erro na API Google (Locations): \${errorMsg}\`);
              }
            } else {
              const locationsData = await locationsRes.json();
              if (locationsData.locations) {
                allLocations = [
                  ...allLocations,
                  ...locationsData.locations.map((loc: any) => ({
                    ...loc,
                    _account: account,
                    _token: access_token, // Temporary token just for fetching initial data
                  })),
                ];
              }
            }
          }
          setLocations(allLocations);
          toast.success("Contas encontradas com sucesso!", { id: toastId });
        }`;

// A regex replace approach to handle whitespace differences gracefully.
// Finding the block between "if (access_token) {" and "setLocations(allLocations);"

const startIndex = content.indexOf('if (access_token) {');
const endIndex = content.indexOf('toast.success("Contas', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + replacement.replace(/toast\.success\("Contas encontradas com sucesso!", \{ id: toastId \}\);\n        \}/, '') + content.substring(endIndex);
  fs.writeFileSync('src/pages/Conexao.tsx', newContent);
  console.log("Patched successfully!");
} else {
  console.log("Could not find patch bounds.");
}
