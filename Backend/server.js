import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;
// const HF_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"; // model endpoint
const HF_MODEL = "j-hartmann/emotion-english-distilroberta-base";

if (!HF_API_KEY) {
  console.error("❌ HF_API_KEY not found in .env");
  process.exit(1);
}

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    console.log("📩 Incoming text:", text);

    const response = await fetch(
      // "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const raw = await response.text(); // always read text first for debugging
    console.log("📡 HF API Status:", response.status);
    console.log("📡 HF API Raw Response:", raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: raw });
    }

    const results = JSON.parse(raw);

    if (Array.isArray(results) && Array.isArray(results[0])) {
      const scores = results[0];
      const sorted = scores.sort((a, b) => b.score - a.score);
      const top = sorted[0];

      const moodMap = {
        LABEL_0: "negative",
        LABEL_1: "neutral",
        LABEL_2: "positive",
      };

      return res.json({
        mood: moodMap[top.label] || top.label,
        confidence: Math.round(top.score * 100) / 100,
        allScores: sorted.map((s) => ({
          label: moodMap[s.label] || s.label,
          score: Math.round(s.score * 100) / 100,
        })),
      });
    } else {
      return res.json({ mood: "neutral", confidence: 0.5, allScores: [] });
    }
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
