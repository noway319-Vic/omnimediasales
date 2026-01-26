import { GoogleGenAI } from "@google/genai";

export const polishReason = async (input: string, type: 'OVERTIME' | 'LEAVE'): Promise<string> => {
  // 安全取得 API Key
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
  
  if (!apiKey) {
    console.warn(" Gemini API Key is not available in process.env");
    return input;
  }

  const ai = new GoogleGenAI({ apiKey });
  const typeText = type === 'OVERTIME' ? '加班' : '補休';

  const prompt = `
    你是一位專業的人資助理。請幫我潤飾以下「${typeText}申請」的原因，使其語氣更專業、簡潔且清晰。
    請使用繁體中文 (Traditional Chinese)。
    不要捏造事實，僅改善語氣和語法。
    
    輸入: "${input}"
    
    只需輸出潤飾後的文字，不要包含任何解釋。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text ? response.text.trim() : input;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return input;
  }
};