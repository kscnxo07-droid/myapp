// server/routes/interaction.js
const express = require('express');
const router = express.Router();
const { analyzeInteraction } = require('../services/aiService');
const { saveObservation } = require('../services/fhirService');

router.post('/api/interaction/analyze', async (req, res) => {
  const { text } = req.body;
  const patientId = '131431142';   // 使用你指定的病人編號

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: '請提供有效的用藥描述文字' });
  }

  try {
    // Gemini 真實分析
    const aiResult = await analyzeInteraction(text.trim());

    // 儲存到 HAPI FHIR
    await saveObservation(patientId, aiResult);

    res.json(aiResult);
  } catch (err) {
    console.error('病人端分析錯誤：', err);
    res.status(500).json({ error: '系統分析失敗，請稍後再試' });
  }
});

module.exports = router;