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

      const { businessData } = req.body;

      console.log("\n--- [GEMINI DIAGNOSIS REQUEST] ---");
      console.log("Business Data received:", businessData ? "YES" : "NO");
      if (businessData) console.log("Raw Business Data:", businessData);

      const ai = new GoogleGenAI({ apiKey });
      
      let contextStr = "Provide realistic analysis for a standard local cafe.";
      if (businessData) {
         contextStr = `Analyze the following real data from a local business and provide a highly personalized diagnosis:
         Data: ${businessData}
         
         Be extremely specific to their business name, category, and available details. Use this real data to inform your points and priorities.`;
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
      jsonRaw = jsonRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const diagnosis = JSON.parse(jsonRaw);
      console.log("Successfully parsed JSON.");
      console.log("--- [END GEMINI REQUEST] ---\n");
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
