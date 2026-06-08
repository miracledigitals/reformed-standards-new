import { GoogleGenAI, Chat } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

const MODEL_NAME = 'gemini-2.0-flash';

let client: GoogleGenAI | null = null;

export const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'BLOCK_NONE' as any },
  { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'BLOCK_NONE' as any },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_NONE' as any },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_NONE' as any },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY' as any, threshold: 'BLOCK_NONE' as any }
];

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

/**
 * Safely parses a JSON string from AI output.
 * Handles common issues like markdown code fences, trailing commas, etc.
 */
export const safeParseJSON = <T = any>(text: string): T | null => {
  if (!text) return null;
  try {
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    let cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn("safeParseJSON: Failed to parse JSON from AI output:", e);
    console.warn("safeParseJSON: Raw text was:", text.substring(0, 200));
    return null;
  }
};

export const createChatSession = (): Chat => {
  const ai = getGeminiClient();
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      temperature: 0.1,
      maxOutputTokens: 8192,
      tools: [{ googleSearch: {} }],
      safetySettings: [...DEFAULT_SAFETY_SETTINGS]
    },
  });
};

export const chatCompletion = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[]) => {
  try {
    const ai = getGeminiClient();

    console.log("Gemini: Starting completion request...");

    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    const contents = otherMessages.map(m => ({
      role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
      parts: [{ text: m.content }]
    }));

    try {
      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: systemMessage?.content || INITIAL_SYSTEM_INSTRUCTION,
          temperature: 0.1,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }],
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        }
      });
      return stream;
    } catch (innerError: any) {
      const errStr = String(innerError.message || innerError);
      console.warn("Gemini stream error occurred:", errStr);
      // Fallback if the user has a free tier key or has hit a billing/grounding limit
      console.warn("Gemini: Retrying stream completion without Google Search tool...");
      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: systemMessage?.content || INITIAL_SYSTEM_INSTRUCTION,
          temperature: 0.1,
          maxOutputTokens: 8192,
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        }
      });
      return stream;
    }
  } catch (error) {
    console.error("Gemini: Chat Completion Error", error);
    throw error;
  }
};

export const generateText = async (
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.1,
  responseFormat?: { type: 'json_object' }
) => {
  try {
    const ai = getGeminiClient();
    const fullSystemInstruction = systemInstruction || INITIAL_SYSTEM_INSTRUCTION;

    console.log("Gemini: Starting generate text request...");

    // Build config - use responseMimeType for JSON mode instead of responseModalities
    const config: any = {
      systemInstruction: fullSystemInstruction,
      temperature,
      maxOutputTokens: 8192,
      safetySettings: [...DEFAULT_SAFETY_SETTINGS]
    };

    if (responseFormat?.type === 'json_object') {
      config.responseMimeType = 'application/json';
    }

    // Try with googleSearch tool first, fallback without it
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          ...config,
          // Only add googleSearch when NOT requesting JSON (they're incompatible)
          ...(responseFormat?.type !== 'json_object' ? { tools: [{ googleSearch: {} }] } : {})
        }
      });

      return {
        text: result.text || ""
      };
    } catch (innerError: any) {
      const errStr = String(innerError.message || innerError);
      console.warn("Gemini generateText error:", errStr);
      console.warn("Gemini: Retrying generateText without Google Search tool...");

      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config
      });

      return {
        text: result.text || ""
      };
    }
  } catch (error) {
    console.error("Gemini: Generate Text Error", error);
    throw error;
  }
};
