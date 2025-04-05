<template>
  <div class="sync-status" :class="{ 'is-offline': !isOnline }">
    <div class="status-indicator" :class="{ 'is-syncing': isSyncing }">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div v-if="queueLength > 0" class="queue-info">
      {{ queueLength }} item(s) waiting to sync
    </div>
    <div v-if="lastSyncTime" class="last-sync">
      Last synced: {{ formattedLastSync }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { syncManager } from '../services/syncManager';

const isOnline = ref(navigator.onLine);
const isSyncing = ref(false);
const lastSyncTime = ref(null);
const queueLength = ref(0);

const statusText = computed(() => {
  if (!isOnline.value) return 'Offline';
  if (isSyncing.value) return 'Syncing...';
  return 'Online';
});

const formattedLastSync = computed(() => {
  if (!lastSyncTime.value) return 'Never';
  return new Date(lastSyncTime.value).toLocaleString();
});

function updateStatus() {
  const status = syncManager.getSyncStatus();
  isSyncing.value = status.isSyncing;
  lastSyncTime.value = status.lastSyncTime;
  queueLength.value = status.queueLength;
  isOnline.value = status.isOnline;
}

function handleOnline() {
  isOnline.value = true;
  syncManager.trySync();
}

function handleOffline() {
  isOnline.value = false;
}

onMounted(() => {
  syncManager.initialize();
  updateStatus();
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Update status every 30 seconds
  const interval = setInterval(updateStatus, 30000);
  
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(interval);
  });
});
</script>

<style scoped>
.sync-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  z-index: 1000;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #28a745;
}

.status-indicator.is-syncing .status-dot {
  background-color: #ffc107;
  animation: pulse 1.5s infinite;
}

.is-offline .status-dot {
  background-color: #dc3545;
}

.status-text {
  font-weight: 500;
}

.queue-info {
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
}

.last-sync {
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 