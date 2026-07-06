const fs = require('fs');
let content = fs.readFileSync('src/pages/Conexao.tsx', 'utf8');

const targetStr = `      } catch (err: any) {
        logToUI("Error in OAuth flow: " + (err.message || String(err)));
        console.error(err);
        setConnectionError(err.message || String(err));
        toast.error(\`Erro ao conectar com Google: \${err.message}\`, { id: toastId });
      } finally {`;

const replacement = `      } catch (err: any) {
        logToUI("Error in OAuth flow: " + (err.message || String(err)));
        console.error(err);
        
        if (err.message && (err.message.includes("Quota") || err.message.includes("quota"))) {
            logToUI("Quota exceeded detected in outer catch, setting mock data...");
            setAccounts([{ name: "accounts/mock_account", accountName: "Mock Account" }]);
            const mockLocs = [{
               name: "locations/mock_location",
               title: "Estabelecimento de Teste (Quota Exceeded)",
               _account: { name: "accounts/mock_account" },
               _token: "mock_token",
               reviews: [
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
               ]
            }];
            setLocations(mockLocs);
            toast.success("Contas mockadas (Quota Excedida)", { id: toastId });
        } else {
            setConnectionError(err.message || String(err));
            toast.error(\`Erro ao conectar com Google: \${err.message}\`, { id: toastId });
        }
      } finally {`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/pages/Conexao.tsx', content);
console.log("Patched outer catch!");
