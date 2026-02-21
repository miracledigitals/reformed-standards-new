
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
    // Support both Vite (import.meta.env) and process.env (defined by vite.config.ts)
    const apiKey =
      (typeof process !== 'undefined' && process.env?.API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      import.meta.env?.VITE_GEMINI_API_KEY ||
      import.meta.env?.VITE_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const createChatSession = (): Chat => {
  const ai = getGeminiClient();
  return ai.chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      temperature: 0.1,
      maxOutputTokens: 8192,
      // NOTE: googleSearch is NOT included here because it causes failures in chat sessions
      // with gemini-2.5-flash. Individual generateContent calls use search where needed.
      safetySettings: [...DEFAULT_SAFETY_SETTINGS]
    },
  });
};
