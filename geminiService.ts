
import { GoogleGenAI } from "@google/genai";
import { Spot, CategoryConfig } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCariocaAdvice = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `Você é o "Carioca AI", um guia local especialista e apaixonado pelo Rio de Janeiro. 
        Seu tom é amigável, usa algumas gírias cariocas leves (como "mermão", "valeu", "show", "fechou"), mas é sempre útil e preciso. 
        Dê dicas de restaurantes, bares, praias e eventos culturais. 
        Se o usuário perguntar por algo fora do Rio, gentilmente lembre-o que você é especialista na Cidade Maravilhosa.
        Sempre formate a resposta em Markdown para facilitar a leitura.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Ih, deu um ruim aqui no sistema! Tenta de novo em um minutinho, valeu?";
  }
};

export const translateContent = async (
  spots: Spot[], 
  categories: CategoryConfig[], 
  targetLang: 'en' | 'es'
): Promise<{ spots: Spot[], categories: CategoryConfig[] }> => {
  try {
    const prompt = `
      You are a professional translator. Translate the following JSON data from Portuguese to ${targetLang === 'en' ? 'English' : 'Spanish'}.
      
      1. Translate the 'description' and 'name' fields of the spots.
      2. Translate the 'category' field of the spots so it matches the translated category names.
      3. Translate the 'name' field of the category objects.
      
      IMPORTANT: 
      - Keep all other fields ('id', 'images', 'rating', 'address', 'icon', 'color', 'neighborhood', 'link') EXACTLY as they are.
      - Ensure the 'category' in the spots matches the 'name' in the categories list perfectly.
      - Return ONLY the raw JSON object with keys "spots" and "categories". Do not add markdown blocks.

      Input Data:
      ${JSON.stringify({ spots, categories })}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    // Remove markdown code blocks if present just in case
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Erro na tradução:", error);
    // Em caso de erro, retorna os dados originais para não quebrar a UI
    return { spots, categories };
  }
};
