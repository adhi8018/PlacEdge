const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

// ✅ Initialize Gemini safely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ✅ Gemini function
async function runGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text;
  } catch (err) {
    console.error("Gemini Error:", err.message);
    throw err;
  }
}

// ✅ API Route
app.post("/analyze", async (req, res) => {
  try {
    const { module, input } = req.body;

    if (!module || !input) {
      return res.status(400).json({ output: "Missing input or module." });
    }

    let prompt = "";

    switch (module) {
      case "resume":
        prompt = `You are a placement mentor.

Analyze the resume:
1. Score /10
2. Strengths
3. Weak areas
4. Missing skills
5. Suggestions
6. Better summary

Resume:
${input}`;
        break;

      case "interview":
        prompt = `You are a mock interview coach.

Generate:
- 5 technical questions
- 5 HR questions
- Short answers

Profile:
${input}`;
        break;

      case "hr":
        prompt = `Improve this HR answer professionally and explain improvements:

${input}`;
        break;

      case "skillgap":
        prompt = `Analyze skill gap and provide:
- Skills
- Missing skills
- 30-day plan
- Projects

Profile:
${input}`;
        break;

      case "readiness":
        prompt = `Evaluate placement readiness:
- Score /10
- Strengths
- Weaknesses
- Final verdict

Profile:
${input}`;
        break;

      default:
        return res.status(400).json({ output: "Invalid module selected." });
    }

    const output = await runGemini(prompt);
    res.json({ output });

  } catch (error) {
    console.error("FULL GEMINI ERROR:", error);

    res.status(500).json({
      output: "Gemini API failed. Check server logs."
    });
  }
});

// ✅ Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});