import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';
import { patientService } from './patientService';

const API_URL = import.meta.env.VITE_API_URL;

class DiagnosisService {
  constructor() {
    this.diagnoses = ref([]);
    this.currentDiagnosis = ref(null);
    this.isProcessing = ref(false);
  }

  async createDiagnosis(diagnosisData) {
    try {
      this.isProcessing.value = true;
      notificationService.info('Processing diagnosis...');

      // Generate a unique ID for the diagnosis
      const diagnosisId = this.generateDiagnosisId(diagnosisData);
      const diagnosis = {
        ...diagnosisData,
        id: diagnosisId,
        createdAt: new Date().toISOString(),
        synced: false,
        status: 'pending'
      };

      // Store locally first
      await offlineStorage.addDiagnosis(diagnosis);
      this.diagnoses.value.push(diagnosis);

      // Try to get prediction if online
      if (navigator.onLine) {
        await this.getPrediction(diagnosis);
      } else {
        // Store for later processing
        await offlineStorage.addToSyncQueue({
          type: 'diagnosis',
          action: 'predict',
          data: diagnosis
        });
        notificationService.warning('Diagnosis will be processed when online');
      }

      return diagnosis;
    } catch (error) {
      console.error('Error creating diagnosis:', error);
      notificationService.error('Failed to create diagnosis');
      throw error;
    } finally {
      this.isProcessing.value = false;
    }
  }

  async getPrediction(diagnosis) {
    try {
      const formData = new FormData();
      
      // Add symptoms
      formData.append('symptoms', JSON.stringify(diagnosis.symptoms));
      
      // Add image if present
      if (diagnosis.image) {
        formData.append('image', diagnosis.image);
      }
      
      // Add voice input if present
      if (diagnosis.voiceInput) {
        formData.append('voiceInput', diagnosis.voiceInput);
      }

      // Add patient ID
      formData.append('patientId', diagnosis.patientId);

      const response = await axios.post(`${API_URL}/diagnose`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update diagnosis with prediction
      const updatedDiagnosis = {
        ...diagnosis,
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations,
        status: 'completed',
        synced: true
      };

      await offlineStorage.updateDiagnosis(diagnosis.id, updatedDiagnosis);
      return updatedDiagnosis;
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  async getDiagnosis(id) {
    try {
      // Try to get from local storage first
      let diagnosis = await offlineStorage.getDiagnosis(id);
      
      if (!diagnosis && navigator.onLine) {
        // If not found locally and online, try to fetch from server
        const response = await axios.get(`${API_URL}/diagnoses/${id}`);
        diagnosis = response.data;
        
        // Store locally for offline access
        await offlineStorage.addDiagnosis(diagnosis);
      }

      return diagnosis;
    } catch (error) {
      console.error('Error fetching diagnosis:', error);
      throw error;
    }
  }

  async getAllDiagnoses() {
    try {
      // Get all diagnoses from local storage
      const localDiagnoses = await offlineStorage.getAllDiagnoses();
      this.diagnoses.value = localDiagnoses;

      // If online, try to sync with server
      if (navigator.onLine) {
        await this.syncDiagnoses();
      }

      return this.diagnoses.value;
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      throw error;
    }
  }

  async getPatientDiagnoses(patientId) {
    try {
      const allDiagnoses = await this.getAllDiagnoses();
      return allDiagnoses.filter(d => d.patientId === patientId);
    } catch (error) {
      console.error('Error fetching patient diagnoses:', error);
      throw error;
    }
  }

  async updateDiagnosis(id, updates) {
    try {
      // Update locally first
      const updatedDiagnosis = await offlineStorage.updateDiagnosis(id, {
        ...updates,
        synced: false
      });

      // Update in memory
      const index = this.diagnoses.value.findIndex(d => d.id === id);
      if (index !== -1) {
        this.diagnoses.value[index] = updatedDiagnosis;
      }

      // Try to sync with server if online
      if (navigator.onLine) {
        await this.syncDiagnosis(updatedDiagnosis);
      }

      notificationService.success('Diagnosis updated successfully');
      return updatedDiagnosis;
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      notificationService.error('Failed to update diagnosis');
      throw error;
    }
  }

  async deleteDiagnosis(id) {
    try {
      // Delete locally first
      await offlineStorage.deleteDiagnosis(id);

      // Remove from memory
      this.diagnoses.value = this.diagnoses.value.filter(d => d.id !== id);

      // Try to sync with server if online
      if (navigator.onLine) {
        await axios.delete(`${API_URL}/diagnoses/${id}`);
      }

      notificationService.success('Diagnosis deleted successfully');
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      notificationService.error('Failed to delete diagnosis');
      throw error;
    }
  }

  async syncDiagnosis(diagnosis) {
    try {
      if (diagnosis.synced) return;

      if (diagnosis.id) {
        // Update existing diagnosis
        await axios.put(`${API_URL}/diagnoses/${diagnosis.id}`, diagnosis);
      } else {
        // Create new diagnosis
        const response = await axios.post(`${API_URL}/diagnoses`, diagnosis);
        diagnosis.id = response.data.id;
      }

      // Mark as synced
      await offlineStorage.updateDiagnosis(diagnosis.id, { synced: true });
      notificationService.success('Diagnosis data synced successfully');
    } catch (error) {
      console.error('Error syncing diagnosis:', error);
      notificationService.error('Failed to sync diagnosis data');
      throw error;
    }
  }

  async syncDiagnoses() {
    try {
      const unsyncedDiagnoses = await offlineStorage.getUnsyncedDiagnoses();
      
      for (const diagnosis of unsyncedDiagnoses) {
        await this.syncDiagnosis(diagnosis);
      }
    } catch (error) {
      console.error('Error syncing diagnoses:', error);
      throw error;
    }
  }

  generateDiagnosisId(diagnosisData) {
    // Generate a unique ID based on patient ID and timestamp
    const timestamp = Date.now().toString(36);
    const patientHash = this.hashString(diagnosisData.patientId);
    return `DX-${timestamp}-${patientHash}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 4);
  }

  setCurrentDiagnosis(diagnosis) {
    this.currentDiagnosis.value = diagnosis;
  }

  getCurrentDiagnosis() {
    return this.currentDiagnosis.value;
  }

  getProcessingStatus() {
    return this.isProcessing.value;
  }
}

export const diagnosisService = new DiagnosisService(); 