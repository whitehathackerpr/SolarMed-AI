// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/tailwind.css'

// Initialize the app
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

// Set up online/offline event listeners
window.addEventListener('online', () => {
  store.dispatch('updateOnlineStatus', true)
  store.dispatch('addNotification', {
    message: 'Connected to network',
    type: 'success'
  })
})

window.addEventListener('offline', () => {
  store.dispatch('updateOnlineStatus', false)
  store.dispatch('addNotification', {
    message: 'Offline mode active',
    type: 'warning'
  })
})

// Load settings and initial data
store.dispatch('loadSettings')
store.dispatch('fetchEnergyStatus')
store.dispatch('fetchSyncStatus')

// Simulate energy monitoring (in a real app, this would come from hardware)
setInterval(() => {
  if (Math.random() > 0.7) { // Only update occasionally to avoid too many updates
    store.dispatch('simulateEnergyLog')
  }
}, 60000) // Every minute
