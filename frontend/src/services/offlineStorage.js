// src/services/offlineStorage.js

/**
 * IndexedDB service for offline data storage
 * This service provides methods to store and retrieve data when offline
 */

import { openDB } from 'idb';

class OfflineStorage {
  constructor() {
    this.db = null;
    this.initializeDB();
  }

  async initializeDB() {
    try {
      this.db = await openDB('solarmed-ai', 1, {
        upgrade(db) {
          // Patients store
          if (!db.objectStoreNames.contains('patients')) {
            const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
            patientsStore.createIndex('lastName', 'lastName');
            patientsStore.createIndex('createdAt', 'createdAt');
          }

          // Diagnoses store
          if (!db.objectStoreNames.contains('diagnoses')) {
            const diagnosesStore = db.createObjectStore('diagnoses', { keyPath: 'id' });
            diagnosesStore.createIndex('patientId', 'patientId');
            diagnosesStore.createIndex('createdAt', 'createdAt');
          }

          // Photos store
          if (!db.objectStoreNames.contains('photos')) {
            const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
            photosStore.createIndex('patientId', 'patientId');
            photosStore.createIndex('timestamp', 'metadata.timestamp');
          }

          // Transcripts store
          if (!db.objectStoreNames.contains('transcripts')) {
            const transcriptsStore = db.createObjectStore('transcripts', { keyPath: 'id' });
            transcriptsStore.createIndex('patientId', 'patientId');
            transcriptsStore.createIndex('timestamp', 'timestamp');
          }

          // Energy stats store
          if (!db.objectStoreNames.contains('energyStats')) {
            db.createObjectStore('energyStats', { keyPath: 'timestamp' });
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncQueueStore.createIndex('type', 'type');
            syncQueueStore.createIndex('timestamp', 'timestamp');
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      throw error;
    }
  }

  // Patient operations
  async addPatient(patient) {
    try {
      await this.db.add('patients', patient);
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  }

  async getPatient(id) {
    try {
      return await this.db.get('patients', id);
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  async getAllPatients() {
    try {
      return await this.db.getAll('patients');
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw error;
    }
  }

  async updatePatient(id, updates) {
    try {
      const patient = await this.getPatient(id);
      if (!patient) throw new Error('Patient not found');
      
      const updatedPatient = { ...patient, ...updates };
      await this.db.put('patients', updatedPatient);
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id) {
    try {
      await this.db.delete('patients', id);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  // Diagnosis operations
  async addDiagnosis(diagnosis) {
    try {
      await this.db.add('diagnoses', diagnosis);
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      throw error;
    }
  }

  async getDiagnosis(id) {
    try {
      return await this.db.get('diagnoses', id);
    } catch (error) {
      console.error('Error getting diagnosis:', error);
      throw error;
    }
  }

  async getAllDiagnoses() {
    try {
      return await this.db.getAll('diagnoses');
    } catch (error) {
      console.error('Error getting all diagnoses:', error);
      throw error;
    }
  }

  async getPatientDiagnoses(patientId) {
    try {
      return await this.db.getAllFromIndex('diagnoses', 'patientId', patientId);
    } catch (error) {
      console.error('Error getting patient diagnoses:', error);
      throw error;
    }
  }

  async updateDiagnosis(id, updates) {
    try {
      const diagnosis = await this.getDiagnosis(id);
      if (!diagnosis) throw new Error('Diagnosis not found');
      
      const updatedDiagnosis = { ...diagnosis, ...updates };
      await this.db.put('diagnoses', updatedDiagnosis);
      return updatedDiagnosis;
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      throw error;
    }
  }

  async deleteDiagnosis(id) {
    try {
      await this.db.delete('diagnoses', id);
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      throw error;
    }
  }

  // Photo operations
  async addPhoto(photo) {
    try {
      await this.db.add('photos', photo);
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  }

  async getPhotos(patientId) {
    try {
      return await this.db.getAllFromIndex('photos', 'patientId', patientId);
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  }

  async updatePhoto(id, updates) {
    try {
      const photo = await this.db.get('photos', id);
      if (!photo) throw new Error('Photo not found');
      
      const updatedPhoto = { ...photo, ...updates };
      await this.db.put('photos', updatedPhoto);
      return updatedPhoto;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  }

  async deletePhoto(id) {
    try {
      await this.db.delete('photos', id);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  // Transcript operations
  async addTranscript(transcript) {
    try {
      await this.db.add('transcripts', transcript);
    } catch (error) {
      console.error('Error adding transcript:', error);
      throw error;
    }
  }

  async getTranscripts(patientId) {
    try {
      return await this.db.getAllFromIndex('transcripts', 'patientId', patientId);
    } catch (error) {
      console.error('Error getting transcripts:', error);
      throw error;
    }
  }

  async deleteTranscript(id) {
    try {
      await this.db.delete('transcripts', id);
    } catch (error) {
      console.error('Error deleting transcript:', error);
      throw error;
    }
  }

  // Energy stats operations
  async setEnergyStats(stats) {
    try {
      await this.db.put('energyStats', stats);
    } catch (error) {
      console.error('Error setting energy stats:', error);
      throw error;
    }
  }

  async getEnergyStats() {
    try {
      return await this.db.get('energyStats', 'current');
    } catch (error) {
      console.error('Error getting energy stats:', error);
      throw error;
    }
  }

  // Sync queue operations
  async addToSyncQueue(item) {
    try {
      const id = Date.now().toString(36);
      await this.db.add('syncQueue', { ...item, id, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async getUnsyncedData() {
    try {
      return await this.db.getAll('syncQueue');
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      throw error;
    }
  }

  async removeFromSyncQueue(id) {
    try {
      await this.db.delete('syncQueue', id);
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      throw error;
    }
  }

  async clearSyncQueue() {
    try {
      await this.db.clear('syncQueue');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error;
    }
  }

  // Settings operations
  async setSetting(key, value) {
    try {
      await this.db.put('settings', { key, value });
    } catch (error) {
      console.error('Error setting setting:', error);
      throw error;
    }
  }

  async getSetting(key) {
    try {
      const setting = await this.db.get('settings', key);
      return setting ? setting.value : null;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  // Utility methods
  async clearAll() {
    try {
      const stores = [
        'patients',
        'diagnoses',
        'photos',
        'transcripts',
        'energyStats',
        'syncQueue',
        'settings'
      ];

      for (const store of stores) {
        await this.db.clear(store);
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async getStorageUsage() {
    try {
      const stores = [
        'patients',
        'diagnoses',
        'photos',
        'transcripts',
        'energyStats',
        'syncQueue',
        'settings'
      ];

      let totalSize = 0;

      for (const store of stores) {
        const count = await this.db.count(store);
        totalSize += count;
      }

      return {
        totalItems: totalSize,
        stores: await Promise.all(
          stores.map(async (store) => ({
            name: store,
            count: await this.db.count(store)
          }))
        )
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  }
}

export const offlineStorage = new OfflineStorage();
