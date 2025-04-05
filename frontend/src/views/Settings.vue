<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <!-- General Settings -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">General Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Dark Mode</h3>
            <p class="text-sm text-gray-500">Enable dark mode for better visibility in low-light conditions</p>
          </div>
          <button
            @click="toggleDarkMode"
            class="px-4 py-2 rounded-lg"
            :class="isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'"
          >
            {{ isDarkMode ? 'On' : 'Off' }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Offline Mode</h3>
            <p class="text-sm text-gray-500">Enable offline data storage and sync</p>
          </div>
          <button
            @click="toggleOfflineMode"
            class="px-4 py-2 rounded-lg"
            :class="isOfflineMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'"
          >
            {{ isOfflineMode ? 'On' : 'Off' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Energy Monitor Settings -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Energy Monitor Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Auto-sync Interval</h3>
            <p class="text-sm text-gray-500">How often to sync energy data with the server</p>
          </div>
          <select
            v-model="syncInterval"
            class="px-4 py-2 rounded-lg border border-gray-300"
          >
            <option value="5000">5 seconds</option>
            <option value="10000">10 seconds</option>
            <option value="30000">30 seconds</option>
            <option value="60000">1 minute</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Low Battery Alert</h3>
            <p class="text-sm text-gray-500">Set the battery level threshold for alerts</p>
          </div>
          <div class="flex items-center">
            <input
              type="range"
              v-model="lowBatteryThreshold"
              min="10"
              max="30"
              step="5"
              class="w-32 mr-4"
            />
            <span class="text-lg font-medium">{{ lowBatteryThreshold }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Input Settings -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Voice Input Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Voice Recognition</h3>
            <p class="text-sm text-gray-500">Enable voice input for diagnosis forms</p>
          </div>
          <button
            @click="toggleVoiceRecognition"
            class="px-4 py-2 rounded-lg"
            :class="isVoiceRecognitionEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'"
          >
            {{ isVoiceRecognitionEnabled ? 'On' : 'Off' }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Language</h3>
            <p class="text-sm text-gray-500">Select voice recognition language</p>
          </div>
          <select
            v-model="voiceLanguage"
            class="px-4 py-2 rounded-lg border border-gray-300"
          >
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="sw-KE">Swahili</option>
          </select>
        </div>
      </div>
    </div>

    <!-- System Information -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">System Information</h2>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">App Version</span>
          <span class="font-medium">{{ appVersion }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Last Sync</span>
          <span class="font-medium">{{ lastSyncTime || 'Never' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Storage Used</span>
          <span class="font-medium">{{ storageUsed }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Connection Status</span>
          <span class="font-medium" :class="isOnline ? 'text-green-600' : 'text-red-600'">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { energyService } from '@/services/energyService';
import { voiceService } from '@/services/voiceService';

const isDarkMode = ref(false);
const isOfflineMode = ref(true);
const isVoiceRecognitionEnabled = ref(false);
const syncInterval = ref('5000');
const lowBatteryThreshold = ref(20);
const voiceLanguage = ref('en-US');
const appVersion = ref('1.0.0');
const lastSyncTime = ref(null);
const storageUsed = ref('0 MB');
const isOnline = ref(navigator.onLine);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDarkMode.value);
};

const toggleOfflineMode = () => {
  isOfflineMode.value = !isOfflineMode.value;
  localStorage.setItem('offlineMode', isOfflineMode.value);
};

const toggleVoiceRecognition = () => {
  isVoiceRecognitionEnabled.value = !isVoiceRecognitionEnabled.value;
  if (isVoiceRecognitionEnabled.value) {
    voiceService.init();
  } else {
    voiceService.stopListening();
  }
  localStorage.setItem('voiceRecognition', isVoiceRecognitionEnabled.value);
};

const updateSyncInterval = () => {
  energyService.stopPolling();
  energyService.startPolling(parseInt(syncInterval.value));
  localStorage.setItem('syncInterval', syncInterval.value);
};

const updateLowBatteryThreshold = () => {
  localStorage.setItem('lowBatteryThreshold', lowBatteryThreshold.value);
};

const updateVoiceLanguage = () => {
  voiceService.setLanguage(voiceLanguage.value);
  localStorage.setItem('voiceLanguage', voiceLanguage.value);
};

const calculateStorageUsed = async () => {
  try {
    const storage = await navigator.storage.estimate();
    const used = storage.usage / (1024 * 1024);
    storageUsed.value = `${used.toFixed(2)} MB`;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }
};

onMounted(() => {
  // Load saved settings
  isDarkMode.value = localStorage.getItem('darkMode') === 'true';
  isOfflineMode.value = localStorage.getItem('offlineMode') !== 'false';
  isVoiceRecognitionEnabled.value = localStorage.getItem('voiceRecognition') === 'true';
  syncInterval.value = localStorage.getItem('syncInterval') || '5000';
  lowBatteryThreshold.value = parseInt(localStorage.getItem('lowBatteryThreshold') || '20');
  voiceLanguage.value = localStorage.getItem('voiceLanguage') || 'en-US';

  // Apply dark mode if enabled
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  }

  // Set up event listeners
  window.addEventListener('online', () => isOnline.value = true);
  window.addEventListener('offline', () => isOnline.value = false);

  // Calculate storage usage
  calculateStorageUsed();
});

onUnmounted(() => {
  window.removeEventListener('online', () => isOnline.value = true);
  window.removeEventListener('offline', () => isOnline.value = false);
});
</script>
