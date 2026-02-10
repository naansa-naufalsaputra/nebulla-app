/// <reference types="vite/client" />
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const MODELS_TO_TRY = [
  "gemini-3-flash-preview",  // PRIORITAS UTAMA: Versi 3 Flash (Cepat & Hemat)
  "gemini-3-pro-preview",    // CADANGAN: Versi 3 Pro (Untuk tugas berat)
  "gemini-flash-latest"      // JAGA-JAGA: Fallback terakhir jika V3 preview down
];

class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  }

  // Ensure client is re-initialized with latest key if using specific features
  private async ensureFreshClient() {
    this.genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  }

  // Real-time Handwriting OCR using Gemini 3 Pro (Vision)
  async transcribeHandwriting(base64Image: string): Promise<string> {
    try {
      await this.ensureFreshClient();
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-pro-image-preview', // High quality vision model
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image
              }
            },
            {
              text: "Transcribe the handwritten text in this image accurately. Output only the transcribed text. If there is math, output it in LaTeX format wrapped in $."
            }
          ]
        },
        config: {
          temperature: 0.1,
        }
      });
      return response.text || "";
    } catch (error: any) {
      console.error("OCR Error:", error);
      if (error.message?.includes('429') || error.status === 429) {
        throw new Error('Gemini sedang beristirahat sebentar, coba lagi dalam 30 detik');
      }
      throw error;
    }
  }

  // AI Assistant with Search Grounding (One-off)
  async askAssistant(query: string, context?: string): Promise<{ text: string; links: any[] }> {
    try {
      await this.ensureFreshClient();
      const prompt = context
        ? `Context from notes:\n${context}\n\nUser Query: ${query}`
        : query;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web) || [];

      return {
        text: response.text || "I couldn't generate a response.",
        links: links
      };
    } catch (error: any) {
      console.error("Search Error:", error);
      if (error.message?.includes('429') || error.status === 429) {
        return { text: "Gemini sedang beristirahat sebentar, coba lagi dalam 30 detik", links: [] };
      }
      return { text: "Error connecting to AI.", links: [] };
    }
  }

  // Streaming Chat Assistant
  // Streaming Chat Assistant with Smart Fallback
  async *askAssistantStream(query: string, context?: string) {
    await this.ensureFreshClient();

    const systemInstruction = context
      ? `You are Nebulla AI, a helpful assistant inside a note-taking app. \n\nCURRENT NOTE CONTEXT:\n${context}\n\nAnswer the user's questions based on this context if relevant.`
      : `You are Nebulla AI, a helpful assistant inside a note-taking app.`;

    let lastError: any;

    for (const model of MODELS_TO_TRY) {
      try {
        const responseStream = await this.genAI.models.generateContentStream({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: query }] }
          ],
          config: {
            systemInstruction: systemInstruction,
          }
        });

        // Give feedback if we switched to a backup model
        if (model !== MODELS_TO_TRY[0]) {
          yield `_[Menggunakan Model Cadangan: ${model} karena kepadatan server...]_ \n\n`;
        }

        for await (const chunk of responseStream) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            yield c.text;
          }
        }

        // Success! Exit the function.
        return;

      } catch (error: any) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;

        // Loop continues to next model...
      }
    }

    // If loop finishes, all models failed
    console.error("All models failed:", lastError);
    if (lastError?.message?.includes('429') || lastError?.status === 429) {
      yield "Maaf, semua jalur Gemini sedang sibuk. Mohon tunggu sebentar.";
    } else {
      yield "Maaf, terjadi kesalahan koneksi ke AI.";
    }
  }

  // Solve Math using Gemini 3 Pro Reasoning
  async solveMath(problem: string): Promise<string> {
    try {
      await this.ensureFreshClient();
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Solve this math problem step-by-step and provide the final answer in LaTeX: ${problem}`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 } // Allow some thinking
        }
      });
      return response.text || "";
    } catch (error) {
      console.error("Math Solver Error:", error);
      throw error;
    }
  }

  async brainstorm(context: string): Promise<string> {
    try {
      await this.ensureFreshClient();
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a creative partner. Based on this content: "${context}", provide 3-5 creative expansion ideas or related concepts. Keep it concise.`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Brainstorm Error:", error);
      throw error;
    }
  }

  // Analyze entire note
  async analyzeNote(content: string): Promise<{ summary: string; actionItems: string[]; topics: string[] }> {
    try {
      await this.ensureFreshClient();
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following notes. Provide a brief summary, a list of actionable items (if any), and 3 related topics to explore.\n\nNotes:\n${content}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Analysis Error:", error);
      return { summary: "Analysis failed.", actionItems: [], topics: [] };
    }
  }

  // Generate Contextual Suggestions
  async generateSuggestions(context: string): Promise<string[]> {
    try {
      await this.ensureFreshClient();
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following note content, generate 3 short, relevant questions or prompts that the user might want to ask an AI assistant. Output ONLY a JSON array of strings.\n\nNote Content:\n${context.substring(0, 2000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Suggestion Error:", error);
      return [];
    }
  }

  // Veo Video Generation
  async animateDiagram(base64Image: string, prompt: string): Promise<string | null> {
    // Check for API Key selection (required for Veo)
    if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
      // Re-initialize client after key selection
      await this.ensureFreshClient();
    }

    try {
      // Create operation
      let operation = await this.genAI.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Image,
          mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await this.genAI.operations.getVideosOperation({ operation: operation });
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) return null;

      // Append API key for fetching
      return `${videoUri}&key=${import.meta.env.VITE_GEMINI_API_KEY}`;
    } catch (error) {
      console.error("Veo Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();