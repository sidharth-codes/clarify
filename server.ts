import express from "express";
import path from "path";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();

// Configure multer for memory storage of uploaded PDF files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy initializer for Gemini client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ------------------- API ROUTES ------------------- //
const apiRouter = express.Router();

// 1. PDF Parsing Endpoint
apiRouter.post(["/parse-pdf", "/api/parse-pdf"], (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer error during PDF upload:", err);
      return res.status(400).json({ error: `File upload error: ${err.message || "Invalid file"}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const dataBuffer = req.file.buffer;
    let extractedText = "";
    let numPages = 1;

    // Try pdf-parse library first
    try {
      if (PDFParse) {
        const uint8Array = new Uint8Array(dataBuffer);
        const parser = new PDFParse(uint8Array);
        const parsed = await parser.getText();
        if (parsed) {
          extractedText = (parsed.text || "").trim();
          if (parsed.total) {
            numPages = parsed.total;
          } else if (Array.isArray(parsed.pages)) {
            numPages = parsed.pages.length;
          }
        }
      }
    } catch (parseErr) {
      console.warn("pdf-parse library failed, attempting Gemini PDF OCR fallback:", parseErr);
    }

    // Fallback to Gemini multimodal OCR/text extraction if pdf-parse failed or returned no text
    if (!extractedText && process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: dataBuffer.toString("base64")
              }
            },
            "Extract all text, sections, and formulas from this PDF document. Output only the extracted plain text content."
          ]
        });
        extractedText = (response.text || "").trim();
      } catch (geminiErr) {
        console.error("Gemini PDF extraction error:", geminiErr);
      }
    }

    // Clean text by stripping non-printable characters while preserving paragraph breaks
    const cleanedText = (extractedText || "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText) {
      return res.status(422).json({ error: "Could not extract readable text from the provided PDF." });
    }

    return res.json({
      success: true,
      text: cleanedText,
      numPages,
      charCount: cleanedText.length,
      wordCount: cleanedText.split(/\s+/).filter(Boolean).length
    });
  } catch (error: any) {
    console.error("PDF Parsing error:", error);
    return res.status(500).json({ 
      error: "Failed to parse PDF document: " + (error?.message || "Unknown error")
    });
  }
});

// 2. Stream Explanation Endpoint (SSE)
apiRouter.post(["/explain", "/api/explain"], async (req, res) => {
  const { text, difficulty, tone, customFocus } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text or concepts content is required." });
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const ai = getGenAIClient();

    const difficultyPromptMap: Record<string, string> = {
      "5-Year-Old/ELI5": "Explain this as if to a 5-year-old child (ELI5). Use delightful everyday analogies, simple language, stories, no confusing jargon without instant vivid pictures.",
      "High School": "Explain this for a High School student. Use relatable real-world context, intuitive concepts, clear definitions of key terms, and engaging structure.",
      "Undergraduate": "Explain this for an Undergraduate college level. Use structured academic breakdown, conceptual depth, key formulas/mathematical expressions in LaTeX ($...$ or $$...$$) where applicable, and trade-off analysis.",
      "Domain Expert": "Explain this for a Domain Expert / Graduate level. Use high-density technical terms, precise mechanism breakdown, formal equations, edge cases, and foundational principles."
    };

    const tonePromptMap: Record<string, string> = {
      "Analogy-Heavy": "Focus heavily on vivid analogies, metaphors, and comparison stories to make every mechanism intuitive.",
      "Plain & Direct": "Be straightforward, concise, bullet-driven, and crystal clear without fluff.",
      "Humorous & Casual": "Use a playful, witty, highly engaging, and fun casual tone while keeping the facts completely accurate."
    };

    const selectedDiff = difficultyPromptMap[difficulty] || difficultyPromptMap["Undergraduate"];
    const selectedTone = tonePromptMap[tone] || tonePromptMap["Plain & Direct"];

    const prompt = `You are an world-class educator, expert explainer, and master communicator.
Your task is to take the provided text/concept material and produce an incredibly clear, engaging, and well-structured breakdown.

TARGET AUDIENCE DIFFICULTY: ${difficulty}
Instructions: ${selectedDiff}

TONE & STYLE: ${tone}
Style Instructions: ${selectedTone}

${customFocus ? `SPECIAL INSTRUCTION FROM USER: ${customFocus}` : ""}

INPUT CONTENT TO EXPLAIN:
"""
${text.slice(0, 30000)}
"""

REQUIREMENTS FOR YOUR RESPONSE:
1. Format with clean Markdown (headings with ##, bold key terms, clean lists).
2. Start with a "## 💡 Core Summary" section giving a 2-sentence crystal clear essence.
3. Include "## 🖼️ The Big Picture" with the main mental model or core analogy.
4. Include "## 🔍 Step-by-Step Breakdown" explaining the key components or progression.
5. Include "## 📚 Key Terminology Decoded" listing 3-5 crucial terms and their simple definitions.
6. Include "## 🎯 Why It Matters & Real-World Applications".
7. If applicable (for math/science/engineering/economics), format any equations using LaTeX markdown ($inline$ or $$block$$).
8. Make the explanation deeply satisfying, memorable, and clear!`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (res.writableEnded) break;
      const textChunk = chunk.text;
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("SSE Explanation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to generate explanation." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Error streaming explanation." })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

// 3. Follow-Up Q&A Endpoint (SSE Stream)
apiRouter.post(["/followup", "/api/followup"], async (req, res) => {
  const { sourceText, explanation, history, question, difficulty, tone } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Follow-up question is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const ai = getGenAIClient();

    const historyPrompt = (history || [])
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join("\n");

    const prompt = `You are an AI study assistant and tutor explaining a specific concept.
The user is asking a follow-up question about the material.

Audience Level: ${difficulty || 'Undergraduate'}
Tone: ${tone || 'Plain & Direct'}

Original Source Material:
"""
${(sourceText || "").slice(0, 10000)}
"""

Current Explanation Provided:
"""
${(explanation || "").slice(0, 10000)}
"""

Conversation History:
${historyPrompt}

User's New Follow-Up Question:
"${question}"

Provide a clear, helpful, direct answer tailored to the target audience level (${difficulty}). Use Markdown formatting, bullet points, and LaTeX for math formulas where appropriate.`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (res.writableEnded) break;
      const textChunk = chunk.text;
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("SSE Followup error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to generate answer." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Error streaming answer." })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

// 4. Generate Quiz Endpoint
apiRouter.post(["/quiz", "/api/quiz"], async (req, res) => {
  const { sourceText, explanationText, difficulty } = req.body;

  try {
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Based on the following concept material and explanation, generate a 3-question multiple choice quiz to test understanding.
Target Audience Level: ${difficulty || 'General'}

Material:
"""
${(sourceText || explanationText || "").slice(0, 15000)}
"""

Return a JSON object with a key "quiz" containing an array of 3 questions.
Each question object MUST have:
- "id": unique string e.g. "q1"
- "question": string question text
- "options": array of 4 option strings
- "correctIndex": integer 0 to 3
- "explanation": brief string explaining why the correct answer is right and why others are wrong`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["quiz"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate quiz." });
  }
});

// 5. Generate Flashcards Endpoint
apiRouter.post(["/flashcards", "/api/flashcards"], async (req, res) => {
  const { sourceText, explanationText } = req.body;

  try {
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Based on the following concept explanation, extract 4 to 6 key terms/concepts and create flashcards for study.

Explanation Content:
"""
${(explanationText || sourceText || "").slice(0, 15000)}
"""

Return a JSON object with key "flashcards" containing an array of items.
Each item MUST have:
- "id": string (e.g. "card-1")
- "front": string question or concept term
- "back": clear, concise answer or definition
- "category": string short topic category`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["id", "front", "back", "category"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Flashcards generation error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate flashcards." });
  }
});

// Mount the apiRouter at both /api and /
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Catch-all for unknown /api/* endpoints - guarantee JSON response instead of HTML SPA fallback
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.path} not found.` });
});

// Global API error handler ensuring JSON response
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API error handler caught:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err?.status || 500).json({
    error: err?.message || "An unexpected error occurred processing your API request."
  });
});

// ------------------- VITE / STATIC SERVING ------------------- //
async function setupServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  setupServer();
}

export default app;
