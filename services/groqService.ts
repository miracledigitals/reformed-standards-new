import Groq from "groq-sdk";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

let client: Groq | null = null;

export const getGroqClient = (): Groq => {
    if (!client) {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            throw new Error("VITE_GROQ_API_KEY environment variable is not set. Please ensure you have it in your .env or .env.local file.");
        }
        client = new Groq({
            apiKey,
            dangerouslyAllowBrowser: true // Necessary for client-side Vite apps
        });
    }
    return client;
};

export const chatCompletion = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[]) => {
    const groq = getGroqClient();

    // Prepend system instruction if not present
    const fullMessages = [
        { role: 'system', content: INITIAL_SYSTEM_INSTRUCTION },
        ...messages
    ];

    const completion = await groq.chat.completions.create({
        messages: fullMessages as any,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 8192,
        stream: true,
    });

    return completion;
};
