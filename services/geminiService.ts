import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  let apiKey = '';
  try {
    // Robust check for process.env
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env", e);
  }

  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const polishReason = async (input: string, type: 'OVERTIME' | 'LEAVE'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
      console.warn("API Key missing or client not initialized");
      return input;
  }

  const typeText = type === 'OVERTIME' ? '加班' : '補休';

  const prompt = `
    你是一位專業的人資助理。請幫我潤飾以下「${typeText}申請」的原因，使其語氣更專業、簡潔且清晰。
    請使用繁體中文 (Traditional Chinese)。
    不要捏造事實，僅改善語氣和語法。
    
    輸入: "${input}"
    
    只需輸出潤飾後的文字。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return input; // Fallback to original
  }
};