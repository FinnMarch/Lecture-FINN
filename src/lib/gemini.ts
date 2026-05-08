import { GoogleGenAI } from "@google/genai";

// Use the API key provided in the environment via process.env.GEMINI_API_KEY
// Note: Vite defines this via the define config in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const model = "gemini-3-flash-preview";

export type AIResponse = {
  text: string;
  json?: any;
};

export async function generateAIContent(prompt: string, systemInstruction?: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || "";
}

export async function generateAIJSON(prompt: string, responseSchema: any, systemInstruction?: string): Promise<any> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI JSON response", e);
    return {};
  }
}
