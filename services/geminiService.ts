import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  analyzeFinancials: async (transactions: Transaction[], period: string) => {
    const ai = getClient();
    if (!ai) return "AI Service Unavailable. Please check configuration.";

    const txSummary = transactions.map(t => 
      `${t.date.split('T')[0]}: ${t.type} ${t.isDue ? '(BAKI)' : ''} of ${t.amount} taka for ${t.category}`
    ).join('\n');

    const prompt = `
      You are an expert Bengali Business Financial Assistant.
      Analyze the following transactions for: ${period}.
      
      Transactions:
      ${txSummary}

      Please provide the output STRICTLY IN BENGALI LANGUAGE (Bangla):
      1. A summary of income vs expense (Mention if cash flow is positive).
      2. Biggest expense category.
      3. One business growth tip specific to the local context.
      
      Keep it professional, encouraging, and easy to read.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return "দুঃখিত, এই মুহূর্তে বিশ্লেষণ করা সম্ভব হচ্ছে না।";
    }
  }
};