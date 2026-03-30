// server/services/fhirService.js
const axios = require('axios');

const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'http://hapi.fhir.org/baseR4';

/**
 * 儲存 Observation（病人端查詢結果）
 */
async function saveObservation(patientId, analysisResult) {
  const observation = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{ system: "http://loinc.org", code: "80615-8", display: "Drug Interaction Alert" }]
    },
    subject: { reference: `Patient/${patientId}` },
    valueQuantity: {
      value: analysisResult.risk_level === 'high' ? 8 : analysisResult.risk_level === 'medium' ? 5 : 2,
      unit: "risk score"
    },
    note: [{ 
      text: `${analysisResult.description}\n建議：${(analysisResult.suggestions || []).join('、')}` 
    }],
    effectiveDateTime: new Date().toISOString()
  };

  try {
    const res = await axios.post(`${FHIR_BASE_URL}/Observation`, observation, {
      headers: { 'Content-Type': 'application/fhir+json' }
    });
    console.log(`✅ FHIR Observation 儲存成功 ID: ${res.data.id}`);
    return res.data;
  } catch (err) {
    console.error('❌ FHIR 儲存失敗:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * 讀取病人歷史交互警示記錄 - 只取最近的 5 筆，並按時間倒序
 */
async function getObservationHistory(patientId) {
  try {
    const res = await axios.get(
      `${FHIR_BASE_URL}/Observation?patient=${patientId}&code=80615-8&_sort=-date&_count=5`, 
      {
        headers: { 'Accept': 'application/fhir+json' }
      }
    );
    
    const entries = res.data.entry || [];
    console.log(`✅ 取得病人 ${patientId} 最新歷史警示，共 ${entries.length} 筆（已排序）`);
    
    return entries;
  } catch (err) {
    console.error('❌ 讀取歷史警示失敗:', err.response?.data || err.message);
    return [];
  }
}

/**
 * 讀取病人用藥歷史（未來擴充用）
 */
async function getMedicationHistory(patientId) {
  try {
    const res = await axios.get(`${FHIR_BASE_URL}/MedicationStatement?patient=${patientId}`, {
      headers: { 'Accept': 'application/fhir+json' }
    });
    return res.data.entry || [];
  } catch (err) {
    console.error('❌ 讀取用藥歷史失敗:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { 
  saveObservation, 
  getObservationHistory, 
  getMedicationHistory 
};