import { GoogleGenerativeAI } from "@google/generative-ai";

const TARGET_MODELS = ["gemini-3-flash-preview", "gemini-3-pro-preview"];

/**
 * Ask Gemini 3 AI a question and get a response
 * Uses Gemini 3 Flash Preview first (fastest), falls back to Pro Preview if needed
 * @param prompt - The user's prompt/question
 * @returns The AI-generated response text
 */
export const askGemini = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("API Key belum diset di .env (VITE_GOOGLE_API_KEY)");
    }

    if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt cannot be empty');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;

    // Loop: Coba Flash dulu, kalau gagal baru Pro
    for (const modelName of TARGET_MODELS) {
        try {
            console.log(`🤖 Menghubungi ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ Sukses menggunakan ${modelName}`);
                return text; // Sukses!
            }
        } catch (error: any) {
            console.warn(`⚠️ ${modelName} gagal:`, error.message);
            lastError = error;
        }
    }

    // Jika semua model gagal
    throw new Error(`Gagal menghubungi Gemini 3 (Flash/Pro). Cek kuota atau API Key. Details: ${lastError?.message || 'Unknown'}`);
};
