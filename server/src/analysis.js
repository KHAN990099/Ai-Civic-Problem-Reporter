
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";

export async function analyzeIssue({
  description,
  category,
  location,
  imagePath,
}) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is missing in backend environment.");
  }

  const prompt = `
Analyze this civic issue report.

Description: ${description}
Reported Category: ${category}
Location: ${location || "Not provided"}

Return ONLY valid JSON with these fields:
{
  "issueType": "pothole" | "garbage" | "streetlight" | "water" | "drainage" | "other",
  "visibleEvidence": ["specific observations"],
  "suggestedPriority": "Low" | "Medium" | "High",
  "confidenceOrUncertainty": "Explanation of confidence",
  "recommendedActions": ["municipal worker next steps"],
  "needsHumanReview": true,
  "summary": "Brief assessment"
}

Do not invent visual evidence.
If no image is provided, clearly state that visual evidence cannot be verified.
`;

  try {
    const contents = [];

    if (imagePath) {
      const imageData = await fs.readFile(imagePath);
      const extension = path.extname(imagePath).toLowerCase();

      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };

      const mimeType = mimeTypes[extension];

      if (!mimeType) {
        throw new Error("Unsupported image format.");
      }

      contents.push({
        inlineData: {
          mimeType,
          data: imageData.toString("base64"),
        },
      });
    }

    contents.push({ text: prompt });

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Empty response received from AI model.");
    }

    const analysis = JSON.parse(responseText);

    const validCategories = [
      "pothole",
      "garbage",
      "streetlight",
      "water",
      "drainage",
      "other",
    ];

    const validPriorities = ["Low", "Medium", "High"];

    return {
      suggestedCategory: validCategories.includes(analysis.issueType)
        ? analysis.issueType
        : category,

      evidence: Array.isArray(analysis.visibleEvidence)
        ? analysis.visibleEvidence
        : [],

      priority: validPriorities.includes(analysis.suggestedPriority)
        ? analysis.suggestedPriority
        : "Medium",

      nextSteps: Array.isArray(analysis.recommendedActions)
        ? analysis.recommendedActions
        : [],

      humanReview: analysis.needsHumanReview
        ? "Recommended: a municipal officer should verify this report."
        : "Standard human verification recommended.",

      summary:
        analysis.summary ||
        analysis.confidenceOrUncertainty ||
        "Assessment completed by AI.",

      mode: "REAL",
    };
  } catch (error) {
    console.error("Gemma AI Analysis Error:", error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}
