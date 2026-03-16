const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("API KEY FOUND:", process.env.GEMINI_API_KEY ? "YES" : "NO");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function runGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
}

app.post("/analyze", async (req, res) => {
  try {
    const { module, input } = req.body;

    let prompt = "";

    if (module === "resume") {
      prompt = `
You are a placement mentor for Chandigarh University students.

Analyze the following resume and give:
1. Resume score out of 10
2. Strengths
3. Weak areas
4. Missing skills
5. Suggestions for improvement
6. Better summary/objective

Resume:
${input}
`;
    } else if (module === "interview") {
      prompt = `
You are a mock interview coach for Chandigarh University placement students.

Based on this profile, generate:
1. 5 technical interview questions
2. 5 HR interview questions
3. Short ideal answers/hints for each

Student profile:
${input}
`;
    } else if (module === "hr") {
      prompt = `
You are an HR communication trainer.

Improve the following HR answer so it sounds professional, confident, concise, and placement-ready.
Also explain what was improved.

Answer:
${input}
`;
    } else if (module === "skillgap") {
      prompt = `
You are a placement preparation advisor.

Based on the student profile below, identify:
1. Current skills
2. Missing industry-relevant skills
3. Skills to learn first
4. 30-day improvement plan
5. Suggested project ideas

Student profile:
${input}
`;
    } else if (module === "readiness") {
      prompt = `
You are a campus placement readiness evaluator.

Analyze this student profile and provide:
1. Readiness score out of 10
2. Strong points
3. Weak points
4. What should be improved before placement drive
5. Final verdict: Ready / Almost Ready / Not Ready

Student profile:
${input}
`;
    } else {
      return res.status(400).json({ output: "Invalid module selected." });
    }

    const output = await runGemini(prompt);
    res.json({ output });
  } catch (error) {
    console.error("FULL GEMINI ERROR:");
    console.error(error);

    res.status(500).json({
      output: "Gemini API request failed. Check terminal for exact error."
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});