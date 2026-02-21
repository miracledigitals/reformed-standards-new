
import { GoogleGenAI, Chat } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

let client: GoogleGenAI | null = null;

export const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
] as const;

export const getGeminiClient = (): GoogleGenAI => {
  if (!client) {
    // In Vite, use import.meta.env for variables prefixed with VITE_
    // Also support variables injected via 'define' in vite.config.ts (exact string match required)
    const apiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please ensure you have VITE_GEMINI_API_KEY in your .env or .env.local file.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const createChatSession = (): Chat => {
  const ai = getGeminiClient();
  return ai.chats.create({
    model: 'gemini-1.5-flash',
    config: {
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      temperature: 0.1,
      maxOutputTokens: 8192,
      safetySettings: [...DEFAULT_SAFETY_SETTINGS]
    },
  });
};
