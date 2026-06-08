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
    model: 'gemini-3.5-flash',
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

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
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

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: fullSystemInstruction,
        temperature,
        maxOutputTokens: 8192,
        responseModalities: responseFormat?.type === 'json_object' ? ['text'] as any : undefined,
        safetySettings: [...DEFAULT_SAFETY_SETTINGS]
      }
    });

    return {
      text: result.text || ""
    };
  } catch (error) {
    console.error("Gemini: Generate Text Error", error);
    throw error;
  }
};
