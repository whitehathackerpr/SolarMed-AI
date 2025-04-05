import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';

const API_URL = import.meta.env.VITE_API_URL;

class PatientService {
  constructor() {
    this.patients = ref([]);
    this.currentPatient = ref(null);
    this.isLoading = ref(false);
  }

  async createPatient(patientData) {
    try {
      this.isLoading.value = true;
      notificationService.info('Creating patient record...');

      // Generate a unique ID for the patient
      const patientId = this.generatePatientId(patientData);
      const patient = {
        ...patientData,
        id: patientId,
        createdAt: new Date().toISOString(),
        synced: false
      };

      // Store locally first
      await offlineStorage.addPatient(patient);
      this.patients.value.push(patient);

      // Try to sync with server if online
      if (navigator.onLine) {
        await this.syncPatient(patient);
      } else {
        // Store for later processing
        await offlineStorage.addToSyncQueue({
          type: 'patient',
          action: 'create',
          data: patient
        });
        notificationService.warning('Patient will be synced when online');
      }

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      notificationService.error('Failed to create patient');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  async getPatient(id) {
    try {
      // Try to get from local storage first
      let patient = await offlineStorage.getPatient(id);
      
      if (!patient && navigator.onLine) {
        // If not found locally and online, try to fetch from server
        const response = await axios.get(`${API_URL}/patients/${id}`);
        patient = response.data;
        
        // Store locally for offline access
        await offlineStorage.addPatient(patient);
      }

      return patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async getAllPatients() {
    try {
      // Get all patients from local storage
      const localPatients = await offlineStorage.getAllPatients();
      this.patients.value = localPatients;

      // If online, try to sync with server
      if (navigator.onLine) {
        await this.syncPatients();
      }

      return this.patients.value;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async updatePatient(id, updates) {
    try {
      // Update locally first
      const updatedPatient = await offlineStorage.updatePatient(id, {
        ...updates,
        synced: false
      });

      // Update in memory
      const index = this.patients.value.findIndex(p => p.id === id);
      if (index !== -1) {
        this.patients.value[index] = updatedPatient;
      }

      // Try to sync with server if online
      if (navigator.onLine) {
        await this.syncPatient(updatedPatient);
      }

      notificationService.success('Patient updated successfully');
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      notificationService.error('Failed to update patient');
      throw error;
    }
  }

  async deletePatient(id) {
    try {
      // Delete locally first
      await offlineStorage.deletePatient(id);

      // Remove from memory
      this.patients.value = this.patients.value.filter(p => p.id !== id);

      // Try to sync with server if online
      if (navigator.onLine) {
        await axios.delete(`${API_URL}/patients/${id}`);
      }

      notificationService.success('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      notificationService.error('Failed to delete patient');
      throw error;
    }
  }

  async syncPatient(patient) {
    try {
      if (patient.synced) return;

      if (patient.id) {
        // Update existing patient
        await axios.put(`${API_URL}/patients/${patient.id}`, patient);
      } else {
        // Create new patient
        const response = await axios.post(`${API_URL}/patients`, patient);
        patient.id = response.data.id;
      }

      // Mark as synced
      await offlineStorage.updatePatient(patient.id, { synced: true });
      notificationService.success('Patient data synced successfully');
    } catch (error) {
      console.error('Error syncing patient:', error);
      notificationService.error('Failed to sync patient data');
      throw error;
    }
  }

  async syncPatients() {
    try {
      const unsyncedPatients = await offlineStorage.getUnsyncedData();
      const patientData = unsyncedPatients.filter(data => data.type === 'patient');
      
      for (const data of patientData) {
        await this.syncPatient(data.data);
      }
    } catch (error) {
      console.error('Error syncing patients:', error);
      throw error;
    }
  }

  generatePatientId(patientData) {
    // Generate a unique ID based on name and timestamp
    const timestamp = Date.now().toString(36);
    const nameHash = this.hashString(`${patientData.firstName}${patientData.lastName}`);
    return `PT-${timestamp}-${nameHash}`;
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

  setCurrentPatient(patient) {
    this.currentPatient.value = patient;
  }

  getCurrentPatient() {
    return this.currentPatient.value;
  }

  getLoadingStatus() {
    return this.isLoading.value;
  }
}

export const patientService = new PatientService(); 