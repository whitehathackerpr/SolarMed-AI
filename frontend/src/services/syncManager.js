import { ref } from 'vue';
import { notificationService } from './notificationService';

class SyncManager {
  constructor() {
    this.isSyncing = ref(false);
    this.lastSyncTime = ref(null);
    this.syncQueue = [];
    this.registration = null;
  }

  async initialize() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      this.registration = await navigator.serviceWorker.ready;
      this.setupBackgroundSync();
    }
  }

  setupBackgroundSync() {
    if (this.registration) {
      this.registration.sync.register('sync-data')
        .then(() => {
          console.log('Background sync registered');
        })
        .catch(err => {
          console.error('Background sync registration failed:', err);
        });
    }
  }

  async addToSyncQueue(data) {
    this.syncQueue.push(data);
    await this.trySync();
  }

  async trySync() {
    if (this.isSyncing.value || !navigator.onLine) {
      return;
    }

    this.isSyncing.value = true;
    notificationService.info('Syncing data...');

    try {
      while (this.syncQueue.length > 0) {
        const data = this.syncQueue[0];
        await this.syncData(data);
        this.syncQueue.shift();
      }

      this.lastSyncTime.value = new Date();
      notificationService.success('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      notificationService.error('Sync failed. Will retry when online.');
    } finally {
      this.isSyncing.value = false;
    }
  }

  async syncData(data) {
    // Implement your actual sync logic here
    // This is a placeholder that should be replaced with your API calls
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing.value,
      lastSyncTime: this.lastSyncTime.value,
      queueLength: this.syncQueue.length,
      isOnline: navigator.onLine,
    };
  }
}

export const syncManager = new SyncManager(); 