import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { OAuth2Client } from "google-auth-library";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OAuth endpoints for GBP API
  app.post("/api/auth/google/exchange", async (req, res) => {
    try {
      const { code, redirectUri } = req.body;
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET" });
      }

      const client = new OAuth2Client(clientId, clientSecret, redirectUri || 'postmessage');
      const { tokens } = await client.getToken(code);
      
      res.json(tokens);
    } catch (error: any) {
      console.error("Exchange error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/google/refresh", async (req, res) => {
    try {
      const { refresh_token } = req.body;
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET" });
      }

      const client = new OAuth2Client(clientId, clientSecret);
      client.setCredentials({ refresh_token });
      
      const { credentials } = await client.refreshAccessToken();
      res.json(credentials);
    } catch (error: any) {
      console.error("Refresh error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy Endpoint for Sending Review Replies
  app.post("/api/reviews/reply", async (req, res) => {
    try {
      const { token, reviewName, comment } = req.body;
      
      if (!token || !reviewName || !comment) {
        return res.status(400).json({ error: "Missing required fields" });
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
      res.status(500).json({ error: error.message });
    }
  });

  // AI API Route
  app.post("/api/diagnosis", async (req, res) => {
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

  app.post("/api/insights", async (req, res) => {
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

  app.post("/api/generate-reply", async (req, res) => {
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
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const reply = response.text || "";
      res.json({ reply: reply.trim() });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate reply." });
    }
  });

  app.post("/api/generate-tip", async (req, res) => {
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
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const tip = response.text || "";
      res.json({ tip: tip.trim() });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate tip." });
    }
  });

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
