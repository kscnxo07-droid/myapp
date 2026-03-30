import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/patient' },
    { path: '/patient', component: () => import('../views/PatientInputView.vue') },
    { path: '/ehr', component: () => import('../views/EHRPrescriptionView.vue') }
  ]
})

export default router