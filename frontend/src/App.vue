<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-primary shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center">
          <h1 class="text-white text-xl font-bold">SolarMed AI</h1>
        </div>
        <div class="flex items-center">
          <div class="mr-4 text-white text-sm" v-if="isOnline">
            <span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
            Online
          </div>
          <div class="mr-4 text-white text-sm" v-else>
            <span class="inline-block w-2 h-2 rounded-full bg-red-400 mr-1"></span>
            Offline
          </div>
          <div class="text-white text-sm">
            <span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
            Battery: {{ batteryLevel }}%
          </div>
        </div>
      </div>
    </header>
    
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-4">
        <div class="flex space-x-4 overflow-x-auto py-3">
          <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.path === '/' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100']">
            Dashboard
          </router-link>
          <router-link to="/patient-intake" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.path === '/patient-intake' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100']">
            Patient Intake
          </router-link>
          <router-link to="/energy-monitor" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.path === '/energy-monitor' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100']">
            Energy Monitor
          </router-link>
          <router-link to="/settings" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.path === '/settings' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100']">
            Settings
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
    
    <div v-if="showToast" class="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isOnline: navigator.onLine,
      batteryLevel: 85,
      showToast: false,
      toastMessage: '',
      toastTimeout: null
    }
  },
  created() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    
    // Simulate battery level updates
    setInterval(() => {
      // Random fluctuation between -2 and +1
      const change = Math.floor(Math.random() * 4) - 2;
      this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel + change));
    }, 30000);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      this.showToastMessage(navigator.onLine ? 'Connected to network' : 'Offline mode active');
    },
    showToastMessage(message, duration = 3000) {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      this.toastMessage = message;
      this.showToast = true;
      
      this.toastTimeout = setTimeout(() => {
        this.showToast = false;
      }, duration);
    }
  }
}
</script>
