<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0 rounded-4">
          <div class="card-header bg-primary text-white d-flex align-items-center">
            <i class="bi bi-file-earmark-medical me-2 fs-4"></i>
            <h5 class="mb-0">醫師 EHR 處方輔助 - 交互檢查</h5>
          </div>

          <div class="card-body p-4 p-md-5">
            <form @submit.prevent="checkInteraction">
              <div class="mb-4">
                <label for="patientId" class="form-label fw-bold">病人 ID</label>
                <input
                  id="patientId"
                  v-model="form.patientId"
                  type="text"
                  class="form-control"
                  :disabled="loading"
                />
              </div>

              <div class="mb-4">
                <label for="medication" class="form-label fw-bold">處方藥物（可選）</label>
                <input
                  id="medication"
                  v-model="form.medication"
                  type="text"
                  class="form-control"
                  placeholder="例如：Ibuprofen 400mg tid"
                  :disabled="loading"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? '檢查中...' : '檢查交互風險' }}
              </button>
            </form>

            <!-- 結果顯示 -->
            <div v-if="result" class="mt-5">
              <div class="card border-0 shadow-sm" :class="getCardClass(result.risk_level)">
                <div class="card-header d-flex align-items-center">
                  <i class="bi bi-exclamation-triangle-fill me-2" v-if="result.risk_level === 'high'"></i>
                  <h5 class="mb-0">交互風險警示</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <strong>風險等級：</strong>
                    <span class="badge" :class="getBadgeClass(result.risk_level)">
                      {{ getRiskLabel(result.risk_level) }}
                    </span>
                  </div>
                  <p class="mb-3"><strong>說明：</strong> {{ result.description }}</p>

                  <div v-if="result.suggestions && result.suggestions.length" class="mb-3">
                    <strong>建議：</strong>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <span v-for="(s, i) in result.suggestions" :key="i" class="badge bg-warning text-dark">
                        {{ s }}
                      </span>
                    </div>
                  </div>

                  <p v-if="result.needs_human_intervention" class="text-danger fw-bold">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    此處方需醫師進一步評估與調整
                  </p>
                </div>
              </div>
            </div>

            <div v-if="error" class="alert alert-danger mt-4">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  patientId: '131431142',
  medication: ''
})

const loading = ref(false)
const result = ref(null)
const error = ref('')

const checkInteraction = async () => {
  if (!form.value.patientId.trim()) {
    alert('請輸入病人 ID')
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await axios.post('http://localhost:3000/cds-services/interaction-check', {
      patientId: form.value.patientId,
      medication: form.value.medication || ''
    })

    const cards = response.data.cards || []
    if (cards.length === 0) throw new Error('後端未回傳卡片')

    const card = cards[0]

    result.value = {
      risk_level: card.indicator === 'hard-stop' ? 'high' : card.indicator === 'warning' ? 'medium' : 'low',
      description: card.detail || '無詳細說明',
      suggestions: card.suggestions ? card.suggestions.map(s => s.label) : [],
      needs_human_intervention: card.indicator === 'hard-stop'
    }
  } catch (err) {
    error.value = err.message || '檢查失敗，請確認後端是否運行'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const getRiskLabel = (level) => {
  const map = { high: '高風險', medium: '中風險', low: '低風險' }
  return map[level] || '未知'
}

const getCardClass = (level) => {
  const map = {
    high: 'border-danger bg-danger-subtle',
    medium: 'border-warning bg-warning-subtle',
    low: 'border-success bg-success-subtle'
  }
  return map[level] || 'border-info bg-info-subtle'
}

const getBadgeClass = (level) => {
  const map = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-success' }
  return map[level] || 'bg-secondary'
}
</script>