import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { OAuth2Client } from "google-auth-library";
import admin from "firebase-admin";

function getGoogleCredentials() {
  let clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").replace(/\s+/g, '');
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").replace(/\s+/g, '');
  
  if (clientId && !clientId.includes('-') && clientId.length === 71) {
    clientId = clientId.slice(0, 12) + '-' + clientId.slice(12);
  }
  return { clientId, clientSecret };
}

// --- Firebase Admin: inicializa a conexão usando o segredo ---
function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não configurado no ambiente.");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// --- Middleware "segurança": confere o crachá (token) do usuário ---
async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de autenticação ausente." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // OAuth endpoints for GBP API
  app.post("/api/auth/google/exchange", async (req, res) => {
    try {
      const { code, redirectUri } = req.body;
      const { clientId, clientSecret } = getGoogleCredentials();

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET" });
      }

      const client = new OAuth2Client(clientId, clientSecret, redirectUri || 'postmessage');
      const { tokens } = await client.getToken(code);
      
      res.json(tokens);
    } catch (error: any) {
      console.error("Exchange error:", error);
      res.status(500).json({ error: error.message || error.toString() });
    }
  });

  app.post("/api/auth/google/refresh", async (req, res) => {
    try {
      const { refresh_token } = req.body;
      const { clientId, clientSecret } = getGoogleCredentials();

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET" });
      }

      const client = new OAuth2Client(clientId, clientSecret);
      client.setCredentials({ refresh_token });
      
      const { credentials } = await client.refreshAccessToken();
      res.json(credentials);
    } catch (error: any) {
      console.error("Refresh error:", error);
      res.status(500).json({ error: error.message || error.toString() });
    }
  });

  // Proxy Endpoint for Sending Review Replies
  app.post("/api/reviews/reply", requireAuth, async (req, res) => {
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
        `https://mybusinessreviews.googleapis.com/v1/${reviewName}/reply`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
      res.json(data);
    } catch (error: any) {
      console.error("Reply error:", error);
      res.status(500).json({ error: error.message || error.toString() });
    }
  });

  // AI API Route
  app.post("/api/diagnosis", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { businessData } = req.body;

      console.log("\n--- [GEMINI DIAGNOSIS REQUEST] ---");
      console.log("Business Data received:", businessData ? "YES" : "NO");
      if (businessData) console.log("Raw Business Data:", businessData);

      const ai = new GoogleGenAI({ apiKey });

      let contextStr = "";
      if (businessData) {
        contextStr = `Analyze the following real data from a local business and provide a highly personalized diagnosis:
         Data: ${businessData}
         
         Be extremely specific to their business name, category, and available details. Use this real data to inform your points and priorities.`;
      } else {
        return res.status(400).json({
          error: "Conecte sua empresa para gerar um diagnóstico real.",
        });
      }

      const prompt = `
      You are an expert digital marketing consultant analyzing the online reputation of a local business.
      Return your analysis as a JSON object with the following structure:
      {
        "score": number (0-100),
        "nivel": string (e.g. "Bom", "Excelente", "Atenção"),
        "resumo": string (A short summary of their reputation),
        "pontos_positivos": array of strings,
        "pontos_negativos": array of strings,
        "acoes_prioritarias": array of objects { "titulo": string, "descricao": string, "impacto": "Alto"|"Médio"|"Baixo" }
      }
      
      ${contextStr}
      ONLY output valid JSON.
      `;

      console.log("Generated Prompt:\n", prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      console.log("Gemini Raw Response:\n", response.text);

      let jsonRaw = response.text || "";
      jsonRaw = jsonRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const diagnosis = JSON.parse(jsonRaw);
      console.log("Successfully parsed JSON.");
      console.log("--- [END GEMINI REQUEST] ---\n");
      res.json(diagnosis);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate diagnosis." });
    }
  });

  app.post("/api/insights", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { metrics, businessData } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      let contextStr = `Analyze the following performance metrics and business data to generate a short, professional, and actionable insight about their recent performance.
      Metrics: ${JSON.stringify(metrics)}
      Business Data: ${JSON.stringify(businessData)}`;

      const prompt = `
      You are an expert digital marketing consultant analyzing the online reputation of a local business.
      Return your analysis as a JSON object with the following structure:
      {
        "insightTitle": string (A catchy title for the insight),
        "insightText": string (A paragraph explaining the performance trend, noting any strengths or areas for improvement),
        "recommendation": string (One actionable recommendation based on the data)
      }
      
      ${contextStr}
      ONLY output valid JSON without any markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let jsonRaw = response.text || "";
      jsonRaw = jsonRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const insights = JSON.parse(jsonRaw);
      res.json(insights);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate insights." });
    }
  });

  app.post("/api/generate-reply", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { reviewText, reviewerName } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const prompt = `
      You are an expert customer service representative for a local business.
      A customer named "${reviewerName}" has left the following review for your business:
      "${reviewText}"
      
      Generate a professional, polite, and personalized reply to this review in Portuguese.
      The reply should address the specific points mentioned in the review, thank the customer if it's positive, or apologize and offer a resolution if it's negative.
      Keep it concise but friendly.
      
      Return ONLY the text of the reply.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const reply = response.text || "";
      res.json({ reply: reply.trim() });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate reply." });
    }
  });

  app.post("/api/generate-tip", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { recentReviews } = req.body;

      if (!recentReviews || recentReviews.length === 0) {
        return res.json({
          tip: "Sem avaliações recentes com texto para analisar.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const reviewsContext = recentReviews
        .map((r: any) => `Rating: ${r.starRating}, Text: "${r.comment}"`)
        .join("\n");

      const prompt = `
      You are a business consultant analyzing a batch of recent customer reviews for a local business.
      Recent Reviews:
      ${reviewsContext}
      
      Generate a single, specific, actionable tip (in Portuguese) for the business owner based on the patterns or specific details in these recent reviews.
      For example, if multiple reviews mention slow service, suggest optimizing peak hours. If they praise a specific product, suggest highlighting it on social media.
      Keep the tip short, direct, and professional (max 2 sentences).
      Do NOT include any greetings or formatting, just the tip itself.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const tip = response.text || "";
      res.json({ tip: tip.trim() });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate tip." });
    }
  });

  // --- GMB Proxy Routes with Retry & Rate Limiting ---
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      attempt++;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(`[Proxy] 429 Quota Exceeded for ${url}. Retrying in ${delay}ms (attempt ${attempt})`);
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
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,metadata,profile,languageCode,storeCode`,
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

app.get("/api/gmb/locations/reviews", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    
    const locationId = req.params.locationId;
    const locationName = req.query.name;
    
    if (!locationName) return res.status(400).json({ error: "Missing location name" });

    const response = await fetchWithRetry(
      `https://mybusinessreviews.googleapis.com/v1/${locationName}/reviews`,
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    

  app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();