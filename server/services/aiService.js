// server/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * 使用 Gemini 分析藥物交互風險（嚴格結構化輸出）
 */
async function analyzeInteraction(text) {
  const prompt = `
你是一位台灣臨床藥師，專精藥物交互作用分析。

請嚴格依照以下 JSON 格式輸出，不要有任何額外文字、markdown 或解釋：

{
  "risk_level": "high" | "medium" | "low",
  "description": "用一句話精準描述交互風險（限 40 字以內）",
  "suggestions": ["建議事項1", "建議事項2"],
  "needs_human_intervention": true | false,
  "evidence": "參考來源（例如：UpToDate、台灣藥物交互資料庫、臨床指引）"
}

病人用藥描述：${text}

請只輸出純 JSON。
`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // 清理可能的 markdown 或多餘文字
    responseText = responseText.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    console.error('Gemini 分析失敗:', error);
    // Fallback 安全回應
    return {
      risk_level: "medium",
      description: "系統無法完成分析，請醫師人工判斷交互風險",
      suggestions: ["請參考最新藥物交互資料庫", "必要時諮詢藥師"],
      needs_human_intervention: true,
      evidence: "系統錯誤"
    };
  }
}

module.exports = { analyzeInteraction };