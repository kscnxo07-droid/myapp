<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0 rounded-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">病人用藥交互查詢</h5>
          </div>
          <div class="card-body p-5">
            <form @submit.prevent="submit">
              <textarea v-model="form.text" class="form-control mb-3" rows="5" placeholder="輸入用藥描述..."></textarea>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                {{ loading ? '分析中...' : '送出查詢' }}
              </button>
            </form>

            <div v-if="result" class="mt-4 alert" :class="getAlertClass(result.risk_level)">
              <h5>風險等級：{{ getRiskLabel(result.risk_level) }}</h5>
              <p>{{ result.description }}</p>
              <div v-if="result.suggestions?.length">
                <strong>建議：</strong>
                <span v-for="(s,i) in result.suggestions" :key="i" class="badge bg-success me-2">{{ s }}</span>
              </div>
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

const form = ref({ text: '' })
const loading = ref(false)
const result = ref(null)

const submit = async () => {
  if (!form.value.text) return
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/interaction/analyze', { text: form.value.text })
    result.value = res.data
  } catch (e) {
    alert('分析失敗')
  } finally {
    loading.value = false
  }
}

const getRiskLabel = (l) => ({ high:'高風險', medium:'中風險', low:'低風險' })[l] || '未知'
const getAlertClass = (l) => ({ high:'alert-danger', medium:'alert-warning', low:'alert-success' })[l] || 'alert-info'
</script>