<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-primary mb-4">Dashboard</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- System Status Card -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-lg font-medium text-primary-dark mb-3">System Status</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Connection:</span>
              <span class="font-medium" :class="isOnline ? 'text-green-600' : 'text-red-600'">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Battery Level:</span>
              <span class="font-medium">{{ batteryLevel }}%</span>
            </div>
            <div class="flex justify-between">
              <span>Solar Input:</span>
              <span class="font-medium">{{ solarInput }} W</span>
            </div>
            <div class="flex justify-between">
              <span>Unsynced Data:</span>
              <span class="font-medium">{{ unsyncedItems }}</span>
            </div>
            <div class="mt-4">
              <button 
                @click="syncData" 
                class="w-full btn btn-primary"
                :disabled="!isOnline || unsyncedItems === 0">
                Sync Data Now
              </button>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions Card -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-lg font-medium text-primary-dark mb-3">Quick Actions</h3>
          <div class="space-y-3">
            <button @click="$router.push('/patient-intake')" class="w-full btn btn-primary mb-2">
              New Patient Intake
            </button>
            <button @click="$router.push('/energy-monitor')" class="w-full btn btn-secondary">
              View Energy Status
            </button>
          </div>
        </div>
      </div>
      
      <!-- Recent Patients -->
      <div class="mt-6">
        <h3 class="text-lg font-medium text-primary-dark mb-3">Recent Patients</h3>
        <div v-if="loading" class="text-center py-4">
          <p>Loading patients...</p>
        </div>
        <div v-else-if="patients.length === 0" class="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-gray-500">No patients recorded yet</p>
          <button @click="$router.push('/patient-intake')" class="mt-2 btn btn-primary">
            Add First Patient
          </button>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="patient in patients" :key="patient.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ patient.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ patient.age }} / {{ patient.gender }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ patient.location }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(patient.updated_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button @click="viewPatient(patient.id)" class="text-primary hover:text-primary-dark mr-3">
                    View
                  </button>
                  <button @click="newDiagnosis(patient.id)" class="text-secondary hover:text-secondary-dark">
                    New Diagnosis
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      isOnline: navigator.onLine,
      batteryLevel: 85,
      solarInput: 12.5,
      unsyncedItems: 7,
      loading: true,
      patients: []
    }
  },
  mounted() {
    // Simulate loading patients
    setTimeout(() => {
      this.patients = [
        {
          id: 1,
          name: 'John Mukisa',
          age: 45,
          gender: 'Male',
          location: 'Kampala',
          updated_at: new Date(2025, 3, 4)
        },
        {
          id: 2,
          name: 'Sarah Nambi',
          age: 32,
          gender: 'Female',
          location: 'Jinja',
          updated_at: new Date(2025, 3, 3)
        },
        {
          id: 3,
          name: 'David Okello',
          age: 28,
          gender: 'Male',
          location: 'Entebbe',
          updated_at: new Date(2025, 3, 2)
        }
      ];
      this.loading = false;
    }, 1000);
    
    // In a real implementation, we would fetch data from the API
    // this.fetchPatients();
    // this.fetchSystemStatus();
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-UG');
    },
    viewPatient(patientId) {
      // Navigate to patient details
      console.log('View patient', patientId);
      // In a real implementation, this would navigate to a patient detail page
    },
    newDiagnosis(patientId) {
      // Navigate to diagnosis form with patient pre-selected
      this.$router.push({
        path: '/patient-intake',
        query: { patientId }
      });
    },
    syncData() {
      if (!this.isOnline) {
        // Show toast message from parent component
        this.$parent.showToastMessage('Cannot sync while offline');
        return;
      }
      
      // Simulate syncing
      this.$parent.showToastMessage('Syncing data...');
      setTimeout(() => {
        this.unsyncedItems = 0;
        this.$parent.showToastMessage('Data synced successfully');
      }, 2000);
      
      // In a real implementation, we would call the sync API
      // this.callSyncAPI();
    },
    fetchPatients() {
      // In a real implementation, this would fetch patients from the API
      // fetch('/api/patients')
      //   .then(response => response.json())
      //   .then(data => {
      //     this.patients = data;
      //     this.loading = false;
      //   })
      //   .catch(error => {
      //     console.error('Error fetching patients:', error);
      //     this.loading = false;
      //   });
    },
    fetchSystemStatus() {
      // In a real implementation, this would fetch system status from the API
      // fetch('/api/system/status')
      //   .then(response => response.json())
      //   .then(data => {
      //     this.batteryLevel = data.batteryLevel;
      //     this.solarInput = data.solarInput;
      //     this.unsyncedItems = data.unsyncedItems;
      //   })
      //   .catch(error => {
      //     console.error('Error fetching system status:', error);
      //   });
    }
  }
}
</script>
