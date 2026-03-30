// server/routes/cds-hooks.js
const express = require('express');
const router = express.Router();
const { analyzeInteraction } = require('../services/aiService');
const { getObservationHistory } = require('../services/fhirService');

router.get('/cds-services', (req, res) => {
  res.json({ services: [{ hook: 'medication-prescribe', title: '藥物交互檢查服務' }] });
});

router.post('/cds-services/interaction-check', async (req, res) => {
  const { patientId = '131431142', medication = '' } = req.body;

  console.log(`[CDS] 收到請求 → 病人ID: ${patientId} | 處方藥物: "${medication || '(留空)'}"`);

  try {
    // 情況 1：有輸入處方藥物 → 強制呼叫 Gemini AI
    if (medication && medication.trim() !== '') {
      const inputText = `病人 ${patientId} 新開藥物：${medication}`;
      console.log(`[CDS] 有新處方 → 呼叫 Gemini AI`);

      const aiResult = await analyzeInteraction(inputText);

      return res.json({
        cards: [{
          summary: aiResult.risk_level === 'high' ? '⚠️ 高風險藥物交互警示' : '藥物交互提醒',
          indicator: aiResult.risk_level === 'high' ? 'hard-stop' : 'warning',
          detail: aiResult.description,
          suggestions: (aiResult.suggestions || []).map(s => ({ label: s }))
        }]
      });
    }

    // 情況 2：處方藥物留空 → 顯示最新歷史警示
    console.log(`[CDS] 處方留空 → 顯示最新歷史警示`);
    const history = await getObservationHistory(patientId);

    if (history.length > 0) {
      const latest = history[0].resource;
      let noteText = latest.note?.[0]?.text || '曾有藥物交互風險記錄';

      // 更積極地截短，避免顯示過長說明
      if (noteText.length > 150) {
        noteText = noteText.substring(0, 150) + '...（點擊查看詳細）';
      }

      return res.json({
        cards: [{
          summary: '最新藥物交互警示',
          indicator: 'warning',
          detail: noteText,
          suggestions: [
            { label: '查看詳細歷史記錄' },
            { label: '建議重新評估目前處方' }
          ]
        }]
      });
    }

    // 情況 3：完全沒有歷史 → 一般檢查
    console.log(`[CDS] 無歷史記錄 → 進行一般檢查`);
    const aiResult = await analyzeInteraction(`檢查病人 ${patientId} 目前用藥風險`);

    return res.json({
      cards: [{
        summary: '目前用藥風險檢查',
        indicator: 'info',
        detail: aiResult.description,
        suggestions: (aiResult.suggestions || []).map(s => ({ label: s }))
      }]
    });

  } catch (err) {
    console.error('[CDS] 錯誤:', err.message);
    res.status(500).json({
      cards: [{
        summary: '系統錯誤',
        indicator: 'warning',
        detail: '無法取得資料，請稍後再試',
        suggestions: [{ label: '請醫師人工判斷' }]
      }]
    });
  }
});

module.exports = router;