import axios from 'axios';
import { offlineStorage } from './offlineStorage';

const API_URL = import.meta.env.VITE_API_URL;

class EnergyService {
  constructor() {
    this.pollingInterval = null;
    this.onDataUpdate = null;
  }

  async getEnergyData() {
    try {
      const response = await axios.get(`${API_URL}/energy/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching energy data:', error);
      // Try to get cached data from offline storage
      const cachedData = await offlineStorage.getLatestEnergyLog();
      return cachedData || null;
    }
  }

  async logEnergyData(data) {
    try {
      // Store locally first
      await offlineStorage.addEnergyLog({
        ...data,
        timestamp: new Date().toISOString(),
        synced: false
      });

      // Try to sync with server
      if (navigator.onLine) {
        await this.syncEnergyData();
      }
    } catch (error) {
      console.error('Error logging energy data:', error);
    }
  }

  async syncEnergyData() {
    try {
      const unsyncedLogs = await offlineStorage.getUnsyncedEnergyLogs();
      
      for (const log of unsyncedLogs) {
        try {
          await axios.post(`${API_URL}/energy/log/`, log);
          await offlineStorage.markEnergyLogAsSynced(log.id);
        } catch (error) {
          console.error('Error syncing energy log:', error);
          break; // Stop syncing if we encounter an error
        }
      }
    } catch (error) {
      console.error('Error during energy data sync:', error);
    }
  }

  startPolling(interval = 5000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      const data = await this.getEnergyData();
      if (data && this.onDataUpdate) {
        this.onDataUpdate(data);
      }
    }, interval);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  setOnDataUpdate(callback) {
    this.onDataUpdate = callback;
  }

  // Helper methods for calculating power metrics
  calculateBatteryHealth(batteryLevel, voltage) {
    // Simple battery health calculation
    const health = (batteryLevel / 100) * (voltage / 12.6);
    return Math.min(Math.max(health * 100, 0), 100);
  }

  calculatePowerEfficiency(solarPower, powerUsage) {
    if (solarPower === 0) return 0;
    return (powerUsage / solarPower) * 100;
  }

  estimateBatteryLife(batteryLevel, powerUsage) {
    // Simple estimation based on current power usage
    if (powerUsage <= 0) return Infinity;
    return (batteryLevel / powerUsage) * 60; // Time in minutes
  }
}

export const energyService = new EnergyService(); 