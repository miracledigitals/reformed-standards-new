
import { GoogleGenAI, Chat } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

let client: GoogleGenAI | null = null;

export const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
] as const;

export const getGeminiClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) ||
      (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const createChatSession = (): Chat => {
  const ai = getGeminiClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      temperature: 0.1, // STRICT DETERMINISM for citations
      maxOutputTokens: 8192,
      tools: [{ googleSearch: {} }],
      safetySettings: [...DEFAULT_SAFETY_SETTINGS]
    },
  });
};
