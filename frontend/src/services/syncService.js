import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';
import { patientService } from './patientService';
import { diagnosisService } from './diagnosisService';
import { energyMonitorService } from './energyMonitorService';
import { voiceToTextService } from './voiceToTextService';
import { photoUploadService } from './photoUploadService';

const API_URL = import.meta.env.VITE_API_URL;

class SyncService {
  constructor() {
    this.isSyncing = ref(false);
    this.syncProgress = ref(0);
    this.syncError = ref(null);
    this.lastSyncTime = ref(null);
    this.syncInterval = null;
  }

  async startAutoSync(interval = 300000) { // Default: 5 minutes
    try {
      // Clear any existing interval
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }

      // Start new interval
      this.syncInterval = setInterval(async () => {
        if (navigator.onLine) {
          await this.syncAll();
        }
      }, interval);

      // Initial sync
      if (navigator.onLine) {
        await this.syncAll();
      }
    } catch (error) {
      console.error('Error starting auto sync:', error);
      notificationService.error('Failed to start auto sync');
      throw error;
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll() {
    try {
      if (!navigator.onLine) {
        notificationService.warning('Cannot sync while offline');
        return;
      }

      this.isSyncing.value = true;
      this.syncProgress.value = 0;
      this.syncError.value = null;

      // Get all unsynced data
      const unsyncedData = await offlineStorage.getUnsyncedData();
      const totalItems = unsyncedData.length;
      let processedItems = 0;

      // Sync each type of data
      for (const data of unsyncedData) {
        try {
          switch (data.type) {
            case 'patient':
              await patientService.syncPatient(data.data);
              break;
            case 'diagnosis':
              await diagnosisService.syncDiagnosis(data.data);
              break;
            case 'energy':
              await energyMonitorService.syncEnergyData();
              break;
            case 'transcript':
              await voiceToTextService.syncTranscript(data.data);
              break;
            case 'photo':
              await photoUploadService.syncPhoto(data.data);
              break;
          }

          // Update progress
          processedItems++;
          this.syncProgress.value = Math.round((processedItems / totalItems) * 100);
        } catch (error) {
          console.error(`Error syncing ${data.type}:`, error);
          // Continue with next item even if one fails
        }
      }

      // Update last sync time
      this.lastSyncTime.value = new Date().toISOString();
      await offlineStorage.setLastSyncTime(this.lastSyncTime.value);

      notificationService.success('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
      this.syncError.value = error.message;
      notificationService.error('Sync failed');
      throw error;
    } finally {
      this.isSyncing.value = false;
    }
  }

  async getSyncStatus() {
    try {
      const lastSyncTime = await offlineStorage.getLastSyncTime();
      this.lastSyncTime.value = lastSyncTime;

      const unsyncedData = await offlineStorage.getUnsyncedData();
      return {
        lastSyncTime: this.lastSyncTime.value,
        unsyncedItems: unsyncedData.length,
        isSyncing: this.isSyncing.value,
        syncProgress: this.syncProgress.value,
        syncError: this.syncError.value
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  async clearSyncQueue() {
    try {
      await offlineStorage.clearSyncQueue();
      notificationService.success('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      notificationService.error('Failed to clear sync queue');
      throw error;
    }
  }

  async forceSync() {
    try {
      if (!navigator.onLine) {
        throw new Error('Cannot force sync while offline');
      }

      await this.syncAll();
    } catch (error) {
      console.error('Error during force sync:', error);
      notificationService.error('Force sync failed');
      throw error;
    }
  }

  getSyncProgress() {
    return this.syncProgress.value;
  }

  getSyncError() {
    return this.syncError.value;
  }

  getLastSyncTime() {
    return this.lastSyncTime.value;
  }

  getSyncingStatus() {
    return this.isSyncing.value;
  }
}

export const syncService = new SyncService(); 