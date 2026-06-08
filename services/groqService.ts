
import { GoogleGenAI } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

let client: GoogleGenAI | null = null;

export const getGroqClient = (): GoogleGenAI => {
    if (!client) {
        const apiKey =
            import.meta.env.VITE_GEMINI_API_KEY ||
            import.meta.env.VITE_API_KEY ||
            (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) ||
            (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set. Please ensure you have it in your .env or .env.local file.");
        }
        client = new GoogleGenAI({ apiKey });
    }
    return client;
};

export const chatCompletion = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[]) => {
    try {
        const ai = getGroqClient();

        console.log("Gemini: Starting completion request...");

        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');

        const contents = otherMessages.map(m => ({
            role: m.role as 'user' | 'model',
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
            }
        });

        return stream;
    } catch (error) {
        console.error("Gemini: Chat Completion Error", error);
        throw error;
    }
};

export const generateText = async (prompt: string, systemInstruction?: string, temperature: number = 0.1, responseFormat?: { type: 'json_object' }) => {
    try {
        const ai = getGroqClient();

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
