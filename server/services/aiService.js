// server/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function analyzeInteraction(text) {
  const prompt = `
  你是一位台灣臨床藥師。請嚴格依照以下 JSON 格式輸出，不要有任何其他文字：

  {
    "risk_level": "high" | "medium" | "low",
    "description": "一句話精準描述交互風險（限40字）",
    "suggestions": ["建議1", "建議2"],
    "needs_human_intervention": true | false,
    "evidence": "參考來源"
  }

  病人描述：${text}
  請只輸出純 JSON。
  `;

  try {
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text().trim();
    textResponse = textResponse.replace(/```json|```/g, '').trim();
    
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini 呼叫失敗:", error.message);
    return {
      risk_level: "medium",
      description: "系統無法完成分析，請醫師人工判斷交互風險",
      suggestions: ["請參考最新藥物交互資料", "必要時諮詢藥師"],
      needs_human_intervention: true,
      evidence: "系統錯誤"
    };
  }
}

module.exports = { analyzeInteraction };