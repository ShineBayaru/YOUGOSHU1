
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  async explainTerm(term: string, context: string, lang: string = 'mn') {
    // Create a fresh instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const langNames: Record<string, string> = {
        mn: 'Mongolian',
        en: 'English',
        jp: 'Japanese'
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the technical term "${term}" (Context: ${context}) in the manufacturing/engineering field. Provide a detailed explanation strictly in ${langNames[lang] || 'Mongolian'}. Also provide a few real-world examples and related technical terms in the same language.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              examples: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
              },
              relatedTerms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
              }
            },
            required: ["explanation", "examples", "relatedTerms"]
          }
        }
      });

      let text = response.text || '{}';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e: any) {
      console.error("Failed to fetch or parse AI response", e);
      
      // Check for specific "entity not found" error to potentially reset key state
      if (e.message?.includes("Requested entity was not found") && window.aistudio?.openSelectKey) {
        window.aistudio.openSelectKey();
      }
      
      return null;
    }
  }
}

export const geminiService = new GeminiService();
