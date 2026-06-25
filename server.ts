import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // AI API Route
  app.post("/api/diagnosis", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
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
      Provide realistic analysis for a standard local cafe. ONLY output valid JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let jsonRaw = response.text || "";
      jsonRaw = jsonRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const diagnosis = JSON.parse(jsonRaw);
      res.json(diagnosis);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate diagnosis." });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
