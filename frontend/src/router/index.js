import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/patient-intake',
    name: 'PatientIntake',
    component: () => import('../views/PatientIntake.vue')
  },
  {
    path: '/diagnosis-result/:id',
    name: 'DiagnosisResult',
    component: () => import('../views/DiagnosisResult.vue'),
    props: true
  },
  {
    path: '/energy-monitor',
    name: 'EnergyMonitor',
    component: () => import('../views/EnergyMonitor.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
