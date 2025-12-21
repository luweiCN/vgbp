import { GoogleGenAI, Type } from "@google/genai";
import { Hero } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 用于在组件外部触发分析的回调函数
let analyticsCallback: ((eventName: string, props?: any) => void) | null = null;

export const setAnalyticsCallback = (callback: (eventName: string, props?: any) => void) => {
  analyticsCallback = callback;
};

export const getDraftAnalysis = async (unavailableHeroes: Hero[]): Promise<any> => {
  const startTime = Date.now();
  const unavailableNames = unavailableHeroes.map(h => h.name).join(', ');

  // 追踪 AI 请求事件
  if (analyticsCallback) {
    analyticsCallback('aiAdviceRequested', { heroCount: unavailableHeroes.length });
  }

  const systemInstruction = `You are a professional eSports coach for the game Vainglory.
  Your goal is to analyze the current draft state.
  The user will provide a list of heroes that are currently "Picked" or "Banned" (unavailable).
  You should suggest 3 strong heroes that remain available to pick, and explain why they are good in the current meta or general play.
  Also, identify if the unavailable list implies a specific strategy (e.g., if lots of Captains are gone).
  Keep the analysis concise and tactical.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The following heroes are currently unavailable (picked or banned): ${unavailableNames || "None"}. Suggest what to pick next.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                analysis: { type: Type.STRING, description: "A brief tactical analysis of what is missing or what style is being played." },
                suggestedPicks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 3 suggested hero names."
                },
                threats: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of potential counter-picks the enemy might take."
                }
            },
            required: ["analysis", "suggestedPicks", "threats"]
        }
      },
    });

    const responseTime = Date.now() - startTime;

    // 追踪 AI 响应时间
    if (analyticsCallback) {
      analyticsCallback('aiAdviceReceived', { responseTime });
    }

    const result = JSON.parse(response.text || '{}');

    // 追踪 AI 建议显示事件
    if (result && result.suggestedPicks && result.suggestedPicks.length > 0 && analyticsCallback) {
      analyticsCallback('aiAdviceShown');
    }

    return result;
  } catch (error) {
    // 追踪错误事件
    if (analyticsCallback) {
      analyticsCallback('errorOccurred', {
        errorType: 'ai_advice_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    console.error("Gemini API Error:", error);
    throw error;
  }
};
