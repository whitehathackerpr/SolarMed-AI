import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';

const API_URL = import.meta.env.VITE_API_URL;

class EnergyMonitorService {
  constructor() {
    this.energyStats = ref({
      batteryLevel: 0,
      solarInput: 0,
      powerConsumption: 0,
      estimatedRuntime: 0,
      lastUpdated: null
    });
    this.isMonitoring = ref(false);
    this.monitorInterval = null;
  }

  async startMonitoring() {
    try {
      this.isMonitoring.value = true;
      notificationService.info('Starting energy monitoring...');

      // Start periodic monitoring
      this.monitorInterval = setInterval(async () => {
        await this.updateEnergyStats();
      }, 60000); // Update every minute

      // Initial update
      await this.updateEnergyStats();
    } catch (error) {
      console.error('Error starting energy monitoring:', error);
      notificationService.error('Failed to start energy monitoring');
      throw error;
    }
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring.value = false;
    notificationService.info('Energy monitoring stopped');
  }

  async updateEnergyStats() {
    try {
      // Try to get real-time data if online
      if (navigator.onLine) {
        const response = await axios.get(`${API_URL}/energy/stats`);
        this.energyStats.value = {
          ...response.data,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Use simulated data when offline
        this.energyStats.value = {
          batteryLevel: Math.max(0, this.energyStats.value.batteryLevel - 1),
          solarInput: this.calculateSolarInput(),
          powerConsumption: this.calculatePowerConsumption(),
          estimatedRuntime: this.calculateRuntime(),
          lastUpdated: new Date().toISOString()
        };
      }

      // Store locally
      await offlineStorage.setEnergyStats(this.energyStats.value);

      // Check battery level and notify if low
      if (this.energyStats.value.batteryLevel < 20) {
        notificationService.warning('Low battery warning: ' + this.energyStats.value.batteryLevel + '%');
      }

      return this.energyStats.value;
    } catch (error) {
      console.error('Error updating energy stats:', error);
      throw error;
    }
  }

  calculateSolarInput() {
    // Simulate solar input based on time of day
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 18;
    const peakHour = 12;
    const distanceFromPeak = Math.abs(hour - peakHour);
    
    if (!isDaytime) return 0;
    
    // Simulate bell curve of solar input
    return Math.max(0, 100 - (distanceFromPeak * 10));
  }

  calculatePowerConsumption() {
    // Simulate power consumption based on usage patterns
    const hour = new Date().getHours();
    const isPeakHours = (hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17);
    
    return isPeakHours ? 80 : 40;
  }

  calculateRuntime() {
    const { batteryLevel, powerConsumption } = this.energyStats.value;
    if (powerConsumption === 0) return 0;
    
    // Calculate estimated runtime in hours
    return (batteryLevel / powerConsumption) * 2;
  }

  async getEnergyStats() {
    try {
      // Try to get from local storage first
      const localStats = await offlineStorage.getEnergyStats();
      if (localStats) {
        this.energyStats.value = localStats;
      }

      // If online, try to sync with server
      if (navigator.onLine) {
        await this.updateEnergyStats();
      }

      return this.energyStats.value;
    } catch (error) {
      console.error('Error fetching energy stats:', error);
      throw error;
    }
  }

  async getEnergyHistory(days = 7) {
    try {
      // Try to get from local storage first
      const localHistory = await offlineStorage.getEnergyHistory(days);
      
      if (navigator.onLine) {
        // If online, try to fetch from server
        const response = await axios.get(`${API_URL}/energy/history?days=${days}`);
        const serverHistory = response.data;
        
        // Merge and deduplicate history
        const mergedHistory = this.mergeEnergyHistory(localHistory, serverHistory);
        await offlineStorage.setEnergyHistory(mergedHistory);
        return mergedHistory;
      }

      return localHistory;
    } catch (error) {
      console.error('Error fetching energy history:', error);
      throw error;
    }
  }

  mergeEnergyHistory(localHistory, serverHistory) {
    const merged = [...localHistory];
    const localTimestamps = new Set(localHistory.map(h => h.timestamp));

    serverHistory.forEach(record => {
      if (!localTimestamps.has(record.timestamp)) {
        merged.push(record);
      }
    });

    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async syncEnergyData() {
    try {
      if (!navigator.onLine) {
        notificationService.warning('Cannot sync energy data while offline');
        return;
      }

      const unsyncedData = await offlineStorage.getUnsyncedEnergyData();
      
      for (const data of unsyncedData) {
        await axios.post(`${API_URL}/energy/sync`, data);
        await offlineStorage.markEnergyDataSynced(data.id);
      }

      notificationService.success('Energy data synced successfully');
    } catch (error) {
      console.error('Error syncing energy data:', error);
      notificationService.error('Failed to sync energy data');
      throw error;
    }
  }

  getMonitoringStatus() {
    return this.isMonitoring.value;
  }
}

export const energyMonitorService = new EnergyMonitorService(); 