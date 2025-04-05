// src/services/api.js

/**
 * API service for communicating with the backend
 * This service handles both online and offline modes
 */

import { offlineStorage } from './offlineStorage';

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Check if we're online
const isOnline = () => navigator.onLine;

// Generic fetch wrapper with offline handling
const fetchWithOfflineSupport = async (url, options = {}) => {
  // If we're online, try to fetch from the API
  if (isOnline()) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      // If fetch fails, fall back to offline storage
      return handleOfflineFallback(url, options);
    }
  } else {
    // If we're offline, use offline storage
    return handleOfflineFallback(url, options);
  }
};

// Handle offline fallback based on the request
const handleOfflineFallback = async (url, options) => {
  const method = options.method || 'GET';
  const urlParts = url.replace(API_URL, '').split('/').filter(Boolean);
  const resource = urlParts[0];
  const id = urlParts[1];
  
  // Parse request body if it exists
  let data = null;
  if (options.body) {
    try {
      data = JSON.parse(options.body);
    } catch (e) {
      console.error('Error parsing request body:', e);
    }
  }
  
  // Handle different resources
  switch (resource) {
    case 'patients':
      return handlePatientsOffline(method, id, data);
    case 'diagnose':
      return handleDiagnoseOffline(method, id, data);
    case 'energy':
      return handleEnergyOffline(method, id, data);
    case 'sync':
      return handleSyncOffline(method, id, data);
    default:
      throw new Error(`Unsupported offline resource: ${resource}`);
  }
};

// Handle patients resource offline
const handlePatientsOffline = async (method, id, data) => {
  switch (method) {
    case 'GET':
      if (id) {
        return offlineStorage.getPatientById(parseInt(id));
      } else {
        return offlineStorage.getAllPatients();
      }
    case 'POST':
      return offlineStorage.addPatient(data);
    case 'PUT':
      return offlineStorage.updatePatient(data);
    case 'DELETE':
      return offlineStorage.deletePatient(parseInt(id));
    default:
      throw new Error(`Unsupported method for patients: ${method}`);
  }
};

// Handle diagnose resource offline
const handleDiagnoseOffline = async (method, id, data) => {
  switch (method) {
    case 'GET':
      if (id) {
        return offlineStorage.getDiagnosisById(parseInt(id));
      } else {
        return offlineStorage.getAllDiagnoses();
      }
    case 'POST':
      // Simulate AI diagnosis with simple matching
      const symptoms = data.symptoms.toLowerCase();
      let diagnosis = 'Unknown condition';
      let confidence = 0.3;
      
      // Simple keyword matching for offline diagnosis
      const conditions = {
        'malaria': ['fever', 'chills', 'headache', 'sweating', 'nausea'],
        'pneumonia': ['cough', 'fever', 'difficulty breathing', 'chest pain'],
        'covid19': ['fever', 'cough', 'fatigue', 'loss of taste', 'loss of smell'],
        'tuberculosis': ['cough', 'weight loss', 'night sweats', 'fever'],
        'maternal complication': ['abdominal pain', 'bleeding', 'swelling', 'headache']
      };
      
      // Check for matches
      for (const [condition, keywords] of Object.entries(conditions)) {
        const matchCount = keywords.filter(keyword => symptoms.includes(keyword)).length;
        if (matchCount > 0) {
          const matchConfidence = matchCount / keywords.length;
          if (matchConfidence > confidence) {
            diagnosis = condition;
            confidence = matchConfidence;
          }
        }
      }
      
      // Create diagnosis object
      const diagnosisObj = {
        patient_id: data.patient_id,
        symptoms: data.symptoms,
        diagnosis: diagnosis,
        confidence: confidence,
        image_path: data.image_path || null,
        voice_path: data.voice_path || null,
        created_at: new Date(),
        synced: false
      };
      
      return offlineStorage.addDiagnosis(diagnosisObj);
    case 'PUT':
      return offlineStorage.updateDiagnosis(data);
    case 'DELETE':
      return offlineStorage.deleteDiagnosis(parseInt(id));
    default:
      throw new Error(`Unsupported method for diagnose: ${method}`);
  }
};

// Handle energy resource offline
const handleEnergyOffline = async (method, id, data) => {
  switch (method) {
    case 'GET':
      if (id) {
        return offlineStorage.getEnergyLogById(parseInt(id));
      } else if (id === 'latest') {
        const logs = await offlineStorage.getAllEnergyLogs();
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
      } else {
        return offlineStorage.getAllEnergyLogs();
      }
    case 'POST':
      return offlineStorage.addEnergyLog(data);
    case 'PUT':
      return offlineStorage.updateEnergyLog(data);
    case 'DELETE':
      return offlineStorage.deleteEnergyLog(parseInt(id));
    default:
      throw new Error(`Unsupported method for energy: ${method}`);
  }
};

// Handle sync resource offline
const handleSyncOffline = async (method, id, data) => {
  // When offline, we can't actually sync, so just return status
  if (id === 'status') {
    const unsyncedPatients = await offlineStorage.getUnsyncedPatients();
    const unsyncedDiagnoses = await offlineStorage.getUnsyncedDiagnoses();
    const unsyncedEnergyLogs = await offlineStorage.getUnsyncedEnergyLogs();
    
    return {
      unsynced_patients: unsyncedPatients.length,
      unsynced_diagnoses: unsyncedDiagnoses.length,
      unsynced_energy_logs: unsyncedEnergyLogs.length,
      total_unsynced: unsyncedPatients.length + unsyncedDiagnoses.length + unsyncedEnergyLogs.length,
      last_sync: await offlineStorage.getSetting('last_sync', 'Never')
    };
  }
  
  // For sync attempt, just return that we're offline
  return {
    success: false,
    message: 'Cannot sync while offline',
    timestamp: new Date().toISOString()
  };
};

// Sync data when online
const syncData = async () => {
  if (!isOnline()) {
    return {
      success: false,
      message: 'Cannot sync while offline'
    };
  }
  
  try {
    // Get all unsynced data
    const patients = await offlineStorage.getUnsyncedPatients();
    const diagnoses = await offlineStorage.getUnsyncedDiagnoses();
    const energyLogs = await offlineStorage.getUnsyncedEnergyLogs();
    
    // Sync patients
    for (const patient of patients) {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
      });
      
      if (response.ok) {
        await offlineStorage.markPatientsAsSynced([patient.id]);
      }
    }
    
    // Sync diagnoses
    for (const diagnosis of diagnoses) {
      const response = await fetch(`${API_URL}/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(diagnosis)
      });
      
      if (response.ok) {
        await offlineStorage.markDiagnosesAsSynced([diagnosis.id]);
      }
    }
    
    // Sync energy logs
    for (const energyLog of energyLogs) {
      const response = await fetch(`${API_URL}/energy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(energyLog)
      });
      
      if (response.ok) {
        await offlineStorage.markEnergyLogsAsSynced([energyLog.id]);
      }
    }
    
    // Update last sync time
    await offlineStorage.saveSetting('last_sync', new Date().toISOString());
    
    return {
      success: true,
      synced_patients: patients.length,
      synced_diagnoses: diagnoses.length,
      synced_energy_logs: energyLogs.length,
      message: 'Data successfully synced to cloud'
    };
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      message: `Sync failed: ${error.message}`
    };
  }
};

// API methods
export default {
  // Patients
  getPatients: () => fetchWithOfflineSupport(`${API_URL}/patients`),
  getPatient: (id) => fetchWithOfflineSupport(`${API_URL}/patients/${id}`),
  createPatient: (patient) => fetchWithOfflineSupport(`${API_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patient)
  }),
  updatePatient: (id, patient) => fetchWithOfflineSupport(`${API_URL}/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patient)
  }),
  deletePatient: (id) => fetchWithOfflineSupport(`${API_URL}/patients/${id}`, {
    method: 'DELETE'
  }),
  
  // Diagnoses
  getDiagnoses: () => fetchWithOfflineSupport(`${API_URL}/diagnose`),
  getDiagnosis: (id) => fetchWithOfflineSupport(`${API_URL}/diagnose/${id}`),
  createDiagnosis: (diagnosis) => fetchWithOfflineSupport(`${API_URL}/diagnose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(diagnosis)
  }),
  
  // Energy
  getEnergyLogs: () => fetchWithOfflineSupport(`${API_URL}/energy`),
  getLatestEnergyLog: () => fetchWithOfflineSupport(`${API_URL}/energy/latest`),
  createEnergyLog: (energyLog) => fetchWithOfflineSupport(`${API_URL}/energy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(energyLog)
  }),
  simulateEnergyLog: () => fetchWithOfflineSupport(`${API_URL}/energy/simulate`),
  
  // Sync
  syncData,
  getSyncStatus: () => fetchWithOfflineSupport(`${API_URL}/sync/status`),
  
  // Utility
  isOnline
};
