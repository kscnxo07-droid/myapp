// server/routes/cds-hooks.js
const express = require('express');
const router = express.Router();
const { analyzeInteraction } = require('../services/aiService');
const { getObservationHistory } = require('../services/fhirService');

router.get('/cds-services', (req, res) => {
  res.json({
    services: [{
      hook: 'medication-prescribe',
      title: '藥物交互檢查服務',
      description: '醫師開方時自動檢查交互風險'
    }]
  });
});

router.post('/cds-services/interaction-check', async (req, res) => {
  const { patientId = '131431142', medication } = req.body;

  try {
    // Step 1: 先檢查歷史警示記錄
    const history = await getObservationHistory(patientId);
    if (history.length > 0) {
      const latest = history[0].resource;
      return res.json({
        cards: [{
          summary: '歷史警示提醒',
          indicator: 'warning',
          detail: latest.note?.[0]?.text || '病人曾有高風險交互記錄',
          suggestions: [{ label: '查看詳細歷史記錄', uuid: 'history-1' }]
        }]
      });
    }

    // Step 2: 沒有歷史 → Gemini 真實分析
    const text = medication ? `病人 ${patientId} 新開藥物：${medication}` : `檢查病人 ${patientId} 目前用藥風險`;
    const aiResult = await analyzeInteraction(text);

    res.json({
      cards: [{
        summary: aiResult.risk_level === 'high' ? '⚠️ 高風險藥物交互警示' : '藥物交互提醒',
        indicator: aiResult.risk_level === 'high' ? 'hard-stop' : 'warning',
        detail: aiResult.description,
        suggestions: aiResult.suggestions.map((s, i) => ({ label: s, uuid: `sug-${i}` }))
      }]
    });
  } catch (err) {
    console.error('醫師端 CDS Hooks 錯誤：', err);
    res.status(500).json({ error: '系統處理失敗' });
  }
});

module.exports = router;