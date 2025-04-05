// src/store/index.js

import { createStore } from 'vuex'
import api from '../services/api'
import offlineStorage from '../services/offlineStorage'

export default createStore({
  state: {
    isOnline: navigator.onLine,
    batteryLevel: 85,
    solarInput: 12.5,
    powerConsumption: 8.3,
    unsyncedItems: 0,
    patients: [],
    diagnoses: [],
    energyLogs: [],
    currentPatient: null,
    currentDiagnosis: null,
    settings: {
      offlineMode: true,
      storageLimit: '1000',
      syncFrequency: 'immediate',
      screenTimeout: '5',
      lowPowerMode: true,
      language: 'en',
      voiceLanguage: 'en',
      confidenceThreshold: 60,
      activeModels: {
        malaria: true,
        pneumonia: true,
        covid19: true,
        tuberculosis: true,
        maternal: true,
        diabetes: false,
        hypertension: false
      }
    },
    notifications: []
  },
  
  mutations: {
    SET_ONLINE_STATUS(state, status) {
      state.isOnline = status;
    },
    SET_BATTERY_LEVEL(state, level) {
      state.batteryLevel = level;
    },
    SET_SOLAR_INPUT(state, input) {
      state.solarInput = input;
    },
    SET_POWER_CONSUMPTION(state, consumption) {
      state.powerConsumption = consumption;
    },
    SET_UNSYNCED_ITEMS(state, count) {
      state.unsyncedItems = count;
    },
    SET_PATIENTS(state, patients) {
      state.patients = patients;
    },
    SET_DIAGNOSES(state, diagnoses) {
      state.diagnoses = diagnoses;
    },
    SET_ENERGY_LOGS(state, logs) {
      state.energyLogs = logs;
    },
    SET_CURRENT_PATIENT(state, patient) {
      state.currentPatient = patient;
    },
    SET_CURRENT_DIAGNOSIS(state, diagnosis) {
      state.currentDiagnosis = diagnosis;
    },
    SET_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        message: notification.message,
        type: notification.type || 'info',
        duration: notification.duration || 3000
      });
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    }
  },
  
  actions: {
    // Online status
    updateOnlineStatus({ commit, dispatch }, status) {
      commit('SET_ONLINE_STATUS', status);
      
      if (status) {
        // We're online, try to sync
        dispatch('syncData');
      }
    },
    
    // Energy monitoring
    async fetchEnergyStatus({ commit }) {
      try {
        const latestLog = await api.getLatestEnergyLog();
        if (latestLog) {
          commit('SET_BATTERY_LEVEL', latestLog.battery_level);
          commit('SET_SOLAR_INPUT', latestLog.solar_input);
          commit('SET_POWER_CONSUMPTION', latestLog.power_consumption);
        }
      } catch (error) {
        console.error('Error fetching energy status:', error);
      }
    },
    
    async simulateEnergyLog({ commit, dispatch }) {
      try {
        const log = await api.simulateEnergyLog();
        commit('SET_BATTERY_LEVEL', log.battery_level);
        commit('SET_SOLAR_INPUT', log.solar_input);
        commit('SET_POWER_CONSUMPTION', log.power_consumption);
        
        // Refresh energy logs
        dispatch('fetchEnergyLogs');
        
        return log;
      } catch (error) {
        console.error('Error simulating energy log:', error);
        throw error;
      }
    },
    
    // Patients
    async fetchPatients({ commit }) {
      try {
        const patients = await api.getPatients();
        commit('SET_PATIENTS', patients);
        return patients;
      } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
    },
    
    async fetchPatient({ commit }, id) {
      try {
        const patient = await api.getPatient(id);
        commit('SET_CURRENT_PATIENT', patient);
        return patient;
      } catch (error) {
        console.error(`Error fetching patient ${id}:`, error);
        throw error;
      }
    },
    
    async createPatient({ commit, dispatch }, patient) {
      try {
        const newPatient = await api.createPatient(patient);
        dispatch('fetchPatients');
        return newPatient;
      } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
      }
    },
    
    async updatePatient({ commit, dispatch }, { id, patient }) {
      try {
        const updatedPatient = await api.updatePatient(id, patient);
        dispatch('fetchPatients');
        return updatedPatient;
      } catch (error) {
        console.error(`Error updating patient ${id}:`, error);
        throw error;
      }
    },
    
    // Diagnoses
    async fetchDiagnoses({ commit }) {
      try {
        const diagnoses = await api.getDiagnoses();
        commit('SET_DIAGNOSES', diagnoses);
        return diagnoses;
      } catch (error) {
        console.error('Error fetching diagnoses:', error);
        throw error;
      }
    },
    
    async fetchDiagnosis({ commit }, id) {
      try {
        const diagnosis = await api.getDiagnosis(id);
        commit('SET_CURRENT_DIAGNOSIS', diagnosis);
        return diagnosis;
      } catch (error) {
        console.error(`Error fetching diagnosis ${id}:`, error);
        throw error;
      }
    },
    
    async createDiagnosis({ commit, dispatch }, diagnosis) {
      try {
        const newDiagnosis = await api.createDiagnosis(diagnosis);
        dispatch('fetchDiagnoses');
        return newDiagnosis;
      } catch (error) {
        console.error('Error creating diagnosis:', error);
        throw error;
      }
    },
    
    // Energy logs
    async fetchEnergyLogs({ commit }) {
      try {
        const logs = await api.getEnergyLogs();
        commit('SET_ENERGY_LOGS', logs);
        return logs;
      } catch (error) {
        console.error('Error fetching energy logs:', error);
        throw error;
      }
    },
    
    // Sync
    async syncData({ commit, dispatch }) {
      if (!api.isOnline()) {
        commit('ADD_NOTIFICATION', {
          message: 'Cannot sync while offline',
          type: 'warning'
        });
        return false;
      }
      
      try {
        commit('ADD_NOTIFICATION', {
          message: 'Syncing data...',
          type: 'info'
        });
        
        const result = await api.syncData();
        
        if (result.success) {
          commit('ADD_NOTIFICATION', {
            message: `Sync complete: ${result.synced_patients} patients, ${result.synced_diagnoses} diagnoses, ${result.synced_energy_logs} energy logs`,
            type: 'success'
          });
          
          // Refresh data
          dispatch('fetchSyncStatus');
          dispatch('fetchPatients');
          dispatch('fetchDiagnoses');
          dispatch('fetchEnergyLogs');
          
          return true;
        } else {
          commit('ADD_NOTIFICATION', {
            message: result.message,
            type: 'error'
          });
          return false;
        }
      } catch (error) {
        console.error('Error syncing data:', error);
        commit('ADD_NOTIFICATION', {
          message: `Sync failed: ${error.message}`,
          type: 'error'
        });
        return false;
      }
    },
    
    async fetchSyncStatus({ commit }) {
      try {
        const status = await api.getSyncStatus();
        commit('SET_UNSYNCED_ITEMS', status.total_unsynced);
        return status;
      } catch (error) {
        console.error('Error fetching sync status:', error);
        throw error;
      }
    },
    
    // Settings
    async loadSettings({ commit }) {
      try {
        // Try to load settings from offline storage
        const offlineMode = await offlineStorage.getSetting('offlineMode', true);
        const storageLimit = await offlineStorage.getSetting('storageLimit', '1000');
        const syncFrequency = await offlineStorage.getSetting('syncFrequency', 'immediate');
        const screenTimeout = await offlineStorage.getSetting('screenTimeout', '5');
        const lowPowerMode = await offlineStorage.getSetting('lowPowerMode', true);
        const language = await offlineStorage.getSetting('language', 'en');
        const voiceLanguage = await offlineStorage.getSetting('voiceLanguage', 'en');
        const confidenceThreshold = await offlineStorage.getSetting('confidenceThreshold', 60);
        const activeModels = await offlineStorage.getSetting('activeModels', {
          malaria: true,
          pneumonia: true,
          covid19: true,
          tuberculosis: true,
          maternal: true,
          diabetes: false,
          hypertension: false
        });
        
        commit('SET_SETTINGS', {
          offlineMode,
          storageLimit,
          syncFrequency,
          screenTimeout,
          lowPowerMode,
          language,
          voiceLanguage,
          confidenceThreshold,
          activeModels
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    },
    
    async saveSettings({ commit }, settings) {
      try {
        // Save settings to offline storage
        for (const [key, value] of Object.entries(settings)) {
          await offlineStorage.saveSetting(key, value);
        }
        
        commit('SET_SETTINGS', settings);
        commit('ADD_NOTIFICATION', {
          message: 'Settings saved successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        commit('ADD_NOTIFICATION', {
          message: `Error saving settings: ${error.message}`,
          type: 'error'
        });
      }
    },
    
    // Notifications
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
      
      if (notification.duration !== 0) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', notification.id);
        }, notification.duration || 3000);
      }
    },
    
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    }
  },
  
  getters: {
    isOnline: state => state.isOnline,
    batteryLevel: state => state.batteryLevel,
    solarInput: state => state.solarInput,
    powerConsumption: state => state.powerConsumption,
    unsyncedItems: state => state.unsyncedItems,
    patients: state => state.patients,
    diagnoses: state => state.diagnoses,
    energyLogs: state => state.energyLogs,
    currentPatient: state => state.currentPatient,
    currentDiagnosis: state => state.currentDiagnosis,
    settings: state => state.settings,
    notifications: state => state.notifications
  }
})
